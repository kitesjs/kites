import 'reflect-metadata';

import { expect } from 'chai';
import { Injectable } from './injectable.decorator';

describe('@Injectable', () => {
  @Injectable()
  class TestMiddleware {
    constructor(param: number, test: string) { }
  }

  it('should enhance provider with "design:paramtypes" metadata', () => {
    const constructorParams = Reflect.getMetadata(
      'design:paramtypes',
      TestMiddleware,
    );

    expect(constructorParams[0]).to.be.eql(Number);
    expect(constructorParams[1]).to.be.eql(String);
  });
});
