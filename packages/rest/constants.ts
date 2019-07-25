const TYPE = {
  AuthProvider: Symbol.for('AuthProvider'),
  Controller: Symbol.for('Controller'),
  HttpContext: Symbol.for('HttpContext')
};

const METADATA_KEY = {
  Controller: 'kites:controller',
  ControllerMethod: 'kites:controller-method',
  ControllerParameter: 'kites:controller-parameter',
  HttpContext: 'kites:httpcontext'
};

enum PARAMETER_TYPE {
  REQUEST,
  RESPONSE,
  PARAMS,
  QUERY,
  BODY,
  HEADERS,
  COOKIES,
  NEXT,
  PRINCIPAL
}

const DUPLICATED_CONTROLLER_NAME = (name: string) =>
  `Two controllers cannot have the same name: ${name}`;

const NO_CONTROLLERS_FOUND = 'No controllers have been found! ' +
  'Please ensure that you have register at least one Controller.';

const DEFAULT_ROUTING_ROOT_PATH = '/';

export {
  TYPE,
  METADATA_KEY,
  PARAMETER_TYPE,
  DUPLICATED_CONTROLLER_NAME,
  NO_CONTROLLERS_FOUND,
  DEFAULT_ROUTING_ROOT_PATH,
};
