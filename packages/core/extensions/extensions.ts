import { Type } from '../../common/interfaces/type.interface';
import { KitesInstance } from '../engine/kites-instance';
import { IKites } from '../index';

/**
 * Kites extension definition
 */
export type ExtensionDefinition = (kites: IKites | KitesInstance, definition: ExtensionOptions) => void;

/**
 * Kites extension options
 */
export interface ExtensionOptions {
  [key: string]: any;
  enabled?: boolean;
  name?: string;
}

/**
 * Kites extension definition TODO:  extends Type<any>
 */
export interface KitesExtension {
  [key: string]: any;
  main?: string | Function | ExtensionDefinition;
  name: string;
  options?: ExtensionOptions;
  directory?: string;
  dependencies?: string[];
  init?: (app?: IKites, options?: ExtensionOptions) => any;
}
