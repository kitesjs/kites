'use strict';

const _ = require('lodash');
const os = require('os');
const path = require('path');
const util = require('util');
const events = require('events');
const Promise = require('bluebird');
const discover = require('./discover');
const sorter = require('./sorter');

const EventEmitter = events.EventEmitter;

class ExtensionsManager extends EventEmitter {
    constructor(kites) {
        super();
        this.kites = kites;
        this.availableExtensions = [];
        this.usedExtensions = [];
    }

    get extensions() {
        return this.availableExtensions.filter(function (e) {
            return !e.options || e.options.enabled !== false;
        });
    }

    init() {
        const self = this;
        this.availableExtensions = [];
        return Promise.resolve()
            .then(() => {
                // auto discover extensions
                if (self.kites.options.discover || (self.kites.options.discover !== false && self.usedExtensions.length === 0)) {
                    return discover({
                            logger: self.kites.logger,
                            rootDirectory: self.kites.options.rootDirectory,
                            mode: self.kites.options.mode,
                            cacheAvailableExtensions: self.kites.options.cacheAvailableExtensions,
                            tempDirectory: self.kites.options.tempDirectory,
                            extensionsLocationCache: self.kites.options.extensionsLocationCache
                        })
                        .then((extensions) => {
                            self.kites.logger.debug('Discovered ' + extensions.length + ' extensions');
                            self.availableExtensions = self.availableExtensions.concat(extensions);
                        })
                }
            })
            .then(() => {
                // filter extensions will be loaded
                self.availableExtensions = self.availableExtensions.concat(self.usedExtensions);
                if (self.kites.options.extensions) {
                    self.availableExtensions = self.availableExtensions.filter((e) => {
                        return self.kites.options.extensions.indexOf(e.name) !== -1
                    })
                }
                self.availableExtensions.sort(sorter);
            })
            .then(() => {
                return self._useMany(self.availableExtensions);
            })
    }

    use(extension) {
        if (typeof extension === 'function') {
            this.usedExtensions.push({
                main: extension,
                directory: this.kites.options.parentModuleDirectory,
                dependencies: []
            })
        } else if (typeof extension === 'object') {
            this.usedExtensions.push(extension)
        } else {
            throw new Error('use accepts function or object')
        }
    }

    _useMany(extensions) {
        var promises = extensions.map((e) => {
            return this._useOne(e).catch((err) => {
                this.kites.logger.error('Error when loading extension ' + err + os.EOL + err.stack);
            })
        });

        return Promise.all(promises);
    }

    _useOne(extension) {
        // extends options
        // Review _.assign(), _.defaults(), or _.merge?
        extension.options = _.assign({}, extension.options, this.kites.options[extension.name]);
        
        if (extension.options.enabled === false) {
            this.kites.logger.debug(`Extension ${extension.name} is disabled, skipping`);
            return Promise.resolve();
        }

        try {
            return Promise.resolve()
            .then(() => {
                if (typeof extension.main === 'function') {
                    return extension.main.call(this, this.kites, extension)
                } else if (extension.directory && extension.main) {
                    return require(path.join(extension.directory, extension.main)).call(this, this.kites, extension);
                }
            })
            .then(() => {
                if (extension.options.enabled !== false) {
                    this.emit('extension-registered', extension)
                } else {
                    this.kites.logger.debug(`Extension ${extension.name} was disabled`)
                }
            })
        } catch (err) {
            this.kites.logger.error('Error when loading extension ' + extension.name + os.EOL + e.stack);
            return Promise.resolve();
        }
    }
}

module.exports = ExtensionsManager;