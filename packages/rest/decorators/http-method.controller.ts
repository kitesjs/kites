import { METADATA_KEY } from '../constants';
import { ControllerMethodMetadata, HandlerDecorator } from '../interfaces/controller-metadata.interface';
import { Middleware } from '../interfaces/middleware.interface';

function HttpMethod(
  method: string,
  path: string,
  ...middleware: Middleware[]
): HandlerDecorator {
  return function (target: any, key: string, value: any) {
    const metadata: ControllerMethodMetadata = {
      key,
      method,
      middleware,
      path,
      target
    };

    let metadataList: ControllerMethodMetadata[] = [];

    if (!Reflect.hasMetadata(METADATA_KEY.ControllerMethod, target.constructor)) {
      Reflect.defineMetadata(METADATA_KEY.ControllerMethod, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getMetadata(METADATA_KEY.ControllerMethod, target.constructor);
    }

    // add to medata list
    metadataList.push(metadata);
  };
}

function All(path?: string, ...middleware: Middleware[]) {
  return HttpMethod('all', path, ...middleware);
}

function Get(path?: string, ...middleware: Middleware[]) {
  return HttpMethod('get', path, ...middleware);
}

function Post(path?: string, ...middleware: Middleware[]) {
  return HttpMethod('post', path, ...middleware);
}

function Put(path?: string, ...middleware: Middleware[]) {
  return HttpMethod('put', path, ...middleware);
}

function Patch(path?: string, ...middleware: Middleware[]) {
  return HttpMethod('patch', path, ...middleware);
}

function Head(path?: string, ...middleware: Middleware[]) {
  return HttpMethod('head', path, ...middleware);
}

function Delete(path?: string, ...middleware: Middleware[]) {
  return HttpMethod('delete', path, ...middleware);
}

/**
 * Export Http Methods
 */
export {
  HttpMethod,
  All,
  Get,
  Post,
  Put,
  Patch,
  Head,
  Delete
};
