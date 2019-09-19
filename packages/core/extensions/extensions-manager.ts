import { EventEmitter } from 'events';
import * as _ from 'lodash';
import * as os from 'os';
import * as path from 'path';
import { IKites } from '..';
import { discover, DiscoverOptions } from './discover';
import { ExtensionDefinition, ExtensionOptions, KitesExtension } from './extensions';
import sorter from './sorter';

class ExtensionsManager extends EventEmitter {
  protected kites: IKites;
  protected availableExtensions: KitesExtension[];
  protected usedExtensions: KitesExtension[];

  constructor(kites: IKites) {
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
  use(extension: KitesExtension | ExtensionDefinition) {
    if (typeof extension === 'function') {
      this.usedExtensions.push({
        dependencies: [],
        directory: this.kites.options.parentModuleDirectory,
        main: extension,
        name: extension.name || '<no-name>',
      });
    } else {
      this.usedExtensions.push(extension);
    }
  }

  /**
   * Initialize extensions manager
   */
  async init() {
    this.availableExtensions = [];

    let autodiscover = false;
    if (typeof this.kites.options.discover === 'undefined') {
      this.kites.options.discover = [false, 0];
    } else if (typeof this.kites.options.discover === 'boolean') {
      this.kites.options.discover = [this.kites.options.discover, 2, this.kites.options.appDirectory];
    } else if (typeof this.kites.options.discover === 'string') {
      this.kites.options.discover = [true, 2, this.kites.options.discover];
    } else if (this.kites.options.discover.length < 2) {
      throw new Error('Discover options as array requires at least 2 elements! Example: [true, 2]');
    } else if (this.kites.options.discover.length < 3) {
      this.kites.options.discover.push(this.kites.options.appDirectory);
    }

    // autodiscover extensions
    autodiscover = this.kites.options.discover.shift() as boolean;

    if (autodiscover) {
      let depth = this.kites.options.discover.shift() as number;
      let directories = this.kites.options.discover as string[];
      let extensions = await discover({
        cacheAvailableExtensions: this.kites.options.cacheAvailableExtensions,
        extensionsLocationCache: this.kites.options.extensionsLocationCache,
        logger: this.kites.logger,
        env: this.kites.options.env,
        depth: depth,
        rootDirectory: directories,
        tempDirectory: this.kites.options.tempDirectory,
      });
      this.kites.logger.debug('Autodiscover ' + extensions.length + ' extensions!');
      this.availableExtensions = this.availableExtensions.concat(extensions);
    } else {
      this.kites.logger.debug('Autodiscover is not enabled!');
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

  /**
   * Execute init extensions
   * @param extensions
   */
  private async useMany(extensions: KitesExtension[]) {
    for (const e of extensions) {
      await this.useOne(e);
    }
  }

  /**
   * Execute init one extension
   * @param extension
   */
  private async useOne(extension: KitesExtension) {
    try {

      // extends options
      // Review _.assign(), _.defaults(), or _.merge?
      const xname = extension.name && extension.name.toLowerCase();
      const options = _.assign<
        ExtensionOptions,
        ExtensionOptions | undefined,
        ExtensionOptions | undefined>({}, extension.options, this.kites.options[xname]);

      extension.options = options;
      this.kites.options[xname] = options;

      if (options.enabled === false) {
        if (!extension.name) {
          this.kites.logger.debug(`Anonymous Extension${extension.directory != null ? ` at ${extension.directory}` : ''} is disabled, skipping`);
        } else {
          this.kites.logger.debug(`Extension ${extension.name} is disabled, skipping`);
        }
        return;
      }

      if (typeof extension.main === 'function') {
        // execute main function without await!
        (extension.main as Function).call(this, this.kites, extension);
      } else if (typeof extension.main === 'string' && extension.directory) {
        const main = await import(path.join(extension.directory, extension.main));
        if (typeof main.default === 'function') {
          // ES6 Module
          // execute main function without await!
          main.default.call(this, this.kites, extension);
        } else if (typeof main === 'function') {
          // execute main function without await!
          main.call(this, this.kites, extension);
        } else {
          throw new Error('Invalid kites extension: ' + extension.name + ' -> ' + JSON.stringify(extension));
        }
      } else {
        throw new Error('Invalid kites extension: ' + extension.name + ' -> ' + JSON.stringify(extension));
      }

      this.emit('extension:registered', extension);
    } catch (error) {
      let errorMsg;

      if (!extension.name) {
        errorMsg = `Error when loading anonymous extension ${extension.directory != null ? ` at ${extension.directory}` : ''}${os.EOL}${error.stack}`;
      } else {
        errorMsg = `Error when loading extension ${extension.name}${os.EOL}${error.stack}`;
      }

      this.kites.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

}

export {
  ExtensionsManager,
  DiscoverOptions
};
