import { engine, KitesInstance } from '@kites/core';
import { expect } from 'chai';
import Rest from './index';

describe('ext:rest', () => {

  it('should init extension okay!', async () => {
    const app = await engine().use(Rest).init();
    expect(app).instanceOf(KitesInstance);
  });
});
