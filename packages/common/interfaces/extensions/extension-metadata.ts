import { Abstract } from '../abstract.interface';
import { Provider } from '../provider.interface';
import { Type } from '../type.interface';
import { DynamicExtension } from './dynamic-extension';

export interface ExtensionMetadata {
  imports?: Array<
    Type<any> | DynamicExtension | Promise<DynamicExtension>
  >;
  controllers?: Array<Type<any>>;
  providers?: Array<Provider<any>>;
  exports?: Array<
    | DynamicExtension
    | Promise<DynamicExtension>
    | string
    | symbol
    | Provider<any>
    | Abstract<any>
    | Function
  >;
}
