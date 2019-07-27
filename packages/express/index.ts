/*!
 * Copyright(c) 2018 Nhu Bao Vu
 *
 * @kites/express handles http requests for kites.
 */

import { ExtensionOptions, IKites, KitesExtension, KitesInstance } from '@kites/core';

/// <reference types="express"/>
import * as e from 'express';
import * as _ from 'lodash';
import { ExpressExtension } from './express.extension';

// Add RequestValidation Interface on to Express's Request Interface.
declare global {
  namespace Express {
    interface Request extends KitesExpressExtension.ApiRequest { }
    interface Response extends KitesExpressExtension.ApiResponse { }
  }

  // extends kites properties
  // interface IKites {
  //   express: KitesExpress;
  // }
}

// Internal Module.
declare namespace KitesExpressExtension {

  type ApiOkResponse = (data?: any) => e.Response;
  type ApiViewResponse = (view?: string, options?: any, cb?: Function) => e.Response;
  type ApiErrorResponse = (err: Error | string | any) => e.Response;

  export interface ApiRequest {
    kites: KitesInstance;
    wantsJSON: boolean;
    isSocket: boolean;
    explicitlyAcceptsHTML: boolean;
    options?: any;
    authSchema?: string;
    _errorInResView?: any;

    param(name: string, defaultValue?: string): string;
  }

  export interface ApiResponse {
    ok: ApiOkResponse;
    view: ApiViewResponse;
    error: ApiErrorResponse;
    serverError: ApiErrorResponse;
    notFound: ApiErrorResponse;
    badRequest: ApiErrorResponse;
    forbidden: ApiErrorResponse;
  }
}

export { Express, Router, Request, Response, NextFunction, Application } from 'express';

export default function Express(kites: KitesInstance, definition: KitesExtension) {
  kites.options.appPath = kites.options.appPath || '/';

  if (kites.options.appPath.substr(-1) !== '/') {
    kites.options.appPath += '/';
  }

  kites.options.express = definition.options || {};
  kites.options.httpPort =
    kites.options.express.httpPort || kites.options.httpPort;
  kites.express = definition;

  var extension = new ExpressExtension(kites, kites.options.express);
  kites.initializeListeners.add(definition.name, extension.init.bind(extension));
}

// export default function express(options?: ExtensionOptions) {
//   // deep clone & extend user options
//   let definition = _.clone(config);
//   definition.options = _.extend({}, definition.options, options);
//   definition.directory = __dirname;
//   definition.main = createExpress;
//   return definition;
// }
