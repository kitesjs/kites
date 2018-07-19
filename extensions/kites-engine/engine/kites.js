/*!
 * Copyright(c) 2017 Nhu Bao Vu
 *
 * Kites main class including all methods @kites/engine exposes.
 */
'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const events = require('events');
const winston = require('winston');
const appRoot = require('app-root-path');
const nconf = require('nconf');
const ListenerCollection = require('listener-collection');

const pkg = require('../package.json');
const ExtensionManager = require('./extensions/extensionsManager');
const LogDebugTransport = require('./util/logDebugTransport');

const EventEmitter = events.EventEmitter;

class Kites extends EventEmitter {
    constructor(options) {
        super();
        // It may possible cause memory leaks from extensions
        this.setMaxListeners(0);

        this.name = pkg.displayName;
        this.version = pkg.version;
        this.options = Object.assign(this.defaults, options);
        this.initializeListeners = new ListenerCollection();
        this.extensionsManager = new ExtensionManager(this);

        // init properties
        this.logger = this._initWinston();
        this._initialized = false;
        this._fnAfterConfigLoaded = () => this;
        this._ready = new Promise((resolve) => {
            this.on('initialized', resolve);
        });
    }

    get defaults() {
        return {
            discover: true,
            rootDirectory: path.resolve(__dirname, '../../../'),
            appDirectory: appRoot.toString(),
            parentModuleDirectory: path.dirname(module.parent.filename),
            env: process.env.NODE_ENV || 'development',
            logger: {
                silent: false
            }
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
        return this.options.appDirectory;
    }

    defaultOption(option, defaultValue) {
        return this.options[option] || defaultValue;
    }

    /**
     * Get default path from appDirectory
     * @param {string} value 
     * @param {string} defaultValue 
     */
    defaultPath(value, defaultValue) {
        if (typeof value === 'undefined') {
            return path.resolve(this.appDirectory, defaultValue || '');
        } else if (path.isAbsolute(value)) {
            return value;
        } else {
            return path.resolve(this.appDirectory, value);
        }
    }

    init() {
        return this._initOptions().then(() => {
            if (this.options.logger && this.options.logger.silent === true) {
                this._silentLogs(this.logger);
            }

            this.logger.info(`Initializing ${this.name}@${this.version} in mode "${this.options.env}"${this.options.loadConfig? ', using configuration file ' + this.options.configFile : ''}`);
            return this.extensionsManager.init();
        }).then(() => {
            return this.initializeListeners.fire();
        }).then(() => {
            this.logger.info('kites initialized!');
            this._initialized = true;
            this.emit('initialized', this);
            return this;
        })
    }

    ready(callback) {
        callback = callback || (() => 1);
        this._ready.then((kites) => {
            callback(kites);
        })
        return this;
    }

    use(extension) {
        this.extensionsManager.use(extension);
        return this;
    }

    discover() {
        this.options.discover = true;
        return this;
    }

    afterConfigLoaded(fn) {
        this._fnAfterConfigLoaded = fn;
        return this;
    }

    _initOptions() {
        return Promise.resolve()
            .then(() => {
                if (this.options.loadConfig) {
                    return this._loadConfig();
                }
            })
            .then(() => {
                return this._fnAfterConfigLoaded(this)
            })
            .then(() => {
                this._configureWinstonTransports(this.options.logger);
            })
    }

    _loadConfig() {
        var nfn = nconf.argv()
            .env({
                separator: ':'
            })
            .env({
                separator: '_'
            })
            .defaults(this.options);

        if (!this.options.configFile) {

            this.options.configFile = this.configFileName;
            if (fs.existsSync(path.join(this.options.appDirectory, this.options.configFile))) {
                nfn.file({
                    file: path.join(this.options.appDirectory, this.options.configFile)
                })
            } else if (fs.existsSync(path.join(this.options.appDirectory, this.defaultConfigFile))) {
                this.options.configFile = this.defaultConfigFile;
                nfn.file({
                    file: path.join(this.options.appDirectory, this.defaultConfigFile)
                })
            }

        } else {
            let configFilePath = path.isAbsolute(this.options.configFile) ? this.options.configFile : path.join(this.options.appDirectory, this.options.configFile);

            if (!fs.existsSync(configFilePath)) {
                throw new Error('Config file ' + this.options.configFile + ' was not found.')
            } else {
                nfn.file({
                    file: configFilePath
                })
            }
        }

        this.options = nconf.get()
    }

    _configureWinstonTransports(transports) {
        transports = transports || {};

        var knownTransports = {
            debug: LogDebugTransport,
            memory: winston.transports.Memory,
            console: winston.transports.Console,
            file: winston.transports.File,
            http: winston.transports.Http
        }

        var knownOptions = ['transport', 'module', 'enabled'];

        for (let tname in transports) {
            var logger = this.logger;
            var tranOpts = transports[tname];
            if (!tranOpts || typeof tranOpts !== 'object' || _.isArray(tranOpts)) {
                continue;
            }

            if (!tranOpts.transport || typeof tranOpts.transport !== 'string') {
                throw new Error(`invalid option for transport object ${tname}, option "transport" is not specified or has an incorrect value, must be a string with a valid value. check your "logger" config`)
            }

            if (!tranOpts.level || typeof tranOpts.level !== 'string') {
                throw new Error(`invalid option for transport object ${tname}, option "level" is not specified or has an incorrect value, must be a string with a valid value. check your "logger" config`)
            }

            if (tranOpts.enabled === false) {
                continue
            }

            // add transport
            if (knownTransports[tranOpts.transport]) {
                logger.add(knownTransports[tranOpts.transport], _.extend(_.omit(tranOpts, knownOptions), {
                    name: tname
                }))
            } else {
                if (typeof tranOpts.module !== 'string') {
                    throw new Error(`invalid option for transport object "${tname}", option "module" has an incorrect value, must be a string with a module name. check your "logger" config`)
                }

                try {
                    let transportModule = require(tranOpts.module);

                    if (typeof winston.transports[tranOpts.transport] === 'function') {
                        transportModule = winston.transports[tranOpts.transport]
                    } else if (typeof transportModule[tranOpts.transport] === 'function') {
                        transportModule = transportModule[tranOpts.transport]
                    }

                    if (typeof transportModule !== 'function') {
                        throw new Error(`invalid option for transport object "${tname}", option module "${tranOpts.module}" does not export a valid transport. check your "logger" config`)
                    }

                    logger.add(transportModule, _.extend(_.omit(tranOpts, knownOptions), {
                        name: tname
                    }))

                } catch (err) {
                    if (err.code === 'MODULE_NOT_FOUND') {
                        throw new Error(
                            `invalid option for transport object "${tname}", module "${tranOpts.module}" in "module" option could not be found. are you sure that you have installed it?. check your "logger" config`)
                    }

                    throw err;
                }
            }

        }

    }

    _initWinston() {
        if (!winston.loggers.has(this.name)) {
            let debugTransport = new LogDebugTransport();
            winston.loggers.add(this.name, {
                transports: [debugTransport]
            });

            winston.loggers.get(this.name).emitErrs = true;
            winston.loggers.get(this.name).on('error', (err) => {
                if (err.code === 'ENOENT') {
                    var msg = err;
                    if (path.dirname(err.path) === '.') {
                        msg = 'Error from logger (winston) while trying to use a file to store logs:'
                    } else {
                        msg = 'Error from logger (winston) while trying to use a file to store logs, if the directory "' + dir + '" does not exists please create it:'
                    }
                    // make the error intentionally more visible to get the attention of the user
                    console.error('------------------------');
                    console.error(msg, err);
                    console.error('------------------------');
                }
            })
        } else {
            // remove all transports and add default Debug transport
            winston.loggers.get(this.name).clear();
            winston.loggers.get(this.name).add(LogDebugTransport);
        }

        return winston.loggers.get(this.name);
    }

    _silentLogs(logger) {
        if (logger.transports) {
            _.keys(logger.transports).forEach((name) => {
                logger.transports[name].silent = true;
            })
        }
    }
}

module.exports = Kites;