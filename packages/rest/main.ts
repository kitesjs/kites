import { IKites, KitesExtension } from '@kites/core';
import { RestExtension } from './rest.extension';

export default function Rest(kites: IKites, definition: KitesExtension) {
  kites.options.apiPrefix = kites.options.apiPrefix || '/api';

  // if (kites.options.apiPrefix.substr(-1) !== '/') {
  //   kites.options.apiPrefix += '/';
  // }

  definition.name = definition.name || 'Rest';
  kites.options.rest = definition.options || {};

  var extension = new RestExtension(kites, definition.options);
  kites.initializeListeners.add(definition.name, extension.init.bind(extension, kites, definition.options));
}
