import { Injectable, InjectionToken } from '@kites/common';
import { ExtensionOptions, IKites, KitesInstance } from '@kites/core';

@Injectable()
class SimpleService {
  public test(): string {
    return 'Hello Service!!!';
  }
}

/**
 * Exports Extension
 */
export = function RestExtension(kites: KitesInstance, definition: ExtensionOptions) {
  const SIMPLE_SERVICE = new InjectionToken('simpleservice');
  kites.container.addProvider({
    provide: SIMPLE_SERVICE,
    useClass: SimpleService
  });

  kites.initializeListeners.add('init:rest', () => {
    const service = kites.container.inject<SimpleService>(SIMPLE_SERVICE);
    console.log('Name: ', definition.name, service.test());
  });

  /**
   * config event listeners
   */
  kites.on('express:config', (app) => {
    console.log('test!!!!!!');
    var apiPrefix = definition.options.apiPrefix || '/';
    kites.logger.debug(`configure kites-rest: prefix=${apiPrefix}`);
  });
};
