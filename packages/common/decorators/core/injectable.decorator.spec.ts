import 'reflect-metadata';

import { expect } from 'chai';
import * as ERRORS_MSGS from '../../constants/error.messages';
import * as METADATA_KEY from '../../constants/metadata.keys';
import { Decorate } from '../decorate';
import { Injectable, isInjectable } from './injectable.decorator';

describe('@Injectable', () => {
  interface AbstractInterface { }
  class StandardClass { }

  @Injectable()
  class TestMiddleware {
    constructor
      (
        param: number,
        test: string,
        svA: AbstractInterface,
        svB: StandardClass,
    ) { }
  }

  it('should recognize injectable class', () => {
    const injectable = isInjectable(TestMiddleware);
    expect(injectable).to.be.eq(true);
  });

  it('should be a non-injectable class', () => {
    const injectable = isInjectable(StandardClass);
    expect(injectable).to.be.eq(false);
  });

  it('should enhance provider with "design:paramtypes" metadata', () => {
    const constructorParams = Reflect.getMetadata(
      METADATA_KEY.PARAM_TYPES,
      TestMiddleware,
    );

    // meta data info
    expect(constructorParams).to.be.instanceof(Array);

    // constructor params info
    expect(constructorParams[0]).to.be.eql(Number);
    expect(constructorParams[1]).to.be.eql(String);
    expect(constructorParams[2]).to.be.eql(Object);
    expect(constructorParams[3]).to.be.eql(StandardClass);
    expect(constructorParams[4]).to.eq(undefined);
  });

  it('should throw when applied multiple times', () => {

    @Injectable()
    class Test { }

    const useDecoratorMoreThanOnce = function () {
      Decorate(Injectable(), Test);
      Decorate(Injectable(), Test);
    };

    expect(useDecoratorMoreThanOnce).to.throw(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
  });

});
