import { INJECTABLE_METADATA_KEY, SCOPE_OPTIONS_METADATA } from '../../constants';
import { ScopeOptions } from '../../interfaces/scope-options.interface';
import { Type } from '../../interfaces/type.interface';

export interface InjectableOptions extends ScopeOptions { }

/**
 * Defines the injectable class.
 * This class can inject dependencies through constructor.
 * Those dependencies have to belong to the same extension.
 */
export function Injectable(options?: InjectableOptions) {
  return (target: any) => {
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, options || true, target);
    return target;
  };
}

export function isInjectable<T>(target: Type<T>) {
  return Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) === true;
}
