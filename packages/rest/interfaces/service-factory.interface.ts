/**
 * The factory used to instantiate the object services
 */
export interface ServiceFactory {
  /**
   * Create a new service object. Called before each request handling.
   */
  create: (serviceClass: Function, context: any) => any;

  /**
   * Return the type used to handle requests to the target service.
   * By default, returns the serviceClass received, but you can use this
   * to implement IoC integrations.
   */
  getTargetClass: (serviceClass: Function) => FunctionConstructor;
}
