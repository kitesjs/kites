import { KitesFactory } from '@kites/core';
import Express from '@kites/express';
import Rest from '@kites/rest';
import { TodoService } from './todo/todo.service';

import './todo/todo.controller';

async function bootstrap() {
  const app = await KitesFactory
    .create({
      providers: [
        TodoService
      ]
    })
    .use(Express)
    .use(Rest)
    .init();

  // Let's browse http://localhost:3000/api/todo
  app.logger.info('Server started!');
}

bootstrap();
