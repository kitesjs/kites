import { UNDEFINED_INJECT_ANNOTATION } from '../../constants/error.messages';
import * as METADATA_KEY from '../../constants/metadata.keys';
import { Token } from '../../interfaces/provider.interface';
import { Metadata } from '../metadata';
import { tagParameter, tagProperty } from './tag.decorator';

export type TokenIdentifierOrFunc = Token<any> | LazyServiceIdentifer;

export class LazyServiceIdentifer<T = any> {
  private _cb: () => Token<T>;
  public constructor(cb: () => Token<T>) {
      this._cb = cb;
  }

  public unwrap() {
    return this._cb();
  }
}

export function Inject(token: TokenIdentifierOrFunc) {
  return function (target: any, targetKey: string, index?: number) {

    if (token === undefined) {
      throw new Error(UNDEFINED_INJECT_ANNOTATION(target.name));
    }

    // Reflect.defineMetadata(INJECT_METADATA_KEY, token, target, `index-${index}`);
    const metadata = new Metadata(METADATA_KEY.INJECT_TAG, token);

    if (typeof index === 'number') {
      tagParameter(target, targetKey, index, metadata);
    } else {
      tagProperty(target, targetKey, metadata);
    }
    return target;
  };
}

// export function getInjectionToken(target: any, index: number) {
//   return Reflect.getMetadata(INJECT_METADATA_KEY, target, `index-${index}`) as Token<any> | undefined;
// }
