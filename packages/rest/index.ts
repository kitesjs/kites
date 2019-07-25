import { ExtensionOptions, IKites } from '@kites/core';

export = function RestExtension(kites: IKites, definition: ExtensionOptions) {
  kites.initializeListeners.add('init:rest', () => {
    console.log('Name: ', definition.name);
  });
};
