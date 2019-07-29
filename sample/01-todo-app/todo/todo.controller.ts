import { Controller, Get, Put, RequestParam } from '@kites/rest';
import { TodoService } from './todo.service';

@Controller('/todo')
export class TodoController {

  constructor(public svTodo: TodoService) { }

  @Get('/') test() {
    return this.svTodo.getAll();
  }

  @Put('/:id') begin(@RequestParam('id') task) {
    return this.svTodo.begin(task);
  }
}
