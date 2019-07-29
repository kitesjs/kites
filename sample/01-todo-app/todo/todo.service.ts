import { Injectable } from '@kites/common';

@Injectable()
export class TodoService {
  public getAll(): string {
    return 'Get all todos!!!';
  }

  begin(task: string) {
    return `Start: ${task}`;
  }
}
