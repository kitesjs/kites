
import * as express from 'express';

import { Injectable } from '@kites/common';
import { Container, ExtensionOptions, IKites, KitesExtension } from '@kites/core';
import { OutgoingHttpHeaders } from 'http';
import { PARAMETER_TYPE, TYPE } from './constants';
import { Controller, Get } from './decorators';
import { IController, ParameterMetadata } from './interfaces';
import { HttpResponseMessage } from './results/http-response-message';
import { GetControllerMetadata, GetControllerMethodMetadata, GetControllerParameterMetadata, GetControllersFromContainer, GetControllersFromMetadata } from './utils';

@Injectable()
class SimpleService {
  public test(): string {
    return 'Hello Service!!!';
  }
}

@Controller('/api1')
class TestController {

  constructor(public svSimple: SimpleService) {

  }

  @Get('/') test() {
    return this.svSimple.test();
  }
}

@Controller('/api2')
class Test2Controller {

  constructor(public svSimple: SimpleService) {

  }

  @Get('/') test() {
    return this.svSimple.test();
  }

  @Get('/path2') test2() {
    return this.svSimple.test();
  }

  @Get('/path2') test3() {
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
    kites.on('express:config', (app: express.Express) => {
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

  private registerControllers(container: Container): express.Router {
    const router = express.Router();

    let constructors = GetControllersFromMetadata();

    constructors.forEach((constructor) => {
      const controller: IController = container.inject(constructor);
      const controllerMetadata = GetControllerMetadata(controller.constructor);
      const methodMetadata = GetControllerMethodMetadata(controller.constructor);
      const parameterMetadata = GetControllerParameterMetadata(controller.constructor);

      this.kites.logger.debug('Register controller: ' + controller.constructor.name);
      if (controllerMetadata && methodMetadata) {

        methodMetadata.forEach(metadata => {
          let paramList: ParameterMetadata[] = [];
          if (parameterMetadata) {
            paramList = parameterMetadata[metadata.key] || [];
          }
          const handler = this.handlerFactory(controllerMetadata.target, metadata.key, paramList);

          router[metadata.method](
            `${controllerMetadata.path}${metadata.path}`,
            // ...controllerMiddleware,
            // ...routeMiddleware,
            handler
          );
        });
      }
    });

    return router;
  }

  private copyHeadersTo(headers: OutgoingHttpHeaders, target: express.Response) {
    for (const name of Object.keys(headers)) {
      const headerValue = headers[name];

      target.append(
        name,
        typeof headerValue === 'number' ? headerValue.toString() : headerValue
      );
    }
  }

  private async handleHttpResponseMessage(message: HttpResponseMessage, res: express.Response) {
    this.copyHeadersTo(message.headers, res);

    if (message.content !== undefined) {
      this.copyHeadersTo(message.content.headers, res);

      let content = await message.content.readAsStringAsync();
      res.status(message.statusCode)
        // If the content is a number, ensure we change it to a string, else our content is treated
        // as a statusCode rather than as the content of the Response
        .send(content);
    } else {
      res.sendStatus(message.statusCode);
    }
  }

  private handlerFactory(
    controller: any,
    key: string,
    parameterMetadata: ParameterMetadata[]
  ): express.RequestHandler {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        let args = this.extractParameters(req, res, next, parameterMetadata);

        // invoke controller's action
        const ctrl = await this.kites.container.inject<any>(controller);
        const value = ctrl[key](...args);

        if (value instanceof HttpResponseMessage) {
          await this.handleHttpResponseMessage(value, res);
        } else if (value instanceof Function) {
          value();
        } else if (!res.headersSent) {
          if (value === undefined) {
            res.status(204);
          }
          res.send(value);
        }

      } catch (err) {
        next(err);
      }
    };
  }

  private extractParameters(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    params: ParameterMetadata[]
  ): any[] {
    let args: any[] = [];
    if (!params || !params.length) {
      return [req, res, next];
    }

    params.forEach(({ type, index, parameterName, injectRoot }) => {
      switch (type) {
        case PARAMETER_TYPE.REQUEST:
          args[index] = req;
          break;
        case PARAMETER_TYPE.NEXT:
          args[index] = next;
          break;
        case PARAMETER_TYPE.PARAMS:
          args[index] = this.getParam(req, 'params', injectRoot, parameterName);
          break;
        case PARAMETER_TYPE.QUERY:
          args[index] = this.getParam(req, 'query', injectRoot, parameterName);
          break;
        case PARAMETER_TYPE.BODY:
          args[index] = req.body;
          break;
        case PARAMETER_TYPE.HEADERS:
          args[index] = this.getParam(req, 'headers', injectRoot, parameterName);
          break;
        case PARAMETER_TYPE.COOKIES:
          args[index] = this.getParam(req, 'cookies', injectRoot, parameterName);
          break;
        // case PARAMETER_TYPE.PRINCIPAL:
        //   args[index] = req.user;
        //   break;
        default:
          args[index] = res;
          break;
      }
    });

    args.push(req, res, next);
    return args;
  }

  private getParam(
    request: express.Request,
    paramType: string,
    injectRoot: boolean,
    name?: string
  ) {
    if (paramType === 'headers' && name) {
      name = name.toLocaleLowerCase();
    }

    let param = request[paramType];
    if (injectRoot) {
      return param;
    } else {
      return (param && name) ? param[name] : undefined;
    }
  }

}

export {
  RestExtension,
};
