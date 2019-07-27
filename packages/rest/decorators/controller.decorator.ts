import { METADATA_KEY } from '../constants';
import { ControllerMetadata } from '../interfaces/controller-metadata.interface';
import { Middleware } from '../interfaces/middleware.interface';

import { Injectable } from '@kites/common';
import { Decorate } from '@kites/core';

function Controller(path: string, ...middleware: Middleware[]) {
  return function (target: any) {
    const currentMetadata: ControllerMetadata = {
      middleware: middleware,
      path: path,
      target: target
    };

    Decorate(Injectable(), target);
    Reflect.defineMetadata(
      METADATA_KEY.Controller,
      currentMetadata,
      target
    );

    // We need to create an array that contains the metadata of all
    // the controllers in the application, the metadata cannot be
    // attached to a controller. It needs to be attached to a global
    // We attach metadata to the Reflect object itself to avoid
    // declaring additonal globals. Also, the Reflect is avaiable
    // in both node and web browsers.
    const previousMetadata: ControllerMetadata[] = Reflect.getMetadata(
      METADATA_KEY.Controller,
      Reflect
    ) || [];

    const newMetadata = [currentMetadata, ...previousMetadata];

    Reflect.defineMetadata(
      METADATA_KEY.Controller,
      newMetadata,
      Reflect
    );

  };
}

export {
  Controller
};
