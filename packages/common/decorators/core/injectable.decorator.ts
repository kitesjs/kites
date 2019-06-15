import { SCOPE_OPTIONS_METADATA } from '../../constants';
import { ScopeOptions } from '../../interfaces/scope-options.interface';

export interface InjectableOptions extends ScopeOptions { }

/**
 * Defines the injectable class.
 * This class can inject dependencies through constructor.
 * Those dependencies have to belong to the same extension.
 */
export function Injectable(options?: InjectableOptions): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
  };
}
