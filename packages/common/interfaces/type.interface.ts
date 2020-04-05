import { Metadata } from './metadata';
import { Provider, Token } from './provider.interface';

export type Newable<T> = new (...args: any[]) => T;
// TODO: Remove Type<T>
export type Type<T> = new (...args: any[]) => T;

export type TargetType = 'ConstructorArgument' | 'ClassProperty' | 'Variable';

export interface TargetTypeEnum {
  ConstructorArgument: TargetType;
  ClassProperty: TargetType;
  Variable: TargetType;
}

export interface Abstract<T> extends Function {
  prototype: T;
}

export class InjectionToken {
  constructor(public injectionIdentifier: Symbol | string) { }
}

export interface Clonable<T> {
  clone(): T;
}

export interface Lookup<T> extends Clonable<Lookup<T>> {
  add(providerIdentifier: Token<any>, value: T): void;
  addProvider(provider: Provider<T>): void;
  getMap(): Map<Token<any>, T[]>;
  get(providerIdentifier: Token<any>): T[];
  remove(providerIdentifier: Token<any>): void;
  removeByCondition(condition: (item: T) => boolean): void;
  hasKey(providerIdentifier: Token<any>): boolean;
  clone(): Lookup<T>;
}

export interface Target {
  id: number;
  name: string;
  serviceIdentifier: Token<any>;
  type: TargetType;
  metadata: Metadata[];
}
