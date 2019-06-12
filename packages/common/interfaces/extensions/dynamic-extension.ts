import { ExtensionMetadata } from './extension-metadata';
import { Type } from '../type.interface';

export interface DynamicExtension extends ExtensionMetadata {
  extension: Type<any>;
}
