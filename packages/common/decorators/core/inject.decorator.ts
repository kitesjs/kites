import { INJECT_METADATA_KEY } from '../../constants';
import { Token } from '../../interfaces/provider.interface';

export function Inject(token: Token<any>) {
  return function (target: any, _: string | symbol, index: number) {
    Reflect.defineMetadata(INJECT_METADATA_KEY, token, target, `index-${index}`);
    return target;
  };
}

export function getInjectionToken(target: any, index: number) {
  return Reflect.getMetadata(INJECT_METADATA_KEY, target, `index-${index}`) as Token<any> | undefined;
}
