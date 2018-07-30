# kites

Template-based Web Application Framework

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/kites.svg?style=flat)](https://www.npmjs.com/package/kites)
[![npm downloads](https://img.shields.io/npm/dm/kites.svg)](https://www.npmjs.com/package/kites)
[![Travis](https://travis-ci.org/vunb/kites.svg?branch=master)](https://travis-ci.org/vunb/kites)

**Kites** is a framework providing `dynamic applications` assembling and `Template-based` extracting. Namely it contains a lot of templates and extensions to help building a new application quickly.

Installation
============

```bash
# install kites cli
$ npm install -g @kites/cli

# init a project
kites init my-project --template mvc

# move to project workspace
cd my-project

# install dependencies
npm install

# run app server, navigate browser at http://localhost:3000
npm start
```

Development environment:

```bash
# start project in development mode
npm run dev
```

To change environment use cmd `set NODE_ENV=development` or use options your IDE provides. If you don't specify node environment kites assumes `development` as default.

Documentation
=============

* See https://kites.nodejs.vn/documentation/overview/ for an overview of concepts, guides and general documentation.
* See https://kites.nodejs.vn/documentation/kites/templates/ for installation guides how to create a new project based on Kites Templates.

Templates
=========

Here is the list of **built-in templates** and their implementation status:

* [x] `mvc`: Assembling all into complete ship (**default**)
* [x] `basic`: Template for building from scratch
* [x] `apidoc`: Template for API Documentation
* [x] `express`: Template for Express Application
* [x] `chatbot`: Template for generating an AI Chatbot

More templates, checkout [issue #1](https://github.com/vunb/kites/issues/1)

Extensions
==========

**Kites** is an eco-system and has many modules which can be assembled into a larger application. You are welcome to write your own extension or even publish it to the community.

TODO:

* Write an article for implementing custom kites extension

Extensions auto discovery
=========================

Kites by default auto discovers extensions in the application's directory tree. This means `kites` by default searches for files `kites.config.js` which describes the extensions and applies all the extensions that are found.

```js
// let kites autodiscover the extensions
var kites = require('kites')({
    logger: {
        console: {
        transport: 'console',
        level: 'debug'
    }
});

// init the kites
kites.init().then(() => {
    kites.logger.info('done!')
})
```

Kites extensions auto discovery slows down the startup and can be explicitly using `use` function with mode `discover: false`

```js
// do not let kites autodiscover the extensions
// do not load extensions from locations cache
var kites = require('kites')({
    discover: false,
    extensionsLocationCache: false,
    logger: {
        console: {
        transport: 'console',
        level: 'debug'
    }
});

// explicitly use extensions
kites.use(require('@kites/express')())
    .use(require('@kites/roomrtc')())
    .use(require('./path/to/your/extension')())
    .init().then((kites) => {
        kites.logger.info('done!')
    })
```

Logging
=======

kites leverages [winston](https://github.com/winstonjs/winston) logging abstraction together with [debug](https://github.com/visionmedia/debug) utility. To output logs in the console just simply set the DEBUG environment variable

```bash
DEBUG=kites node app.js
```

on windows:

```bash
set DEBUG=kites & node app.js
```

kites exposes `logger` property which can be used to adapt the logging as you like. You can for example just add [winston](https://github.com/winstonjs/winston) console transport and filter in only important log messages into console.

```js
var kites = require('kites')();
var winston = require('winston');
kites.logger.add(winston.transports.Console, { level: 'info' });
```

# License

MIT License

Copyright (c) 2018 Nhữ Bảo Vũ

<a rel="license" href="./LICENSE" target="_blank"><img alt="The MIT License" style="border-width:0;" width="120px" src="https://raw.githubusercontent.com/hsdt/styleguide/master/images/ossninja.svg?sanitize=true" /></a>
