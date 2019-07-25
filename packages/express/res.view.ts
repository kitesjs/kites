import { KitesInstance } from '@kites/core';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as _ from 'lodash';
import * as path from 'path';

export function mixinResView(kites: KitesInstance): RequestHandler {
  /**
   * Adds `res.view()` (an enhanced version of res.render) and `res.guessView()`
   * methods to response object.
   * `res.view()` automatically renders the appropriate view based on the
   * calling middleware's source route
   * Note: the original function is still accessible via res.render()
   *
   * @param {Request}  req
   * @param {Response} res
   * @param {Function} next
   */
  return function _addResViewMethod(req: Request, res: Response,
                                    next: NextFunction) {

    /**
     * res.view([specifiedPath|locals], [locals])
     *
     * @param {String} specifiedPath
     *        -> path to the view file to load (minus the file extension)
     *          relative to the app's `views` directory
     * @param {Object} locals
     *        -> view locals (data that is accessible in the view template)
     * @param {Function} optionalCb(err)
     *        -> called when the view rendering is complete (response is already
     * sent, or in the process)
     */
    res.view = function resView(/* specifiedPath, locals, optionalCb */) {

      var specifiedPath = arguments[0];
      var locals = arguments[1];
      var optionalCb = arguments[2];

      // By default, generate a path to the view using what we know about the
      // controller+action
      var relPathToView: any;

      req.options = _.defaults(req.options, {});

      // Try to guess the view by looking at the controller/action
      if (!req.options.view && req.options.action) {
        relPathToView = req.options.action.replace(/\./g, '/');
      } else {
        relPathToView = req.options.view;
      }

      // Now we have a reasonable guess in `relPathToView`

      // If the path to a view was explicitly specified, use that
      // Serve the view specified
      //
      // If first arg is not an obj or function, treat it like the path
      if (specifiedPath && !_.isObject(specifiedPath) &&
        !_.isFunction(specifiedPath)) {
        relPathToView = specifiedPath;
      }

      // If the "locals" argument is actually the "specifiedPath"
      // give em the old switcheroo
      if (!relPathToView && _.isString(arguments[1])) {
        relPathToView = arguments[1] || relPathToView;
      }

      // If first arg ISSSSS AN object, treat it like locals
      if (_.isObject(arguments[0])) {
        locals = arguments[0];
      }

      // If the second argument is a function, treat it like the callback.
      if (_.isFunction(arguments[1])) {
        optionalCb = arguments[1];
        // In which case if the first argument is a string, it means no locals
        // were specified,
        // so set `locals` to an empty dictionary and log a warning.
        if (_.isString(arguments[0])) {
          kites.logger.warn(
            '`res.view` called with (path, cb) signature (using path `' +
            specifiedPath +
            '`).  You should use `res.view(path, {}, cb)` to render a view without local variables.');
          locals = {};
        }
      }

      // If a view path cannot be inferred, send back an error instead
      if (!relPathToView) {
        var err = new Error();
        err.name = 'E_VIEW_INFER';
        err.message =
          'No path specified, and no path could be inferred from the request context.';

        // Prevent endless recursion:
        if (req._errorInResView) {
          return res.sendStatus(500);
        }
        req._errorInResView = err;

        if (optionalCb) {
          return optionalCb(err);
        } else {
          return res.serverError(err);
        }
      }

      // Ensure specifiedPath is a string (important)
      relPathToView = '' + relPathToView + '';

      // Ensure `locals` is an object
      locals = _.isObject(locals) ? locals : {};

      // Mixin locals from req.options.
      if (req.options.locals) {
        locals = _.merge(locals, req.options.locals);
      }

      // Merge with config views locals
      if (kites.express.options.views.locals) {
        // If user specifies locals data, use it
        // Otherwise use default config locals.
        _.defaults(locals, kites.express.options.views.locals);
      }

      // Trim trailing slash
      if (relPathToView[(relPathToView.length - 1)] === '/') {
        relPathToView = relPathToView.slice(0, -1);
      }

      // var pathToViews = kites.express.options.views.path;
      var pathToViews = req.app.get('views');
      var absPathToView = path.join(pathToViews, relPathToView);
      var absPathToLayout: any;
      var relPathToLayout;
      var layout = false;

      // Deal with layout options only if there is no custom rendering function
      // in place --
      // that is, only if we're using the default EJS layouts.
      if (!kites.express.options.views.getRenderFn) {
        layout = locals.layout;

        // If local `layout` is set to true or unspecified
        // fall back to global config
        if (locals.layout === undefined || locals.layout === true) {
          layout = kites.express.options.views.layout;
        }

        // Allow `res.locals.layout` to override if it was set:
        if (typeof res.locals.layout !== 'undefined') {
          layout = res.locals.layout;
        }

        // At this point, layout should be either `false` or a string
        if (typeof layout !== 'string') {
          layout = false;
        }

        // Set layout file if enabled (using ejs-locals)
        if (layout) {
          // Solve relative path to layout from the view itself
          // (required by ejs-locals module)
          absPathToLayout = path.join(pathToViews, layout);
          relPathToLayout =
            path.relative(path.dirname(absPathToView), absPathToLayout);

          // If a layout was specified, set view local so it will be used
          res.locals._layoutFile = relPathToLayout;

          // kites.logger.debug('Using layout at: ', absPathToLayout);
        }
      }

      // Locals passed in to `res.view()` override app and route locals.
      _.each(locals, (local, key) => { res.locals[key] = local; });

      // Provide access to view metadata in locals
      // (for convenience)
      if (_.isUndefined(res.locals.view)) {
        res.locals.view = {
          absPath: absPathToView,
          ext: kites.express.options.views.ext,
          path: relPathToView,
          pathFromApp:
            path.join(path.relative(kites.options.appDirectory + '',
              kites.express.options.views.path),
              relPathToView),
          pathFromViews: relPathToView,
        };
      }

      // Unless this is production, provide access to complete view path to view
      // via `__dirname` local.
      if (process.env.NODE_ENV !== 'production') {
        var extension = kites.express.options.views.ext || 'html';
        res.locals.__dirname =
          res.locals.__dirname || (absPathToView + '.' + extension);
      }

      // If silly logging is enabled, display some diagnostic information about
      // the res.view() call:
      if (specifiedPath) {
        kites.logger.debug('View override argument passed to res.view(): ',
          specifiedPath);
      }
      kites.logger.debug('Serving view at rel path: ', relPathToView, locals);
      kites.logger.debug('View root: ', kites.express.options.views.path);

      // Render the view
      return res.render(relPathToView, locals, function viewFailedToRender(
        renderErr, renderedViewStr) {

        // Prevent endless recursion:
        if (renderErr && req._errorInResView) {
          return res.status(500).send(renderErr);
        }

        if (renderErr) {
          req._errorInResView = renderErr;

          // Ensure that if res.serverError() likes to serve views,
          // it won't this time because we ran into a view error.
          req.wantsJSON = true;
        }

        // If specified, trigger `res.view()` callback instead of proceeding
        if (typeof optionalCb === 'function') {
          // The provided optionalCb callback will receive the error (if there
          // is one)
          // as the first argument, and the rendered HTML as the second
          // argument.
          return optionalCb(renderErr, renderedViewStr);
        } else {
          // if a template error occurred, don't rely on any of the Kites
          // request/response methods
          // (since they may not exist yet at this point in the request
          // lifecycle.)
          if (renderErr) {
            //////////////////////////////////////////////////////////////////
            // TODO:
            // Consider removing this log and deferring to the logging that is
            // happening in res.serverError() instead.
            // kites.logger.error('Error rendering view at ::', absPathToView);
            // kites.logger.error('with layout located at ::', absPathToLayout);
            // kites.logger.error(err && err.message);
            //
            //////////////////////////////////////////////////////////////////

            //////////////////////////////////////////////////////////////////
            // TODO:
            // Consider just calling some kind of default error handler fn here
            // in order to consolidate the "i dont know wtf i should do w/ this
            // err" logic.
            // (keep in mind the `next` we have here is NOT THE SAME as the
            // `next` from
            //  the point when this error occurred!  It is the next from when
            //  this
            //  method was initially attached to the request object in the views
            //  hook.)
            //
            if (res.serverError) {
              req.wantsJSON = true;
              return res.serverError(renderErr);
            } else if (process.env.NODE_ENV !== 'production') {
              return res.status(500).send(renderErr);
            } else {
              return res.sendStatus(500);
            }
            //
            //////////////////////////////////////////////////////////////////
          }

          // If verbose logging is enabled, write a log w/ the layout and view
          // that was rendered.
          kites.logger.debug('Rendering view: "%s" (located @ "%s")',
            relPathToView, absPathToView);
          if (layout) {
            kites.logger.debug(
              '• using configured layout:: %s (located @ "%s")', layout,
              absPathToLayout);
          }

          // Finally, send the compiled HTML from the view down to the client
          res.send(renderedViewStr);
          // kites.logger.info('Render: ' + renderedViewStr);
        }

      });
    };

    next();
  };
}
