import { ClassProvider, FactoryProvider, getInjectionToken, InjectionToken, isClassProvider, isInjectable, isValueProvider, PARAMTYPES_METADATA, Provider, Token, Type, ValueProvider } from '@kites/common';

type InjectableParam = Type<any>;

export class Container {

  private providers = new Map<Token<any>, Provider<any>>();

  addProvider<T>(provider: Provider<T>) {
    this.assertInjectableIfClassProvider(provider);
    this.providers.set(provider.provide, provider);
  }

  inject<T>(type: Token<T>): T {
    let provider = this.providers.get(type);
    if (provider === undefined && !(type instanceof InjectionToken)) {
      provider = { provide: type, useClass: type };
      this.assertInjectableIfClassProvider(provider);
    }
    return this.injectWithProvider(type, provider);
  }

  private injectWithProvider<T>(type: Token<T>, provider?: Provider<T>): T {
    if (provider === undefined) {
      throw new Error(`No provider for type ${this.getTokenName(type)}`);
    }
    if (isClassProvider(provider)) {
      return this.injectClass(provider as ClassProvider<T>);
    } else if (isValueProvider(provider)) {
      return this.injectValue(provider as ValueProvider<T>);
    } else {
      // Factory provider by process of elimination
      return this.injectFactory(provider as FactoryProvider<T>);
    }
  }

  private injectClass<T>(classProvider: ClassProvider<T>): T {
    const target = classProvider.useClass;
    const params = this.getInjectedParams(target);
    return Reflect.construct(target, params);
  }

  private injectValue<T>(valueProvider: ValueProvider<T>): T {
    return valueProvider.useValue;
  }

  private injectFactory<T>(factoryProvider: FactoryProvider<T>): T {
    return factoryProvider.useFactory();
  }

  private getInjectedParams<T>(target: Type<T>) {
    const argTypes = Reflect.getMetadata(PARAMTYPES_METADATA, target) as Array<
      | InjectableParam
      | undefined
    >;

    if (argTypes === undefined) {
      return [];
    } else {
      return argTypes.map((argType, index) => {
        // The reflect-metadata API fails on circular dependencies,
        // and will return `undefined` for the argument instead.
        if (argType === undefined) {
          throw new Error(
            `Injection error. Recursive dependency detected in constructor for type ${
            target.name
            } with parameter at index ${index}`
          );
        }

        const overrideToken = getInjectionToken(target, index);
        const actualToken = overrideToken === undefined ? argType : overrideToken;
        const provider = this.providers.get(actualToken);
        return this.injectWithProvider(actualToken, provider);
      });
    }
  }

  private assertInjectableIfClassProvider<T>(provider: Provider<T>) {
    if (isClassProvider(provider) && !isInjectable(provider.useClass)) {
      throw new Error(
        `Cannot provide ${this.getTokenName(provider.provide)}
        using class ${this.getTokenName(provider.useClass)}
        , ${this.getTokenName(provider.useClass)} isn't injectable!
        `
      );
    }
  }

  private getTokenName<T>(token: Token<T>) {
    return token instanceof InjectionToken
      ? token.injectionIdentifier
      : token.name;
  }

}
