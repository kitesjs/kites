import * as ERROR_MSGS from '../../constants/error.messages';
import * as METADATA_KEY from '../../constants/metadata.keys';
import * as interfaces from '../../interfaces';

function tagParameter(
  annotationTarget: any,
  propertyName: string,
  parameterIndex: number,
  metadata: interfaces.Metadata
) {
  const metadataKey = METADATA_KEY.TAGGED;
  _tagParameterOrProperty(metadataKey, annotationTarget, propertyName, metadata, parameterIndex);
}

function tagProperty(
  annotationTarget: any,
  propertyName: string,
  metadata: interfaces.Metadata
) {
  const metadataKey = METADATA_KEY.TAGGED_PROP;
  _tagParameterOrProperty(metadataKey, annotationTarget.constructor, propertyName, metadata);
}

function _tagParameterOrProperty(
  metadataKey: string,
  annotationTarget: any,
  propertyName: string,
  metadata: interfaces.Metadata,
  parameterIndex?: number
) {

  let paramsOrPropertiesMetadata: interfaces.ReflectResult = {};
  const isParameterDecorator = (typeof parameterIndex === 'number');
  const key: string = (parameterIndex !== undefined && isParameterDecorator) ? parameterIndex.toString() : propertyName;

  // if the decorator is used as a parameter decorator, the property name must be provided
  if (isParameterDecorator && propertyName !== undefined) {
      throw new Error(ERROR_MSGS.INVALID_DECORATOR_OPERATION);
  }

  // read metadata if available
  if (Reflect.hasOwnMetadata(metadataKey, annotationTarget)) {
      paramsOrPropertiesMetadata = Reflect.getMetadata(metadataKey, annotationTarget);
  }

  // get metadata for the decorated parameter by its index
  let paramOrPropertyMetadata: interfaces.Metadata[] = paramsOrPropertiesMetadata[key];

  if (!Array.isArray(paramOrPropertyMetadata)) {
      paramOrPropertyMetadata = [];
  } else {
      for (const m of paramOrPropertyMetadata) {
          if (m.key === metadata.key) {
              throw new Error(`${ERROR_MSGS.DUPLICATED_METADATA} ${m.key.toString()}`);
          }
      }
  }

  // set metadata
  paramOrPropertyMetadata.push(metadata);
  paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata;
  Reflect.defineMetadata(metadataKey, paramsOrPropertiesMetadata, annotationTarget);

}

export {
  tagParameter,
  tagProperty,
};
