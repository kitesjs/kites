import { Newable } from '../type.interface';
import { ExtensionMetadata } from './extension-metadata';

export interface DynamicExtension extends ExtensionMetadata {
  extension: Newable<any>;
}
