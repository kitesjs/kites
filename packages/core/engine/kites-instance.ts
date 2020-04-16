import * as appRoot from 'app-root-path';
import * as fs from 'fs';
import * as _ from 'lodash';
// import * as nconf from 'nconf';
import * as path from 'path';
import { Logger, transports } from 'winston';

import { EventEmitter } from 'events';
import { DiscoverOptions, ExtensionsManager } from '../extensions/extensions-manager';
import { getLogger } from '../logger';
import { EventCollectionEmitter } from './event-collection';

import { Type } from '@kites/common/interfaces';
import { ExtensionDefinition, KitesExtension } from '../extensions/extensions';
import { Container } from '../injector';
import pkg from '../package.json';

/**
 * Kites callback on ready
 */
export type KitesReadyCallback = (kites: IKites) => void;

/**
 * Kites Options
 */
export interface IKitesOptions {
  [key: string]: any;
  providers?: Array<Type<any>>;
  discover?: DiscoverOptions; // options for discovery
  loadConfig?: boolean;
  /**
   * Use to discover extensions
   * Kites default discover from root directory.
   */
  rootDirectory?: string;
  /**
   * Used to load app profile or configuration
   */
  appDirectory?: string;
  parentModuleDirectory?: string;
  env?: string;
  logger?: any;
  cacheAvailableExtensions?: any;
  tempDirectory?: string;
  extensionsLocationCache?: boolean;
}

/**
 * Kite Interface
 */
export interface IKites {
  [key: string]: any;
  name: string;
  version: string;
  options: IKitesOptions;
  initializeListeners: EventCollectionEmitter;
  isInitialized: boolean;
  logger: Logger;
  container: Container;
  afterConfigLoaded(fn: KitesReadyCallback): IKites;
  discover(option: DiscoverOptions): IKites;
  use(extension: KitesExtension | ExtensionDefinition | ExtensionDefinition[]): IKites;
  init(): Promise<IKites>;
}

/**
 * Kites engine core
 */
export class KitesInstance extends EventEmitter implements IKites {

  [key: string]: any; // key allow assign any object to kites!
  name: string;
  version: string;
  options: IKitesOptions;
  initializeListeners: EventCollectionEmitter;
  extensionsManager: ExtensionsManager;
  logger: Logger;

  private fnAfterConfigLoaded: KitesReadyCallback;
  private initialized: boolean;
  private iocContainer: Container;

  constructor(options?: IKitesOptions) {
    super();
    // It may possible cause memory leaks from extensions
    this.setMaxListeners(0);

    // setup kites
    this.name = pkg.displayName;
    this.version = pkg.version;
    this.options = Object.assign(this.defaults, options);
    this.initializeListeners = new EventCollectionEmitter();
    this.extensionsManager = new ExtensionsManager(this);
    this.initialized = false;
    this.iocContainer = new Container();

    // properties
    this.logger = getLogger(this.name, this.options.logger);
    this.fnAfterConfigLoaded = () => this;

  }

  get container() {
    return this.iocContainer;
  }

  get isInitialized() {
    return this.initialized;
  }

  get defaults() {
    const parent = module.parent || module;
    const defaultLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
    return {
      loadConfig: true,
      appDirectory: appRoot.toString(),
      // TODO: separate kites discover as an api
      // EXAMPLE 1: kites.discover(true)
      // EXAMPLE 2: kites.discover(false)
      // EXAMPLE 3: kites.discover('/path/to/discover')
      // EXAMPLE 4: kites.discover([true, 2, '/path/to/discover', '/path2'])
      discover: false,
      env: process.env.NODE_ENV || 'development',
      logger: {
        console: {
          level: defaultLevel,
          transport: 'console'
        }
      },
      parentModuleDirectory: path.dirname(parent.filename),
      rootDirectory: path.resolve(__dirname, '../../../'),
    };
  }

  get configFileName() {
    if (this.options.env === 'production') {
      return 'prod.config.json';
    } else if (this.options.env === 'test') {
      return 'test.config.json';
    } else {
      return 'dev.config.json';
    }
  }

  get defaultConfigFile() {
    return 'kites.config.json';
  }

  /**
   * Root directory - Used to searches extensions
   * Default in node_modules
   */
  get rootDirectory() {
    return this.options.rootDirectory;
  }

  /**
   * App directory - Used to seaches app configuration
   */
  get appDirectory() {
    return this.options.appDirectory || this.defaults.appDirectory;
  }

  /**
   * Parent module directory
   */
  get parentModuleDirectory() {
    return this.options.parentModuleDirectory || this.defaults.parentModuleDirectory;
  }

  /**
   * Get kites option or default value
   * @param option
   * @param defaultValue
   */
  defaultOption(option: string, defaultValue: any) {
    return this.options[option] || defaultValue;
  }

  /**
   * Get default path from appDirectory
   * @param {string} value
   */
  defaultPath(value: string) {
    if (typeof value === 'undefined') {
      return this.appDirectory;
    } else if (path.isAbsolute(value)) {
      return value;
    } else {
      return path.resolve(this.appDirectory, value);
    }
  }

  /**
   * Use a function as a kites extension
   * @param extension
   */
  use(extension: KitesExtension | ExtensionDefinition) {
    this.extensionsManager.use(extension);
    return this;
  }

  /**
   * Enable auto discover extensions
   */
  discover(option: DiscoverOptions) {
    this.options.discover = option;
    return this;
  }

