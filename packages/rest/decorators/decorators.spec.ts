import { METADATA_KEY, PARAMETER_TYPE } from '../constants';
import { ControllerMetadata, ControllerMethodMetadata, ControllerParameterMetadata } from '../interfaces';
import { Controller } from './controller.decorator';

import { expect } from 'chai';
import { HttpMethod } from './http-method.controller';
import { Params } from './http-param.decorator';

describe('@Controller', () => {

  it('should add controller metadata to a class when decorated with @Controller()', (done) => {
    let path = 'foo';
    let middleware = [
      function () {
        return;
      },
      'foo',
      'bar',
    ];

    @Controller(path, ...middleware)
    class TestController { }

    let controllerMetadata: ControllerMetadata = Reflect.getMetadata(
      METADATA_KEY.Controller,
      TestController
    );

    expect(controllerMetadata.path).eql(path);
    expect(controllerMetadata.target).eql(TestController);
    expect(controllerMetadata.middleware).eql(middleware);

    done();
  });

  it('should add method metadata to a class when decorated with @HttpMethod()', (done) => {
    let path = 'foo';
    let method = 'get';
    let middleware = [
      function () {
        return;
      },
      'foo',
      'bar',
    ];

    class TestController {
      @HttpMethod(method, path, ...middleware)
      test1() { }

      @HttpMethod('foo', 'bar')
      test2() { }

      @HttpMethod('abc', 'xyz')
      test3() { }
    }

    let methodMetadata: ControllerMethodMetadata[] = Reflect.getMetadata(
      METADATA_KEY.ControllerMethod,
      TestController,
    );

    expect(methodMetadata.length).eql(3);

    let metadata = methodMetadata[0];
    expect(metadata.middleware).eql(middleware);
    expect(metadata.path).eql(path);
    expect(metadata.key).eql('test1');
    expect(metadata.method).eql(method);
    expect(metadata.target.constructor).eql(TestController);
    done();
  });

  it('should add parameter metadata to a class when decorated with @Params()', (done) => {

    class NinjaController {
      move(
        @Params(PARAMETER_TYPE.PARAMS, 'distance') name: string,
        @Params(PARAMETER_TYPE.PARAMS, 'steps') steps: number
      ) { }

      fight(
        @Params(PARAMETER_TYPE.PARAMS, 'darts') darts: number
      ) { }
    }

    let methodMetadataList: ControllerParameterMetadata = Reflect.getMetadata(
      METADATA_KEY.ControllerParameter,
      NinjaController,
    );

    expect(methodMetadataList.hasOwnProperty('move')).eql(true);
    expect(methodMetadataList.move.length).eql(2);
    expect(methodMetadataList.fight.length).eql(1);

    let paramDetails = methodMetadataList.move[0];
    expect(paramDetails.index).eql(0);
    expect(paramDetails.parameterName).eql('distance');
    expect(paramDetails.type).eq(PARAMETER_TYPE.PARAMS);
    done();
  });
});
