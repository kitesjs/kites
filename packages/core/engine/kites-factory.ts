import * as path from 'path';
import { DependenciesScanner } from '../injector/scanner';
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
  kites.initializeListeners.add('register:providers', () => {
    kites.logger.info('Register providers ...');
    if (opts.providers !== undefined) {
      opts.providers.forEach(provider => {
        kites.container.addProvider({
          provide: provider,
          useClass: provider
        });
      });
    }
  });
  return kites;
}

export class KitesFactory {
  static create(options?: IKitesOptions | boolean): KitesInstance {
    return engine(options);
  }
}
