import { KitesExtension, KitesInstance } from '@kites/core';
import { ExpressExtension } from './express.extension';

export default function main(kites: KitesInstance, definition: KitesExtension) {
  kites.options.appPath = kites.options.appPath || '/';

  if (kites.options.appPath.substr(-1) !== '/') {
    kites.options.appPath += '/';
  }

  kites.options.express = definition.options || {};
  kites.options.httpPort =
    kites.options.express.httpPort || kites.options.httpPort;
  kites.express = definition;

  let extension = new ExpressExtension(kites, kites.options.express);
  kites.initializeListeners.add(definition.name, extension.init.bind(extension));
}
