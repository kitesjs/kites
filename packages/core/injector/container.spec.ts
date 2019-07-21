import { Inject, Injectable, InjectionToken } from '@kites/common';
import { expect } from 'chai';
import { Container } from './container';

describe('Container', () => {
  describe('inject', () => {
    class BasicClass {
      constructor(public x: number) { }
    }

    @Injectable() class InjectableClass {
      constructor(public basicClass: BasicClass) { }
    }

    // @Injectable() class ACircularClass {
    //   constructor(public other: BCircularClass) { }
    // }

    // @Injectable() class BCircularClass {
    //   constructor(public other: ACircularClass) { }
    // }

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

  });
});
