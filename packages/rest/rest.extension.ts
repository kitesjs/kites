
import * as express from 'express';

import { Container, ExtensionOptions, IKites, KitesExtension } from '@kites/core';
import { OutgoingHttpHeaders } from 'http';
import { PARAMETER_TYPE, TYPE } from './constants';
import { IController, Middleware, ParameterMetadata } from './interfaces';
import { HttpResponseMessage } from './results/http-response-message';
import { GetControllerMetadata, GetControllerMethodMetadata, GetControllerParameterMetadata, GetControllersFromContainer, GetControllersFromMetadata } from './utils';

/**
 * Main Extension
 */
class RestExtension implements KitesExtension {
  name: string;

  constructor(private kites: IKites, options: ExtensionOptions) {
    this.name = 'Rest';

    // TODO: Support HttpContext
    kites.container
      .addProvider({
        provide: TYPE.HttpContext,
        useValue: {}
      });

    /**
     * config event listeners
     */
    kites.on('express:config', (app: express.Express) => {
      var apiPrefix = options.apiPrefix || '/';
      kites.logger.debug(`Configure Rest Api: prefix=${apiPrefix}`);

      const router = this.registerControllers(kites.container);
      app.use(this.kites.options.apiPrefix, router);
    });

  }

  /**
   * Load more works at this entry!
   */
  init(kites: IKites, options: ExtensionOptions) {

    kites.logger.debug('Initializing extension rest ...');
  }

  private registerControllers(container: Container): express.Router {
    const router = express.Router();

    let constructors = GetControllersFromMetadata();

    constructors.forEach((constructor) => {
      const controller: IController = container.inject(constructor);
      const controllerMetadata = GetControllerMetadata(controller.constructor);
      const methodMetadata = GetControllerMethodMetadata(controller.constructor);
      const parameterMetadata = GetControllerParameterMetadata(controller.constructor);

      this.kites.logger.debug('Register controller: ' + controller.constructor.name);
      if (controllerMetadata && methodMetadata) {

        let controllerMiddleware = this.resolveMiddleware(...controllerMetadata.middleware);

        methodMetadata.forEach(metadata => {
          let paramList: ParameterMetadata[] = [];
          if (parameterMetadata) {
            paramList = parameterMetadata[metadata.key] || [];
          }
          const handler = this.handlerFactory(controllerMetadata.target, metadata.key, paramList);
          const routeMiddleware = this.resolveMiddleware(...metadata.middleware);
          router[metadata.method](
            `${controllerMetadata.path}${metadata.path}`,
            ...controllerMiddleware,
            ...routeMiddleware,
            handler
          );
        });
      }
    });

    return router;
  }

  private resolveMiddleware(...middleware: Middleware[])
    : express.RequestHandler[] {
    return middleware.map((item) => {
      // TODO: Implement BaseMiddleware
      return item as express.RequestHandler;
    });
  }

  private copyHeadersTo(headers: OutgoingHttpHeaders, target: express.Response) {
    for (const name of Object.keys(headers)) {
      const headerValue = headers[name];

      target.append(
        name,
        typeof headerValue === 'number' ? headerValue.toString() : headerValue
      );
    }
  }

  private async handleHttpResponseMessage(message: HttpResponseMessage, res: express.Response) {
    this.copyHeadersTo(message.headers, res);

    if (message.content !== undefined) {
      this.copyHeadersTo(message.content.headers, res);

      let content = await message.content.readAsStringAsync();
      res.status(message.statusCode)
        // If the content is a number, ensure we change it to a string, else our content is treated
        // as a statusCode rather than as the content of the Response
        .send(content);
    } else {
      res.sendStatus(message.statusCode);
    }
  }

  private handlerFactory(
    controller: any,
    key: string,
    parameterMetadata: ParameterMetadata[]
  ): express.RequestHandler {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        let args = this.extractParameters(req, res, next, parameterMetadata);

        // invoke controller's action
        const ctrl = await this.kites.container.inject<any>(controller);
        const value = ctrl[key](...args);

        if (value instanceof HttpResponseMessage) {
          await this.handleHttpResponseMessage(value, res);
        } else if (value instanceof Function) {
          value();
        } else if (!res.headersSent) {
          if (value === undefined) {
            res.status(204);
          }
          res.send(value);
        }

      } catch (err) {
        next(err);
      }
    };
  }

  private extractParameters(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    params: ParameterMetadata[]
  ): any[] {
    let args: any[] = [];
    if (!params || !params.length) {
      return [req, res, next];
    }

    params.forEach(({ type, index, parameterName, injectRoot }) => {
      switch (type) {
        case PARAMETER_TYPE.REQUEST:
          args[index] = req;
          break;
        case PARAMETER_TYPE.NEXT:
          args[index] = next;
          break;
        case PARAMETER_TYPE.PARAMS:
          args[index] = this.getParam(req, 'params', injectRoot, parameterName);
          break;
        case PARAMETER_TYPE.QUERY:
          args[index] = this.getParam(req, 'query', injectRoot, parameterName);
          break;
        case PARAMETER_TYPE.BODY:
          args[index] = req.body;
          break;
        case PARAMETER_TYPE.HEADERS:
          args[index] = this.getParam(req, 'headers', injectRoot, parameterName);
          break;
        case PARAMETER_TYPE.COOKIES:
          args[index] = this.getParam(req, 'cookies', injectRoot, parameterName);
          break;
        // case PARAMETER_TYPE.PRINCIPAL:
        //   args[index] = req.user;
        //   break;
        default:
          args[index] = res;
          break;
      }
    });

    args.push(req, res, next);
    return args;
  }

  private getParam(
    request: express.Request,
    paramType: string,
    injectRoot: boolean,
    name?: string
  ) {
    if (paramType === 'headers' && name) {
      name = name.toLocaleLowerCase();
    }

    let param = request[paramType];
    if (injectRoot) {
      return param;
    } else {
      return (param && name) ? param[name] : undefined;
    }
  }

}

export {
  RestExtension,
};
