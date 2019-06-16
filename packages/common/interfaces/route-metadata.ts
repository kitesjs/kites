import { RequestMethod } from '../http/request-medthod';

export interface RouteMetadata {
  path: string | string[];
  method: RequestMethod;
}
