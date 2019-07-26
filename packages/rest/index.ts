import 'reflect-metadata';

import { ExtensionOptions, IKites, KitesExtension } from '@kites/core';
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

export default function Rest(kites: IKites, definition: ExtensionOptions) {
  kites.options.apiPrefix = kites.options.apiPrefix || '/';

  if (kites.options.apiPrefix.substr(-1) !== '/') {
    kites.options.apiPrefix += '/';
  }

  definition.name = definition.name || 'Rest';
  kites.options.rest = definition.options || {};

  var extension = new RestExtension(kites, definition.options);
  kites.initializeListeners.add(definition.name, extension.init.bind(extension, kites, definition.options));
  console.log('OKKKKEEE!!');
}
