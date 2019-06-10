import * as path from 'path';
import {IKitesOptions, KitesInstance} from './engine/kites';

export {
  EventCollectionEmitter,
  ICollectionItem,
} from './engine/event-collection';
export { IKites, KitesInstance, IKitesOptions } from './engine/kites';
export { KitesExtension, ExtensionDefinition, ExtensionOptions } from './extensions/extensions';

/**
 * Return a new kites instance
 * @param options
 */
export default function engine(options?: IKitesOptions | boolean) {
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
    return new KitesInstance(opts);
}
