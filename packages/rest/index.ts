import 'reflect-metadata';

import { Injectable, InjectionToken } from '@kites/common';
import { Container, ExtensionOptions, IKites, KitesInstance } from '@kites/core';
import { Router } from 'express';
import { TYPE } from './constants';
import { Controller, Get } from './decorators';
import { GetControllerMetadata, GetControllersFromMetadata } from './utils';

@Injectable()
class SimpleService {
  public test(): string {
    return 'Hello Service!!!';
  }
}

@Controller('test')
class TestController {

  constructor(public svSimple: SimpleService) {

  }

  @Get('') test() {
    return this.svSimple.test();
  }
}

function registerControllers(container: Container): Router {
  const router = Router();

  let constructors = GetControllersFromMetadata();
  constructors.forEach((constructor) => {
    container.addProvider({
      provide: constructor,
      useClass: constructor
    });
  });

  console.log('Controllers: ', constructors);

  return router;
}

/**
 * Exports Extension
 */
export = function RestExtension(kites: KitesInstance, definition: ExtensionOptions) {
  const SIMPLE_SERVICE = new InjectionToken('simpleservice');
  kites.container
    .addProvider({
      provide: SimpleService,
      useClass: SimpleService
    })
    .addProvider({
      provide: new InjectionToken(TYPE.HttpContext),
      useValue: {}
    });

  kites.initializeListeners.add('init:rest', () => {
    const service = kites.container.inject(SimpleService);
    console.log('Name: ', definition.name, service.test());

    const testController = kites.container.inject(TestController);
    console.log('Controller: ', testController.test());

  });

  /**
   * config event listeners
   */
  kites.on('express:config', (app) => {
    console.log('test!!!!!!');
    var apiPrefix = definition.options.apiPrefix || '/';
    kites.logger.debug(`configure kites-rest: prefix=${apiPrefix}`);
  });

  registerControllers(kites.container);

};
