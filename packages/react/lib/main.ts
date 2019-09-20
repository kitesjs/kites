import { ExtensionDefinition, KitesInstance } from '@kites/core';

export default function (kites: KitesInstance, definition: ExtensionDefinition) {
  kites.initializeListeners.add('react', {
    after: 'express'
  }, () => {
    kites.logger.info('React bundler configure ..!');
  });
}
