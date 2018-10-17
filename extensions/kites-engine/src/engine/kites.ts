import * as appRoot from 'app-root-path';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as nconf from 'nconf';
import * as path from 'path';
import {LoggerInstance, MemoryTransportInstance} from 'winston';

import { EventEmitter } from 'events';
import { ExtensionsManager } from '../extensions/extensions-manager';
import InitDebugLogger, { DebugTransport } from '../logger';
import InitDebugTransport from '../logger/debug-transport';
import { EventCollectionEmitter } from './event-collection';

import winston = require('winston');
import pkg from '../../package.json';
import { KitesExtensionDefinition, KitesExtention } from '../extensions/extensions';

/**
 * Default to create a new Kites
 * @param options
 */
export default function newKites(options: IKitesOptions) {
    return new KitesCore(options);
}

/**
 * Kites callback on ready
 */
export type KitesReadyCallback = (kites: KitesCore) => void;

/**
 * Kites Options
 */
export interface IKitesOptions {
    [key: string]: any;
    discover?: boolean;
    rootDirectory?: string;
    appDirectory?: string;
    parentModuleDirectory?: string;
    env?: string;
    logger?: any;
    mode?: string;
    cacheAvailableExtensions?: any;
    tempDirectory?: string;
    extensionsLocationCache?: boolean;
    extensions?: string[];
}

export class KitesCore extends EventEmitter {

    [key: string]: any; // key allow assign any object to kites!
    name: string;
    version: string;
    options: IKitesOptions;
    initializeListeners: EventCollectionEmitter;
    extensionsManager: ExtensionsManager;
    logger: LoggerInstance;
    private fnAfterConfigLoaded: Function;
    private isReady: Promise<KitesCore>;

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

