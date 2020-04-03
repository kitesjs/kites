import 'reflect-metadata';

import { expect } from 'chai';
import { UNDEFINED_INJECT_ANNOTATION } from '../../constants/error.messages';
import * as METADATA_KEY from '../../constants/metadata.keys';
import { InjectionToken } from '../../interfaces';
import * as interfaces from '../../interfaces';
import { Decorate } from '../decorate';
import { Inject, LazyServiceIdentifer } from './inject.decorator';

describe('@Inject', () => {
  const USER_STRING_TOKEN = new InjectionToken('user-identifier');

  class PingService {
    constructor(public x: number) { }
  }

  class DomainService { }
  class DiagnosticService { }

  const lazyDiagnosticId = new LazyServiceIdentifer(() => 'Diagnostic');

  class DecoratedServiceTest {
    constructor(
      @Inject(PingService) private svPing: PingService,
      @Inject('Domain') private svDomain: DomainService,
      @Inject(lazyDiagnosticId) private svDiagnostic: DiagnosticService,
    ) { }
  }

  class InvalidDecoratorUsageService {
    private svDomain: DomainService;
    private svPing: PingService;

    constructor(
      svDomain: DomainService,
      svPing: PingService,
    ) {
      this.svDomain = svDomain;
      this.svPing = svPing;
    }
  }

  it('should enhance class with expected constructor params metadata using named parameters', () => {
    const metadata = Reflect.getMetadata(METADATA_KEY.TAGGED, DecoratedServiceTest);

    expect(metadata).to.be.an('object');

    // assert metadata for first argument
    expect(metadata['0']).to.be.instanceOf(Array);
    const arg1: interfaces.Metadata = metadata['0'][0];
    expect(arg1.key).to.be.eq(METADATA_KEY.INJECT_TAG);
    expect(arg1.value).to.be.eql(PingService);
    expect(metadata['0'][1]).to.be.eq(undefined);

    // assert metadata for second argument
    expect(metadata['1']).to.be.instanceOf(Array);
    const arg2: interfaces.Metadata = metadata['1'][0];
    expect(arg2.key).to.be.eq(METADATA_KEY.INJECT_TAG);
    expect(arg2.value).to.be.eql('Domain');
    expect(metadata['1'][1]).to.be.eq(undefined);

    // assert metadata for third argument
    expect(metadata['2']).to.be.instanceOf(Array);
    const arg3: interfaces.Metadata = metadata['2'][0];
    expect(arg3.key).to.be.eq(METADATA_KEY.INJECT_TAG);
    expect(arg3.value).to.be.eql(lazyDiagnosticId);
    expect(metadata['2'][1]).to.be.eq(undefined);

    // no more metadata should be available
    expect(metadata['3']).to.be.eq(undefined);

  });

  it('should throw when applied with undefined token', () => {
    // this can be happen when there is a circluar dependency between tokens
    const useDecoratorWithUndefinedToken = function () {
      Decorate(Inject(undefined as any) as any, InvalidDecoratorUsageService, 0);
    };

    const errMsg = `${UNDEFINED_INJECT_ANNOTATION('InvalidDecoratorUsageService')}`;
    expect(useDecoratorWithUndefinedToken).to.throw(errMsg);
  });
});
