import { expect } from 'chai';
import { Extension } from './extension.decorator';

describe('@Extension', () => {
  const extentionsDefinition = {
    imports: ['test' as any],
    exports: ['test' as any],
    providers: ['test' as any],
    controllers: ['test' as any]
  };

  @Extension(extentionsDefinition)
  class NopeExtension { }

  it('should enhance class with expected extension metadata', () => {
    const imports = Reflect.getMetadata('imports', NopeExtension);
    const exports = Reflect.getMetadata('exports', NopeExtension);
    const providers = Reflect.getMetadata('providers', NopeExtension);
    const controllers = Reflect.getMetadata('controllers', NopeExtension);

    expect(imports).to.be.eq(extentionsDefinition.imports);
    expect(exports).to.be.eq(extentionsDefinition.exports);
    expect(providers).to.be.eq(extentionsDefinition.providers);
    expect(controllers).to.be.eq(extentionsDefinition.controllers);
  });
});