        // properties
        this.logger = this._initWinston();
        this.fnAfterConfigLoaded = () => this;
        this.isReady = new Promise((resolve) => {
            this.on('initialized', resolve);
        });

    }

    get defaults() {
        let parent = module.parent || module;
        return {
            appDirectory: appRoot.toString(),
            discover: true,
            env: process.env.NODE_ENV || 'development',
            logger: {
                silent: false
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
     * Get default path from appDirectory
     * @param {string} value
     * @param {string} defaultValue
     */
    defaultPath(value: string, defaultValue: string) {
        if (typeof value === 'undefined') {
            return path.resolve(this.appDirectory, defaultValue || '');
        } else if (path.isAbsolute(value)) {
            return value;
        } else {
            return path.resolve(this.appDirectory, value);
        }
    }

    /**
     * Kites fire on ready
     * @param callback
     */
    ready(callback: KitesReadyCallback) {
        this.isReady.then((kites) => callback(kites));
        return this;
    }

    /**
     * Use a function as a kites extension
     * TODO: pass string to load folder and discover extension Function in this path
     * @param extension
     */
    use(extension: KitesExtention|KitesExtensionDefinition) {
        this.extensionsManager.use(extension);
        return this;
    }

    /**
     * Enable auto discover extensions
     */
    discover() {
        this.options.discover = true;
        return this;
    }

    /**
     * Assign config loaded callback
     * @param fn Function
     */
    afterConfigLoaded(fn: Function) {
        this.fnAfterConfigLoaded = fn;
        return this;
    }

    /**
     * Kites initialize
     */
    async init() {
        this._initOptions();
        this.logger.info(`Initializing ${this.name}@${this.version} in mode "${this.options.env}"${this.options.loadConfig ? ', using configuration file ' + this.options.configFile : ''}`);

        if (this.options.logger && this.options.logger.silent === true) {
            this._silentLogs(this.logger);
        }

        await this.extensionsManager.init();
        await this.initializeListeners.fire();

        this.logger.info('kites initialized!');
        this.emit('initialized', this);
        return this;
    }

    private _initOptions() {
        if (this.options.loadConfig) {
            this._loadConfig();
            this.fnAfterConfigLoaded(this);
        }

        return this._configureWinstonTransports(this.options.logger);
    }

    private _silentLogs(logger: LoggerInstance) {
        if (logger.transports) {
            _.keys(logger.transports).forEach((name) => {
                logger.transports[name].silent = true;
            });
        }
    }

    private _loadConfig() {
        let nfn = nconf.get().env({
            separator: ':'
        })
        .env({
            separator: '_'
        })
        .defaults(this.options);

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

        this.options = nconf.get();
    }

    private _configureWinstonTransports(transports: any) {
        transports = transports || {};

        var knownTransports: any = {
            console: winston.transports.Console,
            debug: DebugTransport,
            file: winston.transports.File,
            http: winston.transports.Http,
            memory: winston.transports.Memory,
        };

        var knownOptions = ['transport', 'module', 'enabled'];

        for (let tname in transports) {
            var logger = this.logger;
            var tranOpts = transports[tname];
            if (!tranOpts || typeof tranOpts !== 'object' || _.isArray(tranOpts)) {
                continue;
            }

            if (!tranOpts.transport || typeof tranOpts.transport !== 'string') {
                throw new Error(`invalid option for transport object ${tname}, option "transport" is not specified or has an incorrect value, must be a string with a valid value. check your "logger" config`);
            }

            if (!tranOpts.level || typeof tranOpts.level !== 'string') {
                throw new Error(`invalid option for transport object ${tname}, option "level" is not specified or has an incorrect value, must be a string with a valid value. check your "logger" config`);
            }

            if (tranOpts.enabled === false) {
                continue;
            }

            // add transport
            if (knownTransports[tranOpts.transport]) {
                logger.add(knownTransports[tranOpts.transport], _.extend(_.omit(tranOpts, knownOptions), {
                    name: tname
                }));
            } else {
                if (typeof tranOpts.module !== 'string') {
                    throw new Error(`invalid option for transport object "${tname}", option "module" has an incorrect value, must be a string with a module name. check your "logger" config`);
                }

                try {
                    let transportModule = require(tranOpts.module);
                    let winstonTransport: any = winston.transports;
                    if (typeof winstonTransport[tranOpts.transport] === 'function') {
                        transportModule = winstonTransport[tranOpts.transport];
                    } else if (typeof transportModule[tranOpts.transport] === 'function') {
                        transportModule = transportModule[tranOpts.transport];
                    }

                    if (typeof transportModule !== 'function') {
                        throw new Error(`invalid option for transport object "${tname}", option module "${tranOpts.module}" does not export a valid transport. check your "logger" config`);
                    }

                    logger.add(transportModule, _.extend(_.omit(tranOpts, knownOptions), {
                        name: tname
                    }));

                } catch (err) {
                    if (err.code === 'MODULE_NOT_FOUND') {
                        throw new Error(
                            `invalid option for transport object "${tname}", module "${tranOpts.module}" in "module" option could not be found. are you sure that you have installed it?. check your "logger" config`);
                    }

                    throw err;
                }
            }

        }

    }

    private _initWinston() {
        if (!winston.loggers.has(this.name)) {
            let debugTransport = new DebugTransport();
            winston.loggers.add(this.name, {
                transports: [debugTransport]
            });

            // winston.loggers.get(this.name).emitErrs = true;
            winston.loggers.get(this.name).on('error', (err) => {
                if (err.code === 'ENOENT') {
                    var msg = err;
                    if (path.dirname(err.path) === '.') {
                        msg = 'Error from logger (winston) while trying to use a file to store logs:';
                    } else {
                        msg = 'Error from logger (winston) while trying to use a file to store logs, if the directory "' + err.path + '" does not exists please create it:';
                    }
                    // make the error intentionally more visible to get the attention of the user
                    console.error('------------------------');
                    console.error(msg, err);
                    console.error('------------------------');
                }
            });
        } else {
            // remove all transports and add default Debug transport
            winston.loggers.get(this.name).clear();
            winston.loggers.get(this.name).add(InitDebugTransport());
        }

        return winston.loggers.get(this.name);
    }

}
