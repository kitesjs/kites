import { METADATA_KEY, PARAMETER_TYPE } from '../constants';
import { ParameterMetadata } from '../interfaces';

function Params(type: PARAMETER_TYPE, parameterName?: string) {
  return function (
    target: Object,
    methodName: string,
    index: number
  ) {
    let metadataList: Object;
    let parameterMetadataList: ParameterMetadata[] = [];
    let parameterMetadata: ParameterMetadata = {
      index: index,
      injectRoot: parameterName === undefined,
      parameterName: parameterName,
      type: type
    };

    if (!Reflect.hasMetadata(METADATA_KEY.ControllerParameter, target.constructor)) {
      parameterMetadataList.unshift(parameterMetadata);
    } else {
      metadataList = Reflect.getMetadata(METADATA_KEY.ControllerParameter, target.constructor);
      if (metadataList.hasOwnProperty(methodName)) {
        parameterMetadataList = metadataList[methodName];
      }
      parameterMetadataList.unshift(parameterMetadata);
    }

    metadataList[methodName] = parameterMetadataList;
    Reflect.defineMetadata(METADATA_KEY.ControllerParameter, metadataList, target.constructor);
  };
}

function ParamDecoratorFactory(parameterType: PARAMETER_TYPE)
  : (name?: string) => ParameterDecorator {
  return function (name?: string): ParameterDecorator {
    Params(parameterType, name);
    return;
  };
}

const Request: () => ParameterDecorator = ParamDecoratorFactory(PARAMETER_TYPE.REQUEST);
const Response: () => ParameterDecorator = ParamDecoratorFactory(PARAMETER_TYPE.RESPONSE);
const RequestParam: (paramName?: string) => ParameterDecorator = ParamDecoratorFactory(PARAMETER_TYPE.PARAMS);
const QueryParam: (queryParamName?: string) => ParameterDecorator = ParamDecoratorFactory(PARAMETER_TYPE.QUERY);
const RequestBody: () => ParameterDecorator = ParamDecoratorFactory(PARAMETER_TYPE.BODY);
const RequestHeaders: (headerName?: string) => ParameterDecorator = ParamDecoratorFactory(PARAMETER_TYPE.HEADERS);
const Cookies: (cookieName?: string) => ParameterDecorator = ParamDecoratorFactory(PARAMETER_TYPE.COOKIES);
const Next: () => ParameterDecorator = ParamDecoratorFactory(PARAMETER_TYPE.NEXT);
const Principal: () => ParameterDecorator = ParamDecoratorFactory(PARAMETER_TYPE.PRINCIPAL);

export {
  Params,
  Request,
  Response,
  RequestParam,
  QueryParam,
  RequestBody,
  RequestHeaders,
  Cookies,
  Next,
  Principal,
};
