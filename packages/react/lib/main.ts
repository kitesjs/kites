import { ExtensionDefinition, KitesInstance } from '@kites/core';

export default function (kites: KitesInstance, definition: ExtensionDefinition) {
  kites.initializeListeners.add('studio', {
    after: 'express'
  }, () => {
    kites.logger.info('Studio config!');
  });
}
