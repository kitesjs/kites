
import { Injectable } from '@kites/common';
import { Container, ExtensionOptions, IKites, KitesExtension, KitesInstance } from '@kites/core';
import { Express, Router } from 'express';
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

/**
 * Main Extension
 */
class RestExtension implements KitesExtension {
  name: string;

  constructor(private kites: IKites, options: ExtensionOptions) {
    this.name = 'Rest';

    // register system service(s)
    kites.container
      .addProvider({
        provide: SimpleService,
        useClass: SimpleService
      })
      .addProvider({
        provide: TYPE.HttpContext,
        useValue: {}
      });

    /**
     * config event listeners
     */
    kites.on('express:config', (app: Express) => {
      var apiPrefix = options.apiPrefix || '/';
      kites.logger.debug(`Configure Rest Api: prefix=${apiPrefix}`);

      const router = this.registerControllers(kites.container);
      app.use(this.kites.options.apiPrefix, router);
    });

  }

  init(kites: IKites, options: ExtensionOptions) {

    const service = kites.container.inject(SimpleService);
    console.log('Name: ', this.name, service.test());

    const testController = kites.container.inject(TestController);
    console.log('Controller: ', testController.test());
  }

  registerControllers(container: Container): Router {
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

}

export {
  RestExtension,
};
