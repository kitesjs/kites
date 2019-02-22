# kites-engine

Core Engine of Kites

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/@kites/engine.svg?style=flat)](https://www.npmjs.com/package/@kites/engine)
[![npm downloads](https://img.shields.io/npm/dm/@kites/engine.svg)](https://www.npmjs.com/package/@kites/engine)
[![Travis](https://travis-ci.org/vunb/kites-engine.svg?branch=stable)](https://travis-ci.org/vunb/kites-engine)

Kites is a framework providing `dynamic applications` assembling and `API` routing. It contains a lot of templates and extensions help build up applications quickly.

Extensions auto discovery
=========================

Kites by default auto discovers extensions in the application's directory tree. This means `kites` by default searches for files `kites.config.js` which describes the extensions and applies all the extensions that are found. You have a short code, but powerful!

TypeScript version:

```ts
// let kites autodiscover the extensions
import kites from '@kites/engine';

async function bootstrap() {
    const app = await kites().init();
    app.logger.info('A new kites started!');
}

bootstrap();
```

Node/JavaScript version:

```js
// let kites autodiscover the extensions
const kites = require('@kites/engine');

// init the kites
kites().init().then((app) => {
    app.logger.info('A new kites started!')
})
```

Kites extensions auto discovery might slows down the startup and can be explicitly override by using `use` function. The following code snippet is more complex a bit.

```js
import kites from '@kites/engine';
import express from '@kites/express';
import roomrtc from '@kites/roomrtc';

async function bootstrap() {
    const app = await kites({
        discover: false,        // do not let kites autodiscover the extensions
        extensionsLocationCache: false, // do not load extensions from locations cache
        logger: {
            console: {
            transport: 'console',
            level: 'debug'
        }
    })
    .use(express())
    .use(roomrtc())
    .init();

    app.logger.info('A new kites started!');
}

bootstrap();
```

Extensions
==========

You are welcome to write your own extension or even publish it to the community.

TODO:

* Write an article for implementing custom kites extension

Logging
=======

kites leverages [winston 2](https://github.com/winstonjs/winston) logging abstraction together with [debug](https://github.com/visionmedia/debug) utility. To output logs in the console just simply set the DEBUG environment variable

```bash
DEBUG=kites node app.js
```

on windows:

```bash
set DEBUG=kites & node app.js
```

kites exposes `logger` property which can be used to adapt the logging as you like. You can for example just add [winston](https://github.com/winstonjs/winston) console transport and filter in only important log messages into console.

```ts
import kites from '@kites/engine';
import winston from 'winston';

const app = kites();
app.logger.add(winston.transports.Console, { level: 'info' });
```


