
function _decorate(
  decorators: any[],
  target: any
) {
  Reflect.decorate(decorators, target);
}

function _param(
  paramIndex: number,
  decorator: ParameterDecorator
) {
  return function (target: any, key: string) {
    decorator(target, key, paramIndex);
  };
}

// Allows VanillaJS developers to use decorators:
// decorate(injectable("Foo", "Bar"), FooBar);
// decorate(targetName("foo", "bar"), FooBar);
// decorate(named("foo"), FooBar, 0);
// decorate(tagged("bar"), FooBar, 1);
function decorate(
  decorator: ClassDecorator | ParameterDecorator | MethodDecorator,
  target: any,
  parameterIndex?: number | string
) {
  if (typeof parameterIndex === 'number') {
    _decorate([
      _param(parameterIndex, decorator as ParameterDecorator)
    ], target);
  } else if (typeof parameterIndex === 'string') {
    Reflect.decorate([
      decorator as MethodDecorator
    ], target, parameterIndex);
  } else {
    _decorate([
      decorator as ClassDecorator
    ], target);
  }
}

export { decorate };
