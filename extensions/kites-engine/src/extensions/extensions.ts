import { IKites } from '../main';

/**
 * Kites extension definition (callback)
 */
export type KitesExtensionDefinition = (kites: IKites, definition: KitesExtention) => void;

/**
 * Kites extension definition
 */
export class KitesExtention {
    main: Function|KitesExtensionDefinition;
    name: string;
    options?: boolean|any;
    directory: string;
    dependencies?: Array<string|Function|KitesExtensionDefinition>;
}
