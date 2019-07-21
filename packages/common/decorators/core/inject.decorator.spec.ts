import 'reflect-metadata';

import { expect } from 'chai';
import { SELF_DECLARED_DEPS_METADATA } from '../../constants';
import { Inject } from './inject.decorator';

// describe('@Inject', () => {
//   const token = () => ({});

//   class ServiceTest {
//     constructor(
//       @Inject('test1') param1,
//       @Inject('test2') param2,
//       @Inject(token) param3,
//     ) { }
//   }

//   it('should enhance class with expected constructor params metadata', () => {
//     const metadata = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, ServiceTest);

//     const expectedMetadata = [
//       { index: 2, param: token.name },
//       { index: 1, param: 'test2' },
//       { index: 0, param: 'test1' }
//     ];

//     expect(metadata, 'Get metadata of ServiceTest').to.be.eql(expectedMetadata);
//   });
// });
