import { DESIGN_PARAM_TYPES, PARAM_TYPES } from '../../constants';
import { DUPLICATED_INJECTABLE_DECORATOR } from '../../constants/error.messages';
import { ScopeOptions } from '../../interfaces/scope-options.interface';
import { Newable } from '../../interfaces/type.interface';

export interface InjectableOptions extends ScopeOptions { }

/**
 * Defines the injectable class.
 * This class can inject dependencies through constructor.
 * Those dependencies have to belong to the same extension.
 */
export function Injectable() {
  return (target: any) => {

    if (Reflect.hasOwnMetadata(PARAM_TYPES, target)) {
      throw new Error(DUPLICATED_INJECTABLE_DECORATOR);
    }

    const types = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    Reflect.defineMetadata(PARAM_TYPES, types, target);

    return target;
  };
}

export function isInjectable<T>(target: Newable<T>) {
  // return Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) === true;
  return Reflect.hasOwnMetadata(PARAM_TYPES, target);
}
