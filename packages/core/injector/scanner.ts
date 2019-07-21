import { Type } from '../../common/interfaces/type.interface';
import { IKites, KitesInstance } from '../engine/kites-instance';

import * as hash from 'object-hash';

export class DependenciesScanner {

  constructor(
    private readonly kites: KitesInstance
  ) { }

  scan() {
    const extensions = this.kites.extensionsManager.extensions;
    // for (const ext of extensions) {
    //   const token = hash(ext);
    //   this.reflectProviders(ext, token);
    //   this.reflectControllers(ext, token);
    // }
  }

  reflectProviders(extension: Type<any>, token: string) {
    // const providers = this.reflectMetadata(extension, METADATA);
  }

  reflectControllers(extension: Type<any>, token: string) {

  }

  reflectMetadata(metatype: Type<any>, metadataKey: string) {
    return Reflect.getMetadata(metadataKey, metatype) || [];
  }
}
