/*!
 * Copyright(c) 2018 Nhu Bao Vu
 *
 * @kites/express handles http requests for kites.
 */

import { ExtensionOptions, IKites, KitesExtension, KitesInstance } from '@kites/core';
import config from './kites.config';
import main from './main';

/// <reference types="express"/>
import * as e from 'express';
import * as _ from 'lodash';

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

export default function (options?: ExtensionOptions) {
  const definition: KitesExtension = config;
  definition.options = options;
  definition.main = main;
  definition.directory = __dirname;
  return definition;
}
