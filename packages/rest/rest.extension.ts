
import { Injectable } from '@kites/common';
import { Container, ExtensionOptions, IKites, KitesExtension, KitesInstance } from '@kites/core';
import { Router } from 'express';
import { TYPE } from './constants';
import { Controller, Get } from './decorators';
import { IController, ParameterMetadata } from './interfaces';
import { GetControllerMetadata, GetControllerMethodMetadata, GetControllerParameterMetadata, GetControllersFromContainer, GetControllersFromMetadata } from './utils';

@Injectable()
class SimpleService {
  public test(): string {
    return 'Hello Service!!!';
  }
}

@Controller('api1')
class TestController {

  constructor(public svSimple: SimpleService) {

  }

  @Get('') test() {
    return this.svSimple.test();
  }
}

@Controller('api2')
class Test2Controller {

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

  let controllers: IController[] = [];
  constructors.forEach((constructor) => {
    const controller: IController = container.inject(constructor);
    const controllerMetadata = GetControllerMetadata(controller.constructor);
    const methodMetadata = GetControllerMethodMetadata(controller.constructor);
    const parameterMetadata = GetControllerParameterMetadata(controller.constructor);

    console.log('Controller Metadata: ', controller, controllerMetadata, methodMetadata, parameterMetadata);
    if (controllerMetadata && methodMetadata) {

      methodMetadata.forEach(metadata => {
        let paramList: ParameterMetadata[] = [];
        if (parameterMetadata) {
          paramList = parameterMetadata[metadata.key] || [];
        }
        // const handler =              ;
      });
    }
  });

  console.log('Controllers: ', constructors);

  return router;
}

/**
 * Main Extension
 */
class RestExtension implements KitesExtension {
  name: string;

  constructor(private kites: IKites, options: ExtensionOptions) {
    this.name = 'Rest';

    /**
     * config event listeners
     */
    kites.on('express:config', (app) => {
      console.log('test!!!!!!');
      var apiPrefix = options.apiPrefix || '/';
      kites.logger.debug(`configure kites-rest: prefix=${apiPrefix}`);
    });

    registerControllers(kites.container);
  }

  init(kites: IKites, options: ExtensionOptions) {
    console.log('Fire!!!');

    kites.container
      .addProvider({
        provide: SimpleService,
        useClass: SimpleService
      })
      .addProvider({
        provide: TYPE.HttpContext,
        useValue: {}
      });

    const service = kites.container.inject(SimpleService);
    console.log('Name: ', options.name, service.test());

    const testController = kites.container.inject(TestController);
    console.log('Controller: ', testController.test());

  }
}

export {
  RestExtension,
  registerControllers,
};
