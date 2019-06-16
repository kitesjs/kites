import { Abstract } from '../abstract.interface';
import { Provider } from '../provider.interface';
import { Type } from '../type.interface';
import { DynamicExtension } from './dynamic-extension';

export interface ExtensionMetadata {
  imports?: Array<
    Type<any> | DynamicExtension | Promise<DynamicExtension>
  >;
  controllers?: Array<Type<any>>;
  providers?: Provider[];
  exports?: Array<
    | DynamicExtension
    | Promise<DynamicExtension>
    | string
    | symbol
    | Provider
    | Abstract<any>
    | Function
  >;
}
