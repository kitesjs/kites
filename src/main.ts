import { IKitesOptions } from '@kites/engine';
import * as path from 'path';
import pkg from '../package.json';
import { addTransports } from './extend-config';
import { Kites } from './kites';

/**
 * Export necessary things
 */
export { IKites, IKitesOptions, KitesCore} from '@kites/engine';
export { Kites } from './kites';

/**
 * Extends Kites Core
 * @param {Object} options
 */
export default function InitKites(options: IKitesOptions) {

    const parent = module.parent || module;
    const optionsToUse = Object.assign({}, {
        discover: true,
        loadConfig: true,
        parentModuleDirectory: path.dirname(parent.filename),
        rootDirectory: path.join(__dirname, '../../../'),
    }, options);

    const kites = new Kites(optionsToUse);
    kites.version = pkg.version;

    return kites.afterConfigLoaded(addTransports);
}
