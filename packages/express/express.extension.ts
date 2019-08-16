import { ExtensionOptions, KitesExtension, KitesInstance } from '@kites/core';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, RequestHandler, Router } from 'express';
import http from 'http';
import * as _ from 'lodash';
import { mixinReq } from './req';
import { mixinRes } from './res';
import { mixinResView } from './res.view';
import { defaultRouter } from './routes';

interface KitesExtensionOptions extends ExtensionOptions {
  routers: Router[];
  routes: Array<string | RequestHandler>;
}

/**
 * Kites Express Extension
 */
export class ExpressExtension implements KitesExtension {

  name: string;
  options: KitesExtensionOptions;
  app: Express;

  constructor(
    private kites: KitesInstance,
    private opts: KitesExtensionOptions
  ) {
    this.options = _.assign(this.options, {}, opts);
  }

  logStart() {
    if (this.kites.express.server) {
      const port = this.kites.express.server.address().port;
      this.kites.logger.info(
        'kites server successfully started on http port: ' + port);
    } else {
      this.kites.logger.warn(
        'kites server successfully started, but can not found server, express port config: ' +
        this.options.httpPort);
    }
  }

  init() {
    const kites = this.kites;
    this.app = this.options.app;

    if (this.app) {
      kites.logger.info('Configuring routes for existing express app.');
      this.configureViewEngine(this.app, this.options.views);
      this.configureExpressApp(this.app, kites);

      if (this.options.server) {
        kites.logger.info('Using existing server instance.');
        kites.express.server = this.options.server;
        // deleting server option otherwise requests to list available
        // extensions
        if (this.options != null) {
          delete this.options.server;
        }
      }

    } else {
      this.app = express();
      kites.logger.info('Creating default express app.');

      // initializing views
      this.configureViewEngine(this.app, this.options.views);
      this.configureExpressApp(this.app, kites);
      this.startExpressApp(this.app, kites, this.options)
        .then(() => { this.logStart(); });
    }
  }

  configureViewEngine(app: Express, opts: any) {
    var configView = this.kites.emit('express:config:view', app, opts);
    if (configView) {
      this.kites.logger.debug('Express view engine has customized by user!');
      return;
    }

    // checking if engine is not specified
    if (!opts || !opts.engine) {
      this.kites.logger.debug(
        'No view engine configuration is sepecified: -> Disabled.');
      return;
    }

    var module;
    var args;
    var engine;

    var module = require(opts.engine);
    if (_.isObject(opts.renderer) &&
      _.isFunction(module[opts.renderer.method])) {
      args = _.isArray(opts.renderer.arguments) ?
        opts.renderer.arguments.slice() :
        [];
      engine = module[opts.renderer.method].apply(null, args);

    } else if (_.isString(opts.renderer) &&
      _.isFunction(module[opts.renderer])) {
      engine = module[opts.renderer];

    } else if (_.isFunction(module[opts.ext])) {
      engine = module[opts.ext];

    } else if (!_.isUndefined(opts.arguments)) {
      args = _.isArray(opts.arguments) ? opts.arguments.slice() : [];
      engine = module.apply(null, args);

    } else {
      engine = module;
    }

    try {
      // if `ext` is not sepecified.
      var ext = opts.ext || opts.engine;
      // get views path option from original arguments
      var viewPath = this.kites.defaultPath(this.opts.views.path || 'views');

      // apply engine
      this.kites.logger.debug(`Configure view engine:
            + ext: ${opts.ext}
            + engine: ${opts.engine}
            + renderer: ${opts.renderer}
            + path: ${viewPath}
            `);

      // make sure engine is a function
      if (typeof engine === 'function') {
        app.engine(ext, engine);
      }

      // config views engine and path.
      app.set('view engine', ext);
      app.set('views', viewPath);
    } catch (err) {
      this.kites.logger.error('Configure view engine error: ', err);
    }
  }

  configureExpressApp(app: Express, kites: KitesInstance) {
    kites.express.app = app;

    app.options('*', cors({
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'MERGE'],
      origin: true
    }));

    // show powered by
    if (!this.options.poweredBy) {
      app.disable('x-powered-by');
    } else {
      app.use((req, res, next) => {
        res.setHeader('X-Powered-By', this.options.poweredBy);
        next();
      });
    }

    app.use(bodyParser.urlencoded({
      extended: false,
      limit: this.options.inputRequestLimit || '10mb'
    }));
    app.use(bodyParser.json({
      limit: this.options.inputRequestLimit || '10mb'
    }));
    app.use(cookieParser());
    app.use(cors());

    kites.logger.debug('Express expanding ...');

    app.use(mixinReq(kites));
    app.use(mixinRes(kites));
    app.use(mixinResView(kites));

    kites.emit('before:express:config', app);
    app.use('/_kites', defaultRouter());

    kites.logger.debug('Express starting configure ...');
    kites.emit('express:config', app);

    // config static file
    if (typeof this.options.static === 'string') {
      kites.logger.debug('Express serve static files at: ' + this.options.static);
      app.use(express.static(this.options.static));
    }

    kites.logger.debug('Express configuration has done!');
  }

  startExpressApp(app: Express, kites: KitesInstance,
                  options: ExtensionOptions) {
    var httpPort = process.env.PORT || options.httpPort || 3000;
    // create http server.
    kites.express.server = http.createServer(app);
    kites.logger.debug('Express is going to listen on ' + httpPort);
    return this.startHttpServerAsync(kites, kites.express.server, httpPort);
  }

  startHttpServerAsync(kites: KitesInstance, server: http.Server,
                       port: number | string) {
    return new Promise((resolve, reject) => {
      server.on('error', (err) => {
        kites.logger.error(
          `Error when starting http server on port ${port} ${err.stack}`);
        reject(err);
      }).on('listen', () => { resolve(); });

      server.listen(port, kites.options.hostname, resolve);
    });
  }
}
