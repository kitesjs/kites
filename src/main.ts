import { IKitesOptions } from '@kites/engine';
import * as path from 'path';
import pkg from '../package.json';
import { addTransports } from './extend-config';
import { Kites } from './kites';

/**
 * Export necessary things
 */
export { IKites, IKitesOptions, KitesInstance } from '@kites/engine';
export { Kites } from './kites';

/**
 * Extends Kites Core
 * @param {Object} options
 */
export default function kites(options?: boolean | IKitesOptions) {

  if (typeof options === 'boolean') {
    options = {
      discover: options
    };
  }

  const parent = module.parent || module;
  const optionsToUse = Object.assign({}, {
    discover: true,
    loadConfig: true,
    parentModuleDirectory: path.dirname(parent.filename),
    rootDirectory: path.join(__dirname, '../../../'),
  }, options);

  const core = new Kites(optionsToUse);
  core.version = pkg.version;

  return core.afterConfigLoaded(addTransports);
}
