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

  @Get('') list() {
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
