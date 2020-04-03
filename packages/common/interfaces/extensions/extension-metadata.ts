import { Provider } from '../provider.interface';
import { Abstract, Newable } from '../type.interface';
import { DynamicExtension } from './dynamic-extension';

export interface ExtensionMetadata {
  imports?: Array<
    Newable<any> | DynamicExtension | Promise<DynamicExtension>
  >;
  controllers?: Array<Newable<any>>;
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
