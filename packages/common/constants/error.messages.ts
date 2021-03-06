export const STACK_OVERFLOW = 'Maximum call stack size exceeded';
export const DUPLICATED_INJECTABLE_DECORATOR = 'Duplicated injectable decorator';
export const DUPLICATED_METADATA = 'Metadata key was used more than once in a parameter';
export const NULL_ARGUMENT = 'NULL argument';
export const KEY_NOT_FOUND = 'Key Not Found';
export const MISSING_INJECTABLE_ANNOTATION = 'Missing required @Injectable annotation in:';
export const MISSING_INJECT_ANNOTATION = 'Missing required @Inject or @MultiInject annotation in:';

export const UNDEFINED_INJECT_ANNOTATION = (name: string) =>
  `@Inject called with undefined this could mean that the class ${name} has ` +
  'a circular dependency problem. You can use a LazyServiceIdentifer to  ' +
  'overcome this limitation.';

export const INVALID_DECORATOR_OPERATION = 'The @Inject @Tagged and @Named decorators ' +
  'must be applied to the parameters of a class constructor or a class property.';
