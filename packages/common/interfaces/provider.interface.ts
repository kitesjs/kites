// import { Abstract } from './abstract.interface';
import { Scope } from './scope-options.interface';
import * as interfaces from './type.interface';

export type Factory<T> = () => T;

export type Token<T> = (string | symbol | interfaces.InjectionToken| interfaces.Newable<T> | interfaces.Abstract<T>);

export interface BaseProvider<T> {
  provide: Token<T>;
  scope?: Scope;
}

export interface ClassProvider<T> extends BaseProvider<T> {
  useClass: interfaces.Newable<T>;
}

export interface ValueProvider<T> extends BaseProvider<T> {
  useValue: T;
}

export interface FactoryProvider<T> extends BaseProvider<T> {
  useFactory: Factory<T>;
}

export type Provider<T> =
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>;

export function isClassProvider<T>(
  provider: BaseProvider<T>
): provider is ClassProvider<T> {
  return (provider as any).useClass !== undefined;
}

export function isValueProvider<T>(
  provider: BaseProvider<T>
): provider is ValueProvider<T> {
  return (provider as any).useValue !== undefined;
}

export function isFactoryProvider<T>(
  provider: BaseProvider<T>
): provider is FactoryProvider<T> {
  return (provider as any).useFactory !== undefined;
}
