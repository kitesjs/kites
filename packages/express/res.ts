import { KitesInstance } from '@kites/core';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as _ from 'lodash';

export function mixinRes(kites: KitesInstance): RequestHandler {
  return function _mixinRes(req: Request, res: Response, next: NextFunction) {
    /**
     * 200 (OK) Response
     *
     * Usage:
     * return res.ok();
     * return res.ok(data);
     *
     * @param  {JSON?} data
     */
    res.ok = function sendOk(data: any) {
      // set status code
      res.status(200);
      if (req.wantsJSON || data && _.isFunction(data.toJSON)) {
        return res.json(data);
      } else {
        return res.send(data);
      }

    };

    /**
     * 400, 500 (Server Error) Response
     *
     * Usage:
     * return res.error();
     * return res.error(err);
     *
     * NOTE:
     * If something throws in a policy or controller, or an internal
     * error is encountered, Kites will call `res.error()`
     * automatically.
     */
    res.error = function sendError(err: any) {
      if (_.isString(err) || !_.isObject(err)) {
        err = { message: err };
      }

      err = err || {};
      if (typeof err.message === 'undefined') {
        err.message = 'Unrecognized error';
      }

      if (err.unauthorized) {
        res.setHeader('WWW-Authenticate',
          `${req.authSchema || 'Basic'} realm='realm'`);
        res.status(401);
      } else if (/^ENOTFOUND/i.test(err.message)) {
        res.status(404);
      } else if (/^EBADPARAM/i.test(err.message)) {
        res.status(400);
      } else if (_.isNumber(err.status) && err.status > 0) {
        res.status(err.status);
      } else {
        // log error info
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        var logFn = err.weak ? kites.logger.warn : kites.logger.error;

        logFn('Error during processing request: ' + fullUrl + ' details: ' +
          err.message + ' ' + err.stack);
        res.status(500);
      }

      if (req.wantsJSON) {
        return res.json({ message: err.message, stack: err.stack });
      } else {
        return res.send(`
                    Error occured - ${err.message}
                    Stack - ${err.stack}
                `);
      }
    };

    /**
     * 500 (Server Error) Response
     *
     * Usage:
     * return res.serverError();
     * return res.serverError(err);
     *
     *
     */
    res.serverError = function sendServerError(err: any) {
      if (_.isString(err)) {
        err = { message: err };
      }

      err = err || {};
      err.message = err.message || 'Unknow error';

      // log error
      kites.logger.error('Server got an error: ' + err.message, err);

      // Set status code
      res.status(500);

      // If appropriate, serve data as JSON.
      if (req.wantsJSON) {
        // If no data was provided, use res.sendStatus().
        if (_.isUndefined(err)) {
          return res.sendStatus(500);
        }

        // If the data is an error instance and it doesn't have a custom
        // .toJSON(),
        // use its stack instead (otherwise res.json() will turn it into an
        // empty dictionary).
        if (!_.isFunction(err.toJSON)) {
          err = err.stack;
          // No need to stringify the stack (it's already a string).
          return res.send(err);
        }
        return res.json(err);
      } else {
        return res.send(`
                    Error occured - ${err.message}
                    Stack - ${err.stack}
                `);
      }
    };

    /**
     * 404 (Not Found) Handler
     *
     * Usage:
     * return res.notFound();
     * return res.notFound(err);
     *
     *
     */
    res.notFound = function sendErrorNotFound(err: any) {
      // set the status code
      res.status(404);
      // check send data as JSON
      if (req.wantsJSON) {
        // check detail error
        if (!err) {
          return res.sendStatus(res.statusCode);
        }
        if (!_.isFunction(err.toJSON)) {
          err = err.stack;
          return res.send(err);
        }
        // send json error
        return res.json(err);
      } else {
        return res.send(err);
      }
    };

    /**
     * 400 (Bad Request) Handler
     *
     * Usage:
     * return res.badRequest();
     * return res.badRequest(data);
     *
     * e.g.:
     * ```
     * return res.badRequest(
     *   'Please choose a valid `password` (6-12 characters)',
     *   'trial/signup'
     * );
     * ```
     */
    res.badRequest = function sendErrorBadRequest(err: any) {
      // set the status code
      res.status(400);
      // check send data as JSON
      if (req.wantsJSON) {
        // check detail error
        if (!err) {
          return res.sendStatus(res.statusCode);
        }
        if (!_.isFunction(err.toJSON)) {
          err = err.stack;
          return res.send(err);
        }
        // send json error
        return res.json(err);
      } else {
        return res.send(err);
      }
    };

    /**
     * 403 (Forbidden) Handler
     *
     * Usage:
     * return res.forbidden();
     *
     * e.g.:
     * ```
     * return res.forbidden();
     * ```
     */
    res.forbidden = function sendErrorForbidden(err: any) {

      // set the status code
      res.status(403);

      // check send data as JSON
      if (req.wantsJSON) {
        // check detail error
        if (!err) {
          return res.sendStatus(res.statusCode);
        }
        // check data error
        if (!_.isFunction(err.toJSON)) {
          err = err.stack;
          return res.send(err);
        }
        // send json error
        return res.json(err);
      } else {
        return res.send(err);
      }
    };

    next();
  };
}
