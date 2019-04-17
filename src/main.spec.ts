import { KitesInstance } from '@kites/engine';
import { expect } from 'chai';
import kites from './main';

describe('kites engine', () => {

  it('should be a kites instance', async () => {
    const app = await kites(false).init();

    expect(app.options.discover).eq(false, 'Discover option must be Falsy');
    expect(app).instanceOf(KitesInstance);

    app.logger.info('Kites has initialized!');
  });
});
