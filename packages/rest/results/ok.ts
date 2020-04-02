import { IHttpActionResult } from '../interfaces';
import { HttpResponseMessage } from './http-response-message';

/**
 * Response HTTP 200 OK
 */
export default class OkResult implements IHttpActionResult {
  constructor() { }

  public async executeAsync() {
    return new HttpResponseMessage(200);
  }
}
