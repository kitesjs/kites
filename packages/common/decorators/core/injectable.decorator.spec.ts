import 'reflect-metadata';

import { expect } from 'chai';
import { Injectable, isInjectable } from './injectable.decorator';

describe('@Injectable', () => {
  @Injectable()
  class TestMiddleware {
    constructor(param: number, test: string) { }
  }

  class StandardClass { }

  it('recognize injectable class', () => {
    const injectable = isInjectable(TestMiddleware);
    expect(injectable).to.be.eq(true);
  });

  it('should be a non-injectable class', () => {
    const injectable = isInjectable(StandardClass);
    expect(injectable).to.be.eq(false);
  });

  it('should enhance provider with "design:paramtypes" metadata', () => {
    const constructorParams = Reflect.getMetadata(
      'design:paramtypes',
      TestMiddleware,
    );

    expect(constructorParams[0]).to.be.eql(Number);
    expect(constructorParams[1]).to.be.eql(String);
  });
});
