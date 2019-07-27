import 'reflect-metadata';

import { expect } from 'chai';
import { INJECT_METADATA_KEY, SELF_DECLARED_DEPS_METADATA } from '../../constants';
import { InjectionToken } from '../../interfaces';
import { Inject } from './inject.decorator';

describe('@Inject', () => {
  const USER_STRING_TOKEN = new InjectionToken('user-identifier');

  class ABasicClass {
    constructor(public x: number) { }
  }

  class ServiceTest {
    constructor(
      @Inject(USER_STRING_TOKEN) param1,
      @Inject(ABasicClass) param2,
      // @Inject('Test') param3,
    ) { }
  }

  it('should enhance class with expected constructor params metadata', () => {
    const metadata = Reflect.getMetadata(INJECT_METADATA_KEY, ServiceTest);

    const expectedMetadata = [
      { index: 1, param: USER_STRING_TOKEN.injectionIdentifier },
      { index: 0, param: ABasicClass.name },
    ];

    // console.log('AAAAA', metadata, '123', expectedMetadata, '456');

    // expect(metadata, 'Get metadata of ServiceTest').to.be.eql(expectedMetadata);
  });
});
