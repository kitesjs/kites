
import { Token } from '@kites/common';
import * as express from 'express';

export type Middleware = (Token<any> | express.RequestHandler);
