# @kites/rest

Decorate RESTful API using TypeScript decorators.

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/@kites/rest.svg?style=flat)](https://www.npmjs.com/package/@kites/rest)
[![npm downloads](https://img.shields.io/npm/dm/@kites/rest.svg)](https://www.npmjs.com/package/@kites/rest)

Main Features
=============

* [x] Decorate HTTP API Controllers
* [x] Define optional api prefix in route
* [ ] HTTP context management

Extension Options
=================

* apiPrefix: Configure api prefix for all controllers

API Usage
=========

### Decorators

Dercorators are defined in the package:

* @Controller
* @Get, @Post, @Put, @Delete, @Patch
* @Request, @RequestBody, @RequestParam, @QueryParam, @Params, 
* @Response,
* Principal, UserPrincipal,
* Data: JsonContent, StringContent, ...

### HTTP Context

TODO: update

Example
=======

Define a simple TODO service:

```ts
import { Injectable } from '@kites/common';

@Injectable()
export class TodoService {
  getAll(): string {
    return 'Get all todos!!!';
  }

  get(task: string) {
    return `Get details: ${task}`;
  }

  begin(task: string) {
    return `Start: ${task}`;
  }
}
```

Define a simple TODO controller:

```ts
// ./todo/todo.controller.ts
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { Controller, Get, Put, RequestParam } from '@kites/rest';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {

  constructor(
    public svTodo: TodoService,
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
  ) {
    kites.logger.info('Hello %s controller!!! (%s)', 'todo', 3);
    kites.logger.info(svTodo.getAll());
  }

  @Get('')
  list() {
    this.kites.logger.info('get all todo!!');
    return this.svTodo.getAll();
  }

  @Get(':id')
  details(@RequestParam('id') task) {
    return this.svTodo.get(task);
  }

  @Put('/:id')
  begin(@RequestParam('id') task) {
    return this.svTodo.begin(task);
  }
}
```

In the main app:

```ts
import { KitesFactory } from '@kites/core';
import Express from '@kites/express';
import Rest from '@kites/rest';
import { TodoService } from './todo/todo.service';

import './todo/todo.controller';

async function bootstrap() {
  const app = await KitesFactory
    .create({
      loadConfig: true,
      discover: false,
      providers: [
        TodoService
      ]
    })
    .use(Express())
    .use(Rest())
    .init();

  // Let's browse http://localhost:3000/api/todo
  app.logger.info('Server started!');
}

bootstrap();
```
