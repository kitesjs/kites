import * as path from 'path';
import { IKitesOptions, KitesInstance } from './kites-instance';

/**
 * Return a new kites instance
 * @param options
 */
export function engine(options?: IKitesOptions | boolean) {
  if (typeof options === 'boolean') {
    options = {
      discover: options
    };
  }

  // create kites instance
  let parent = module.parent || module;
  let opts = Object.assign({
    parentModuleDirectory: path.dirname(parent.filename)
  }, options);

  // init a new kites
  const kites = new KitesInstance(opts);
  kites.initializeListeners.add('scan', () => {
    kites.logger.info('Scanning ....');
  });
  return kites;
}
