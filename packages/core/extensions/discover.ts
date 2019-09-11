import * as _ from 'lodash';
import * as path from 'path';
import { Logger } from 'winston';
import * as cache from './location-cache';

/**
 * Discover options can be:
 * + boolean: true/false
 * + string: '/path/to/discover'
 * + array: [true, 2, '/path/to/discover', '/path2']
 */
export type DiscoverOptions = string | boolean | [boolean, number, ...string[]];

/**
 * Options to discover
 */
export interface IDiscoverOptions {
  readonly logger: Logger;
  readonly depth?: number;
  readonly rootDirectory: string[];
  readonly env?: any;
  readonly cacheAvailableExtensions?: any;
  readonly tempDirectory?: any;
  readonly extensionsLocationCache?: any;
}

// cache variables
var availableExtensionsCache: any;

/**
 * Discover kites extensions
 * @param config
 */
export async function discover(config: IDiscoverOptions) {

  config.logger.info('Searching for available extensions in ' + config.rootDirectory);

  if (config.cacheAvailableExtensions && availableExtensionsCache != null) {
    config.logger.info(`Loading extensions from cache: count(${availableExtensionsCache.length})`);
    return Promise.resolve(availableExtensionsCache);
  } else {
    let results = await cache.get(config);
    config.logger.info(`Found: ${results.length} extensions!`);
    let availableExtensions = results.map((configFile) => {
      let extension = require(configFile);
      return _.extend({
        directory: path.dirname(configFile)
      }, extension);
    });

    availableExtensionsCache = availableExtensions;
    await cache.save(availableExtensions, config);
    return availableExtensions;
  }
}
