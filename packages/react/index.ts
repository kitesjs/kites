import { KitesExtension } from '@kites/core';
import config from './kites.config';
import main from './lib/main';

/**
 * Extension Definition
 */
export default function (options) {
  const definition: KitesExtension = config;
  definition.options = options;
  definition.main = main;
  definition.directory = __dirname;
  return config;
}
