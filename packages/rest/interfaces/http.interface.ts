import { Request, Response } from 'express';
import { HttpResponseMessage } from '../results/http-response-message';
import { UserPrincipal } from './auth-provider.interface';

export interface HttpContext {
  request: Request;
  response: Response;
  user: UserPrincipal;
}

export interface IHttpActionResult {
  executeAsync(): Promise<HttpResponseMessage>;
}
