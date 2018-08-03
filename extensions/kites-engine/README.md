# kites-engine

Core Engine of Kites

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/@kites/engine.svg?style=flat)](https://www.npmjs.com/package/@kites/engine)
[![npm downloads](https://img.shields.io/npm/dm/@kites/engine.svg)](https://www.npmjs.com/package/@kites/engine)
[![Travis](https://travis-ci.org/vunb/kites-engine.svg?branch=stable)](https://travis-ci.org/vunb/kites-engine)

Kites is a framework providing `dynamic applications` assembling and `API` routing. It contains a lot of templates and extensions help build up applications quickly.

Extensions
==========

You are welcome to write your own extension or even publish it to the community.

TODO:

* Write an article for implementing custom kites extension

Extensions auto discovery
=========================

Kites by default auto discovers extensions in the application's directory tree. This means `kites` by default searches for files kites.config.js which describes the extensions and applies all the extensions that are found.

```js
// let kites autodiscover the extensions
var kites = require('@kites/engine')({
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

Kites extensions auto discovery slows down the startup and can be explicitly overrided using `use` function

```js
// do not let kites autodiscover the extensions
// do not load extensions from locations cache
var kites = require('@kites/engine')({
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
var kites = require('@kites/engine')();
var winston = require('winston');
kites.logger.add(winston.transports.Console, { level: 'info' });
```


