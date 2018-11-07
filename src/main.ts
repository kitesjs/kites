import Kites, { IKitesOptions } from '@kites/engine';
import * as path from 'path';
import pkg from '../package.json';
import { addTransports } from './extendConfig';

/**
 * Export necessary things
 */
export { IKites, KitesCore, IKitesOptions} from '@kites/engine';

// TODO: Create a new class name Kites extends KitesCore

/**
 * Extends Kites Core
 * @param {Object} options
 */
export function InitKites(options: IKitesOptions) {

    const parent = module.parent || module;
    const optionsToUse = Object.assign({}, {
        discover: true,
        loadConfig: true,
        parentModuleDirectory: path.dirname(parent.filename),
        rootDirectory: path.join(__dirname, '../../../'),
    }, options);

    const kites = Kites(optionsToUse);
    kites.version = pkg.version;

    return kites.afterConfigLoaded(addTransports);
}
