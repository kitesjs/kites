# kites

Template-based Web Application Framework

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/@kites/core.svg?style=flat)](https://www.npmjs.com/package/@kites/core)
[![npm downloads](https://img.shields.io/npm/dm/kites.svg)](https://www.npmjs.com/package/kites)
[![Travis](https://travis-ci.org/kitesjs/kites.svg?branch=stable)](https://travis-ci.org/kitesjs/kites)

**Kites** is a framework providing `dynamic applications` assembling and `Template-based` extracting. Namely it contains a lot of templates and extensions to help building a new application quickly.

Take a look at this:

```ts
@Launcher({
  imports?: [], // ... kites extensions manually imported here
  discover?: Array<string> | string | boolean; // autodiscover extensions in app's child directories or given path
})
class App {}
```

Features
=======

* Extension as a feature
* Storage mutiple providers
* Micro frontends development
* Autodiscover extensions
* Rich decorators system
* Event-driven programming

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

Simplest Application
====================

The application below simply prints out a greeting: **Hello World!**

`TypeScript` version:

```ts
import {engine} from '@kites/core';

async function bootstrap() {
  const app = await engine().init();
  app.logger.info('Hello World!');
}

bootstrap();
```

`JavaScript` version:

```js
const kites = require('@kites/core');

kites.engine().init().then((core) => {
  core.logger.info('Hello World!');
});
```

Documentation
=============

* See [Overview](https://kites.nodejs.vn/documentation/overview/) for an overview of concepts, guides and general documentation.
* See [Templates](https://kites.nodejs.vn/documentation/kites/templates/) for installation guides how to create a new project based on Kites Templates.

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

Extensions auto discovery
=========================

Kites has an option to allow the application auto discover extensions in the directory tree. This means `kites` will searches for files `kites.config.js` which describes the extensions and applies all the extensions that are found automatically.

This is fundamental principle for allowing extensions as plugins to be automatically plugged into the system. The application completed with minimalist lines of code, but very powerful!

```ts
import {engine} from '@kites/core';

async function bootstrap() {
  // let kites autodiscover the extensions
  const app = await engine(true).init();
  app.logger.info('A new kites started!');
}

bootstrap();
```

Kites extensions auto discovery might slows down the startup and can be explicitly override by using `use` function. The following code has a slightly complicated configuration for each extension which we want to use.

```ts
import {engine} from '@kites/core';
import express from '@kites/express';

async function bootstrap() {
  const app = await kites()
    .use(express)
    .on('express:config', app => {
      app.get('/hi', (req, res) => res.send('hello!'));
    })
    .init();

  app.logger.info(`Let's browse http://localhost:3000/hi`);
}

// let kites fly!
bootstrap();
```

# License

MIT License

Copyright (c) 2018 Nhữ Bảo Vũ

<a rel="license" href="./LICENSE" target="_blank"><img alt="The MIT License" style="border-width:0;" width="120px" src="https://raw.githubusercontent.com/hsdt/styleguide/master/images/ossninja.svg?sanitize=true" /></a>
