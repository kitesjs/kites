import { Inject, Injectable, InjectionToken } from '@kites/common';
import { expect } from 'chai';
import { Container } from './container';

// @Injectable() class ACircularClass {
//   constructor(public other: BCircularClass) { }
// }

// @Injectable() class BCircularClass {
//   constructor(public other: ACircularClass) { }
// }

describe('Container', () => {
  describe('inject', () => {
    class BasicClass {
      constructor(public x: number) { }
    }

    @Injectable() class InjectableClass {
      constructor(public basicClass: BasicClass) { }
    }

    @Injectable() class AnotherBasicClass {
      x: number = 10;
    }

    @Injectable() class TokenOverrideClass {
      constructor(@Inject(AnotherBasicClass) public basicClass: BasicClass) { }
    }

    const SPECIAL_STRING_TOKEN = new InjectionToken('some-identifer');
    @Injectable()
    class TokenStringOverrideClass {
      constructor(@Inject(SPECIAL_STRING_TOKEN) public someValue: string) { }
    }

    interface SomeInterface {
      a: string;
    }

    @Injectable()
    class SomeInferfaceClass {
      constructor(public someInterface: SomeInterface) { }
    }

    it('can inject using a value provider', () => {
      const container = new Container();
      const input = { x: 200 };
      container.addProvider({ provide: BasicClass, useValue: input });
      const output = container.inject(BasicClass);
      expect(input).to.be.eql(output);
    });

    it('can inject using a factory provider', () => {
      const container = new Container();
      const input = { x: 200 };
      container.addProvider({
        provide: BasicClass,
        useFactory: () => input
      });

      const injectedValue = container.inject(BasicClass);
      expect(injectedValue).to.be.eql(input);
    });

    it('can inject using a class provider', () => {
      const container = new Container();
      const basicValue = { x: 200 };
      container
        .addProvider({
          provide: BasicClass,
          useValue: basicValue
        })
        .addProvider({
          provide: InjectableClass,
          useClass: InjectableClass
        });

      const injectedValue = container.inject(InjectableClass);
      expect(injectedValue.basicClass).to.be.eql(basicValue);
    });

    it('will default to a class provider for the top level class if no provider for that type exists and the type is injectable ', () => {
      const container = new Container();
      const basicValue = { x: 200 };
      container.addProvider({ provide: BasicClass, useValue: basicValue });
      const injectedVal = container.inject(InjectableClass);
      expect(injectedVal.basicClass).to.be.eql(basicValue);
    });

    // it('will throw an error when a class with a circular dependency is detected', () => {
    //   const container = new Container();
    //   container.addProvider({
    //     provide: ACircularClass,
    //     useClass: ACircularClass
    //   });
    //   container.addProvider({
    //     provide: BCircularClass,
    //     useClass: BCircularClass
    //   });
    //   expect(() =>
    //     container.inject(ACircularClass)
    //   ).throws(/Recursive dependency detected in constructor for type ACircularClass with parameter at index 0/);
    // });

    it(`will throw an error when a class which isn't injectable is provided with a class provider`, () => {
      const injector = new Container();
      const provider = { provide: BasicClass, useClass: BasicClass };
      expect(() =>
        injector.addProvider(provider)
      ).throws(/BasicClass isn't injectable/);
    });

    it('can inject a class provider with an override', () => {
      const container = new Container();
      container.addProvider({
        provide: AnotherBasicClass,
        useClass: AnotherBasicClass
      });
      container.addProvider({ provide: BasicClass, useValue: { x: 200 } });
      container.addProvider({
        provide: TokenOverrideClass,
        useClass: TokenOverrideClass
      });

      const output = container.inject(TokenOverrideClass);
      expect(output.basicClass).to.be.eql(new AnotherBasicClass());
    });

    it('can inject a string value provider with an override and injection token', () => {
      const container = new Container();
      const specialValue = 'the special value';
      container.addProvider({
        provide: TokenStringOverrideClass,
        useClass: TokenStringOverrideClass
      });
      container.addProvider({
        provide: SPECIAL_STRING_TOKEN,
        useValue: specialValue
      });

      const output = container.inject(TokenStringOverrideClass);
      expect(output.someValue).to.be.eq(specialValue);
    });

    it('will throw an exception if a value for an injection token doesn\'t exist', () => {
      const container = new Container();
      container.addProvider({
        provide: TokenStringOverrideClass,
        useClass: TokenStringOverrideClass
      });
      expect(() =>
        container.inject(TokenStringOverrideClass)
      ).throws(/No provider for type some-identifer/);
    });

    it('will fail to inject an interface', () => {
      const container = new Container();
      expect(() => {
        container.inject(SomeInferfaceClass);
      }).throws(/No provider for type Object/);
    });

  });
});
