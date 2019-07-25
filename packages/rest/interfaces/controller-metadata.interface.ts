import { PARAMETER_TYPE } from '../constants';
import { Middleware } from './middleware.interface';

interface ControllerMetadata {
  path: string;
  middleware: Middleware[];
  target: any;
}

interface ParameterMetadata {
  parameterName?: string;
  injectRoot: boolean;
  index: number;
  type: PARAMETER_TYPE;
}

interface ControllerMethodMetadata extends ControllerMetadata {
  method: string;
  key: string;
}

interface ControllerParameterMetadata {
  [methodName: string]: ParameterMetadata[];
}

type HandlerDecorator = (target: any, key: string, value: any) => void;

export {
  ControllerMetadata,
  ParameterMetadata,
  ControllerMethodMetadata,
  ControllerParameterMetadata,
  HandlerDecorator,
};
