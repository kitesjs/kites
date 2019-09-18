import { once } from '@kites/common';
import { expect } from 'chai';
import { engine, KITES_INSTANCE } from './kites-factory';
import { KitesInstance } from './kites-instance';

describe('kites factory', () => {
  it('should init a new kites instance without options!', async () => {
    const app = await engine().init();
    app.logger.info('A new kites started!');
  });

  it('should inject kites instance!', async () => {
    await engine().use((kites) => {
      const instance = kites.container.inject(KITES_INSTANCE);
      expect(instance).instanceOf(KitesInstance);
    }).init();
  });

  it('should wait an event', (done) => {
    engine().use(async (kites: KitesInstance) => {
      try {
        const v = await once(kites, 'ready');
        expect(v).to.be.an('array', 'once event as a promise return an array!');
        expect(v[0]).instanceOf(KitesInstance);
        done();
      } catch (error) {
        done(error);
      }
    }).init().then(() => true).catch(done);
  });
});
