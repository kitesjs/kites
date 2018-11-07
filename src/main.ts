import Kites from '@kites/engine';
import * as path from 'path';
import pkg from '../package.json';
import { addTransports } from './extendConfig';

/**
 * Extends kites engine
 * @param {Object} options
 */
module.exports = (options: any) => {

    const optionsToUse = Object.assign({}, {
        discover: true,
        loadConfig: true,
        rootDirectory: path.join(__dirname, '../../../')
    }, options);

    const kites = Kites(optionsToUse);
    kites.version = pkg.version;

    return kites.afterConfigLoaded(addTransports);
};
