import * as path from 'path';
import {IKitesOptions, KitesInstance} from './engine/kites';

export {
  EventCollectionEmitter,
  ICollectionItem,
} from './engine/event-collection';
export { IKites, KitesInstance, IKitesOptions } from './engine/kites';
export { KitesExtention, KitesExtensionDefinition } from './extensions/extensions';

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
    return new KitesInstance(opts);
}
