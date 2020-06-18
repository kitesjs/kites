import { IKites, KitesExtension } from '@kites/core';
import { RestExtension } from './rest.extension';

/**
 * Main extension
 * @param kites
 * @param extension
 */
export default function Rest(kites: IKites, extension: KitesExtension) {
  kites.options.apiPrefix = kites.options.apiPrefix || '/api';

  // if (kites.options.apiPrefix.substr(-1) !== '/') {
  //   kites.options.apiPrefix += '/';
  // }

  extension.name = extension.name || 'Rest';
  kites.options.rest = extension.options || {};

  var restApp = new RestExtension(kites, extension.options);
  kites.initializeListeners.add(extension.name, restApp.init.bind(restApp, kites, extension.options));
}
