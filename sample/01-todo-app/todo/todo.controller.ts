import { Controller, Get } from '@kites/rest';
import { TodoService } from './todo.service';

@Controller('/todo')
export class TodoController {

  constructor(public svTodo: TodoService) {}

  @Get('/') test() {
    return this.svTodo.getAll();
  }
}
