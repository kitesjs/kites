
import { RENDER_METADATA } from '../../constants';

/**
 * Defines a template to be rendered by the controller.
 */
export function Render(template: string): MethodDecorator {
  return (target: object, key, descriptor) => {
    const value = typeof descriptor.value === 'undefined' ? undefined : descriptor.value;
    Reflect.defineMetadata(RENDER_METADATA, template, value);
    return descriptor;
  };
}
