import { InjectionToken } from '@kites/common/interfaces';
import * as path from 'path';
import { IKitesOptions, KitesInstance } from './kites-instance';

export const KITES_INSTANCE = new InjectionToken('KITES_INSTANCE');

/**
 * Return a new kites instance
 * @param options
 */
export function engine(options?: IKitesOptions | boolean) {
  if (typeof options === 'boolean') {
    options = {
      loadConfig: options,
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
  kites.container.addProvider({
    provide: KITES_INSTANCE,
    useValue: kites
  });

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
