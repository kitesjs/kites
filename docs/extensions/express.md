# kites-express

Handling HTTP request for Kites

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/@kites/express.svg?style=flat)](https://www.npmjs.com/package/@kites/express)
[![npm downloads](https://img.shields.io/npm/dm/@kites/express.svg)](https://www.npmjs.com/package/@kites/express)

Features
========

* Extend express req/res utilities:
  * Properties
    * `req.kites` - Kites Instance
    * `req.wantsJSON`
  * Method
    * `req.param('paramName', 'defaultValue')`
    * `res.ok(data)`
    * `res.error(err)`
    * `res.badRequest(err)`
    * `res.serverError(err)`
    * `res.forbidden(err)`
* Rendering template using with express response helpers:
  * `res.view('path/to/template', data, callback)`
* Optional to enable static public directory, see extension options configuration
  * `express.static: false` (default)
  * `express.static: "path/to/public/directory"`


Options
=======

* **enabled**: Enable/disable extension (default: true)
* **static**: Public directory contains static files to serve client, default: `false`
* **httpPort**: Port which express listens to, default: `3000`
* **poweredBy**: Header `X-Powered-By` will response to client, default: `Kites`
* **views.ext**: View engine extension, default: `ejs`
* **views.engine**: View engine package which can be required, default: `ejs`
* **views.renderer**: Options describe how kites knows to initialize, default: `renderFile`
* **views.path**: Path contains view template, default: `<root-project-location>/views`
* **views.locals**: Default data send to view, default: `false`


API Usage
=========

### Request:

These helpers are utilities help you access kites and request information easily.

* `req.kites` - Access kites from http request
* `req.wantsJSON` - Flag indicating whether a request would like to receive a JSON response
* `req.param(name: string, default: any)` - Get param from user request

Ex:

```js
info (req, res) => {
  req.kites.logger.info('Access kites from Request!');

  return res.ok({
    from: 'kites',
    message: 'Hello World!'
  });
}
```

### Response:

These helpers are utilities help you handling response and generating template.

* `res.view()` - an enhanced version of res.render
* `res.ok(data)` - 200 OK. Return data for client, auto detect JSON needed from request.
* `res.error(err)` - 40x, 50x Response. Return error message for client, auto detect error, 400 default.
* `res.badRequest(err)` - 400 Bad request
* `res.notFound(err)` - 404 Not found
* `res.forbidden(err)` - 403 Forbidden
* `res.serverError(err)` - 500 Server error

### Kites Express Events:

Some events can easily override to make program has the right behaviour.

* `express:before:config` - Before express configured
* `express:config` - Custom express configuration
* `express:config:view` - Before view engine configured, if the event return false, kites express default engine will be used 
* `express:config:static`
* `express:config:done`

Example
=======

You can apply this extention manually to [kites-engine](https://github.com/vunb/kites-engine)

```js
import kites from '@kites/engine';
import express from '@kites/express';

kites().use(express());
```

Just install the extension as a dependency:

```bash
npm install @kites/express
```

Example:

Configure view engine: `Pug`

```json
{
    "views": {
        "ext": "pug",
        "engine": "consolidate"
    }
}
```

Configure view engine: `Handlebars`

```json
{
    "views": {
        "ext": "hbs",
        "engine": "hbs",
        "renderer": "__express",
        "locals": false,
        "path": "./views"
    }
}
```

Configure view engine: `Dust.js by LinkedIn`

```json
{
    "views": {
        "engine": "adaro",
        "renderer": {
            "method": "dust",
            "arguments": [{
                "cache": false,
                "helpers": ["dust-helpers-whatevermodule"]
            }]
        }
    }
}
```
