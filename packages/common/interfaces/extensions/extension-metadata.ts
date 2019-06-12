import { Type } from "../type.interface";
import { Provider } from "../provider.interface";
import { DynamicExtension } from "./dynamic-extension";
import { Abstract } from "interfaces/abstract.interface";

export interface ExtensionMetadata {
  imports?: Array<
    Type<any> | DynamicExtension | Promise<DynamicExtension>
  >;
  controllers?: Type<any>[];
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
