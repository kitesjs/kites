import { KitesInstance } from '../engine/kites';
import { IKites } from '../main';

/**
 * Kites extension definition (callback)
 */
export type ExtensionDefinition = (kites: IKites | KitesInstance, definition: ExtentionOptions) => void;

/**
 * Kites extension options
 */
export interface ExtentionOptions {
    [key: string]: any;
    enabled?: boolean;
    name?: string;
}

/**
 * Kites extension definition
 */
export interface KitesExtention {
    [key: string]: any;
    main?: string|Function|ExtensionDefinition; // TODO: remove
    name: string;
    options?: boolean|any;
    directory?: string; // TODO: remove
    dependencies?: Array<string|Function|ExtensionDefinition>;
    init?: (app: IKites, options: ExtentionOptions) => any;
}
