import { Token } from '@kites/common/interfaces';
import * as express from 'express';

export type Middleware = (Token<any> | express.RequestHandler);
