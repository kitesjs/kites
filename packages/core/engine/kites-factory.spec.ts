import { expect } from 'chai';
import { engine, KITES_INSTANCE } from './kites-factory';
import { KitesInstance } from './kites-instance';

describe('kites init', () => {
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
});
