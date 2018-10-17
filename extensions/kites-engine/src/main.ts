import * as path from 'path';
import {IKitesOptions, KitesCore} from './engine/kites';

export {
  EventCollectionEmitter,
  ICollectionItem,
} from './engine/event-collection';
export {KitesCore, IKitesOptions} from './engine/kites';

/**
 * Return a new kites instance
 * @param options
 */
export default function(options: IKitesOptions) {
    let parent = module.parent || module;
    let opts = Object.assign({
        parentModuleDirectory: path.dirname(parent.filename)
    }, options);
    // init a new kites
    return new KitesCore(opts);
}
