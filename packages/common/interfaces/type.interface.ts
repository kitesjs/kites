export type Newable<T> = new (...args: any[]) => T;

export interface Abstract<T> extends Function {
  prototype: T;
}

export class InjectionToken {
  constructor(public injectionIdentifier: Symbol | string) { }
}
