import 'reflect-metadata';

import { ExtensionOptions, KitesExtension } from '@kites/core';
import config from './kites.config';
import main from './main';
import { RestExtension } from './rest.extension';

export * from './decorators';
export * from './interfaces';
export * from './content';

/**
 * Exports Extension
 */
export {
  RestExtension
};

export default function (options?: ExtensionOptions) {
  const definition: KitesExtension = config;
  definition.options = options;
  definition.main = main;
  definition.directory = __dirname;
  return definition;
}
