import { KitesInstance } from '../engine/kites';
import { IKites } from '../main';

/**
 * Kites extension definition (callback)
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
 * Kites extension definition
 */
export interface KitesExtension {
    [key: string]: any;
    main?: string|Function|ExtensionDefinition; // TODO: remove
    name: string;
    options?: ExtensionOptions;
    directory?: string; // TODO: remove
    dependencies?: Array<string|Function|ExtensionDefinition>;
    init?: (app: IKites, options: ExtensionOptions) => any;
}
