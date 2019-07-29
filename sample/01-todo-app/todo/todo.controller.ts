import { Controller, Get, Put, RequestParam } from '@kites/rest';
import { TodoService } from './todo.service';

@Controller('/todo')
export class TodoController {

  constructor(public svTodo: TodoService) { }

  @Get('/') list() {
    return this.svTodo.getAll();
  }

  @Get('/:id') details(@RequestParam('id') task) {
    return this.svTodo.get(task);
  }

  @Put('/:id') begin(@RequestParam('id') task) {
    return this.svTodo.begin(task);
  }
}
