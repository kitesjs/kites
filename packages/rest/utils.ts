import { Container } from '@kites/core';
import { METADATA_KEY, TYPE } from './constants';
import { Controller } from './decorators/controller.decorator';
import { ControllerMetadata, ControllerMethodMetadata, ControllerParameterMetadata } from './interfaces';

function GetControllersFromContainer(
  container: Container,
  forceControllers: boolean
) {
  // if (container.inject(TYPE.Controller));
}

function GetControllersFromMetadata() {
  const arrayOfControllerMetadata: ControllerMetadata[] = Reflect.getMetadata(
    METADATA_KEY.Controller,
    Reflect
  ) || [];
  return arrayOfControllerMetadata.map(metadata => metadata.target);
}

function GetControllerMetadata(constructor: any) {
  const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
    METADATA_KEY.Controller,
    constructor
  );
  return controllerMetadata;
}

function GetControllerMethodMetadata(constructor: any) {
  const methodMetadata: ControllerMethodMetadata = Reflect.getMetadata(
    METADATA_KEY.ControllerMethod,
    constructor
  );
  return methodMetadata;
}

function GetControllerParameterMetadata(constructor: any) {
  const parameterMetadata: ControllerParameterMetadata = Reflect.getMetadata(
    METADATA_KEY.ControllerParameter,
    constructor
  );
  return parameterMetadata;
}

function CleanUpMetadata() {
  Reflect.defineMetadata(
    METADATA_KEY.Controller,
    [],
    Reflect
  );
}

export {
  GetControllersFromContainer,
  GetControllersFromMetadata,
  GetControllerMetadata,
  GetControllerMethodMetadata,
  GetControllerParameterMetadata,
  CleanUpMetadata,
};
