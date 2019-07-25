import { INJECTABLE_METADATA_KEY, PARAMTYPES_METADATA, SCOPE_OPTIONS_METADATA } from '../../constants';
import { ScopeOptions } from '../../interfaces/scope-options.interface';
import { Type } from '../../interfaces/type.interface';

export interface InjectableOptions extends ScopeOptions { }

/**
 * Defines the injectable class.
 * This class can inject dependencies through constructor.
 * Those dependencies have to belong to the same extension.
 */
export function Injectable() {
  return (target: any) => {

    if (Reflect.hasOwnMetadata(INJECTABLE_METADATA_KEY, target)) {
      throw new Error('Duplicated injectable decorator');
    }

    const types = Reflect.getMetadata(PARAMTYPES_METADATA, target) || [];

    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, types, target);
    return target;
  };
}

export function isInjectable<T>(target: Type<T>) {
  // return Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) === true;
  return Reflect.hasOwnMetadata(INJECTABLE_METADATA_KEY, target);
}