  /**
   * Thiết lập giá trị cấu hình cho các extensions
   * Example:
   *      .set('express:static', './assets') -> kites.options.express.static = './assets'
   * @param option
   * @param value
   */
  set(option: string, value: string) {
    const tokens = option.split(':');
    if (tokens.length === 2) {
      this.options[tokens[0]][tokens[1]] = value;
    } else if (tokens.length === 1) {
      this.options[tokens[0]] = value;
    }
  }

  /**
   * Assign config loaded callback
   * @param fn Function
   */
  afterConfigLoaded(fn: KitesReadyCallback) {
    this.fnAfterConfigLoaded = fn;
    return this;
  }

  /**
   * Kites initialize
   */
  async init() {
    // init options first
    await this._initOptions();

    // keep silent if the option is configured
    if (this.options.logger && this.options.logger.silent === true) {
      this._silentLogs(this.logger);
    }

    this.logger.info(`Initializing ${this.name}@${this.version} in mode "${this.options.env}"${this.options.loadConfig ? ', using configuration file ' + this.options.configFile : ''}`);

    await this.extensionsManager.init();
    await this.initializeListeners.fire();

    this.initialized = true;
    this.logger.info('kites initialized!');

    this.emit('ready', this);
    return this;
  }

  private async _initOptions() {
    if (this.options.loadConfig) {
      await this._loadConfig();
      await this.fnAfterConfigLoaded(this);
    }

    return this._configureWinstonTransports(this.options.logger);
  }

  private _silentLogs(logger: Logger) {
    logger.transports.forEach(x => {
      x.silent = true;
    });
  }

  private async _loadConfig() {
    const config = await import('nconf');
    const nconf = new config.Provider();

    let nfn = nconf.argv()
      .env({
        separator: ':'
      })
      .env({
        separator: '_'
      });

    if (!this.options.configFile) {

      this.options.configFile = this.configFileName;
      if (fs.existsSync(path.join(this.appDirectory, this.options.configFile))) {
        nfn.file({
          file: path.join(this.appDirectory, this.options.configFile)
        });
      } else if (fs.existsSync(path.join(this.appDirectory, this.defaultConfigFile))) {
        this.options.configFile = this.defaultConfigFile;
        nfn.file({
          file: path.join(this.appDirectory, this.defaultConfigFile)
        });
      }

    } else {
      let configFilePath = path.isAbsolute(this.options.configFile) ? this.options.configFile : path.join(this.appDirectory, this.options.configFile);

      if (!fs.existsSync(configFilePath)) {
        throw new Error('Config file ' + this.options.configFile + ' was not found.');
      } else {
        nfn.file({
          file: configFilePath
        });
      }
    }

    // 'if nothing else': 'use this value'
    nconf.defaults(this.options);
    this.options = nconf.get();
  }

  private _configureWinstonTransports(options: any) {
    options = options || {};

    var knownTransports: any = {
      console: transports.Console,
      file: transports.File,
      http: transports.Http,
      stream: transports.Stream,
    };

    var knownOptions = ['transport', 'module', 'enabled'];

    // tslint:disable-next-line:forin
    for (let trName in options) {
      var tranOpts = options[trName];
      if (!tranOpts || typeof tranOpts !== 'object' || _.isArray(tranOpts)) {
        continue;
      }

      if (!tranOpts.transport || typeof tranOpts.transport !== 'string') {
        throw new Error(`invalid option for transport object ${trName}, option "transport" is not specified or has an incorrect value, must be a string with a valid value. check your "logger" config`);
      }

      if (!tranOpts.level || typeof tranOpts.level !== 'string') {
        throw new Error(`invalid option for transport object ${trName}, option "level" is not specified or has an incorrect value, must be a string with a valid value. check your "logger" config`);
      }

      if (tranOpts.enabled === false) {
        continue;
      }

      // add transport
      if (knownTransports[tranOpts.transport]) {
        if (this.logger.transports.some((x: any) => x.name === trName)) {
          continue;
        }
        const transport = knownTransports[tranOpts.transport] as any;
        const opts = _.extend(_.omit(tranOpts, knownOptions), { name: trName });
        this.logger.add(new transport(opts));
      } else {
        if (typeof tranOpts.module !== 'string') {
          throw new Error(`invalid option for transport object "${trName}", option "module" has an incorrect value, must be a string with a module name. check your "logger" config`);
        }

        try {
          let transportModule = require(tranOpts.module);
          let winstonTransport: any = transports;
          if (typeof winstonTransport[tranOpts.transport] === 'function') {
            transportModule = winstonTransport[tranOpts.transport];
          } else if (typeof transportModule[tranOpts.transport] === 'function') {
            transportModule = transportModule[tranOpts.transport];
          }

          if (typeof transportModule !== 'function') {
            throw new Error(`invalid option for transport object "${trName}", option module "${tranOpts.module}" does not export a valid transport. check your "logger" config`);
          }

          const opts = _.extend(_.omit(tranOpts, knownOptions), { name: trName });

          this.logger.add(new transportModule(opts));

        } catch (err) {
          if (err.code === 'MODULE_NOT_FOUND') {
            throw new Error(
              `invalid option for transport object "${trName}", module "${tranOpts.module}" in "module" option could not be found. are you sure that you have installed it?. check your "logger" config`);
          }

          throw err;
        }
      }

    }

  }

}
