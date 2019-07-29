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
