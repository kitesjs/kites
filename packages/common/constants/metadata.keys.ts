export const METADATA = {
  CONTROLLERS: 'controllers',
  EXPORTS: 'exports',
  IMPORTS: 'imports',
  PROVIDERS: 'providers',
};

export const PATH_METADATA = 'path';
export const METHOD_METADATA = 'method';
export const RENDER_METADATA = '__renderTemplate__';

// Used for named bindings
export const NAMED_TAG = 'named';

// The type of the binding at design time
export const INJECT_TAG = 'inject';

// used to store constructor arguments tags
export const TAGGED = 'kites:tagged';

// used to store class properties tags
export const TAGGED_PROP = 'kites:tagged_props';

// used to access design time types
export const DESIGN_PARAM_TYPES = 'design:paramtypes';

// used to store types to be injected
export const PARAM_TYPES = 'kites:paramtypes';

export const INJECT_METADATA_KEY = Symbol('INJECT_KEY');
