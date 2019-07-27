import { METHOD_METADATA, PATH_METADATA } from '../../constants';
import { RequestMethod } from '../../http/request-medthod';
import { RouteMetadata } from '../../interfaces/route-metadata';

const defaultMetadata: RouteMetadata = {
  [PATH_METADATA]: '/',
  [METHOD_METADATA]: RequestMethod.GET
};

export function Route(metadata: RouteMetadata = defaultMetadata): MethodDecorator {
  const path = metadata.path || '/';
  const requestMethod = metadata.method || RequestMethod.GET;

  // console.log('Route: ', path, requestMethod);

  return (target, key, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
    Reflect.defineMetadata(METHOD_METADATA, requestMethod, descriptor.value);
    return descriptor;
  };
}

/**
 * Create route decorator helper
 * @param method
 */
function createRouteDecorator(method: RequestMethod) {
  return (path?: string | string[]) => Route({
    method: method,
    path: path,
  });
}

/**
 * Pre-defined well-know http method
 */
export const Get = createRouteDecorator(RequestMethod.GET);
export const Post = createRouteDecorator(RequestMethod.POST);
export const Put = createRouteDecorator(RequestMethod.PUT);
export const Delete = createRouteDecorator(RequestMethod.DELETE);
export const Patch = createRouteDecorator(RequestMethod.PATCH);
export const All = createRouteDecorator(RequestMethod.ALL);
export const Options = createRouteDecorator(RequestMethod.OPTIONS);
export const Head = createRouteDecorator(RequestMethod.HEAD);
