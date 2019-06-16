import 'reflect-metadata';

import { expect } from 'chai';
import { RequestMethod } from '../../http/request-medthod';
import { Route } from './route.decorator';

describe('@Route', () => {
  const requestInfo = {
    method: RequestMethod.ALL,
    path: 'test',
  };

  const requestMultiplePaths = {
    method: RequestMethod.GET,
    path: ['foo', 'bar']
  };

  it('should enhance class with expected metadata', () => {
    class Test {
      @Route(requestInfo)
      public static test() { }

      @Route(requestMultiplePaths)
      public static pathArray() { }
    }

    const path = Reflect.getMetadata('path', Test.test);
    const method = Reflect.getMetadata('method', Test.test);
    const pathUsingArray = Reflect.getMetadata('path', Test.pathArray);
    const methodUsingArray = Reflect.getMetadata('method', Test.pathArray);

    console.log('Paths: ', path, pathUsingArray);

    expect(path).to.be.eq(requestInfo.path);
    expect(method).to.be.eq(requestInfo.method);
    expect(pathUsingArray).to.be.eql(requestMultiplePaths.path);
    expect(methodUsingArray).to.be.eql(requestMultiplePaths.method);
  });

  it('should set request by default', () => {
    class Test {
      @Route()
      public static test() { }
    }

    const path = Reflect.getMetadata('path', Test.test);
    const method = Reflect.getMetadata('method', Test.test);

    expect(path).to.be.eq('/');
    expect(method).to.be.eq(RequestMethod.GET);
  });

});
