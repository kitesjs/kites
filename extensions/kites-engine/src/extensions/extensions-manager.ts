import { EventEmitter } from 'events';
import * as _ from 'lodash';
import * as os from 'os';
import * as path from 'path';
import { KitesCore } from '../main';
import { discover } from './discover';
import { KitesExtensionDefinition, KitesExtention } from './extensions';
import sorter from './sorter';

export class ExtensionsManager extends EventEmitter {
    protected kites: KitesCore;
    protected availableExtensions: KitesExtention[];
    protected usedExtensions: KitesExtention[];

    constructor(kites: KitesCore) {
        super();

        this.kites = kites;
        this.availableExtensions = [];
        this.usedExtensions = [];
    }

    /**
     * Get enabled available extensions
     */
    get extensions() {
        return this.availableExtensions.filter((e) => !e.options || e.options.enabled !== false);
    }

    /**
     * Use a kites extension
     * @param extension
     */
    use(extension: KitesExtention|KitesExtensionDefinition) {
        if (typeof extension === 'function') {
            this.usedExtensions.push({
                dependencies: [],
                directory: this.kites.parentModuleDirectory,
                main: extension,
                name: extension.name || '<no-name>'
            });
        } else {
            this.usedExtensions.push(extension);
        }
    }

    useMany(extensions: KitesExtention[]) {
        var promises = extensions.map((e) => this.useOne(e));
        return Promise.all(promises);
    }

    useOne(extension: KitesExtention) {
        // extends options
        // Review _.assign(), _.defaults(), or _.merge?
        extension.options = _.assign({}, extension.options, this.kites.options[extension.name]);

        if (extension.options.enabled === false) {
            this.kites.logger.debug(`Extension ${extension.name} is disabled, skipping`);
            return Promise.resolve();
        }

        return Promise.resolve()
            .then(() => {
                if (typeof extension.main === 'function') {
                    extension.main.call(this, this.kites, extension);
                    return Promise.resolve();
                } else if (extension.directory) {
                    let extPath = path.join(extension.directory, extension.main);
                    let extModule = require(extPath);
                    extModule.call(this, this.kites, extension);
                    return Promise.resolve();
                } else {
                    return Promise.reject('Invalid kites extension: ' + extension.name);
                }
            })
            .then(() => {
                if (extension.options.enabled !== false) {
                    this.emit('extension-registered', extension);
                } else {
                    this.kites.logger.debug(`Extension ${extension.name} was disabled`);
                }
            })
            .catch((err: Error) => {
                this.kites.logger.error('Error when loading extension ' + extension.name + os.EOL + err.stack);
            });
    }

    /**
     * Initialize extensions manager
     */
    async init() {
        this.availableExtensions = [];
        // auto discover extensions
        if (this.kites.options.discover || (this.kites.options.discover !== false && this.usedExtensions.length === 0)) {
            let extensions = await discover({
                cacheAvailableExtensions: this.kites.options.cacheAvailableExtensions,
                extensionsLocationCache: this.kites.options.extensionsLocationCache,
                logger: this.kites.logger,
                mode: this.kites.options.mode,
                rootDirectory: this.kites.options.rootDirectory,
                tempDirectory: this.kites.options.tempDirectory,
            });
            this.kites.logger.debug('Discovered ' + extensions.length + ' extensions');
            this.availableExtensions = this.availableExtensions.concat(extensions);
        }
        // filter extensions will be loaded?
        this.availableExtensions = this.availableExtensions.concat(this.usedExtensions);
        if (this.kites.options.extensions) {
            let allowedExtensions = this.kites.options.extensions as string[];
            this.availableExtensions = this.availableExtensions.filter(e => allowedExtensions.indexOf(e.name) > -1);
        }

        this.availableExtensions.sort(sorter);
        return this.useMany(this.availableExtensions);

    }
}
