export interface Metadata {
  key: string | number | symbol;
  value: any;
}

export interface ReflectResult {
  [key: string]: Metadata[];
}

export interface MetadataMap {
  [propertyNameOrArgumentIndex: string]: Metadata[];
}

export interface MetadataReader {
  getConstructorMetadata(constructorFunc: Function): ConstructorMetadata;
  getPropertiesMetadata(constructorFunc: Function): MetadataMap;
}

export interface ConstructorMetadata {
  compilerGeneratedMetadata: Function[] | undefined;
  userGeneratedMetadata: MetadataMap;
}
