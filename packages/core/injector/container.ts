import { getDependencies, isInjectable, MetadataReader } from '@kites/common/decorators';
import {
  ClassProvider,
  FactoryProvider,
  // getInjectionToken,
  InjectionToken,
  isClassProvider,
  isValueProvider,
  Provider,
  Token,
  Type,
  ValueProvider
} from '@kites/common/interfaces';

type InjectableParam = Type<any>;

export class Container {

  private providers = new Map<Token<any>, Provider<any>>();

  addProvider<T>(provider: Provider<T>) {
    this.assertInjectableIfClassProvider(provider);
    this.providers.set(provider.provide, provider);
    return this;
  }

  inject<T>(type: Token<T>): T {
    let provider = this.providers.get(type);
    if (provider === undefined && !(type instanceof InjectionToken) && typeof type !== 'string') {
      provider = { provide: type, useClass: type as Type<T> };
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
    // const params = this.getInjectedParams(target);
    const params = this.getInjectedContructorParams(target);
    return Reflect.construct(target, params);
  }

  private injectValue<T>(valueProvider: ValueProvider<T>): T {
    return valueProvider.useValue;
  }

  private injectFactory<T>(factoryProvider: FactoryProvider<T>): T {
    return factoryProvider.useFactory();
  }

  private getInjectedContructorParams<T>(target: Type<T>) {
    const reader = new MetadataReader();
    // const meta = reader.getConstructorMetadata(target);
    const dependencies = getDependencies(reader, target);

    return dependencies.map(dependency => {
      const provider = this.providers.get(dependency.serviceIdentifier);
      return this.injectWithProvider(dependency.serviceIdentifier, provider);
    });
  }

  // private getInjectedParams<T>(target: Type<T>) {
  //   const argTypes = Reflect.getMetadata(PARAM_TYPES, target) as Array<
  //     | InjectableParam
  //     | undefined
  //   >;

  //   if (argTypes === undefined) {
  //     return [];
  //   } else {
  //     return argTypes.map((argType, index) => {
  //       // The reflect-metadata API fails on circular dependencies,
  //       // and will return `undefined` for the argument instead.
  //       if (argType === undefined) {
  //         throw new Error(
  //           `Injection error. Recursive dependency detected in constructor for type ${
  //           target.name
  //           } with parameter at index ${index}`
  //         );
  //       }

  //       const overrideToken = getInjectionToken(target, index);
  //       const actualToken = overrideToken === undefined ? argType : overrideToken;
  //       const provider = this.providers.get(actualToken);
  //       return this.injectWithProvider(actualToken, provider);
  //     });
  //   }
  // }

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
    if (typeof token === 'string') {
      return token;
    } else if (typeof token === 'symbol') {
      return token.toString();
    } else {
      return token instanceof InjectionToken
        ? token.injectionIdentifier
        : token.name;
    }
  }

}
