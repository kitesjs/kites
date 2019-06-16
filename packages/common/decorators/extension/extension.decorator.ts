import { METADATA } from '../../constants';
import { ExtensionMetadata } from '../../interfaces/extensions/extension-metadata';

/**
 * Defines the extension
 * @param metadata
 */
export function Extension(metadata: ExtensionMetadata): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(METADATA.IMPORTS, metadata.imports, target);
    Reflect.defineMetadata(METADATA.EXPORTS, metadata.exports, target);
    Reflect.defineMetadata(METADATA.PROVIDERS, metadata.providers, target);
    Reflect.defineMetadata(METADATA.CONTROLLERS, metadata.controllers, target);
  };
}
