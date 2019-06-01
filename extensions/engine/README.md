# kites-engine

Core Engine of Kites

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/@kites/engine.svg?style=flat)](https://www.npmjs.com/package/@kites/engine)
[![npm downloads](https://img.shields.io/npm/dm/@kites/engine.svg)](https://www.npmjs.com/package/@kites/engine)
[![Travis](https://travis-ci.org/vunb/kites-engine.svg?branch=stable)](https://travis-ci.org/vunb/kites-engine)

Kites is a framework providing `dynamic applications` assembling and `API` routing. It contains a lot of templates and extensions help build up applications quickly.

The engine is a core component that is responsible for connecting extensions and initializing in order to launch the Web application.

Simplest Example
================

Here below is `TypeScript` version: The application simply prints out a greeting: **Hello World!**

```ts
import engine from '@kites/engine';

async function bootstrap() {
    const app = await engine().init();
    app.logger.info('Hello World!');
}

bootstrap();
```

Node/JavaScript version:

```js
const engine = require('@kites/engine');

// init the kites engine
engine().init().then((core) => {
    core.logger.info('Hello World!')
})
```

API Usage
=========

* Read documentation at [kites.nodejs.vn](https://kites.nodejs.vn/documentation/)

Extensions auto discovery
=========================

Kites engine has an option to allow the application auto discover extensions in the directory tree. This means `kites` will searches for files `kites.config.js` which describes the extensions and applies all the extensions that are found automatically.

This is fundamental principle for allowing extensions as plugins to be automatically plugged into the system. The application completed with minimalist lines of code, but very powerful!

```ts
import engine from '@kites/engine';

async function bootstrap() {
    // let kites autodiscover the extensions
    const app = await engine(true).init();
    app.logger.info('A new kites engine started!');
}

bootstrap();
```

Kites extensions auto discovery might slows down the startup and can be explicitly override by using `use` function. The following code has a slightly complicated configuration for each extensions.

```js
import engine from '@kites/engine';
import express from '@kites/express';
import roomrtc from '@kites/roomrtc';

async function bootstrap() {
    const app = await engine()
        .use(express())
        .use(roomrtc())
        .init();

    app.logger.info('A new kites engine started!');
}

bootstrap();
```

Extensions
==========

You are welcome to write your own extension or even publish it to the community. Please check `test/extensions` to see an example.

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
import engine from '@kites/engine';
import winston from 'winston';

const app = engine();
app.logger.add(winston.transports.Console, { level: 'info' });
```


