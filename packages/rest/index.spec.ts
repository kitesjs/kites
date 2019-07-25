import { engine, KitesInstance } from '@kites/core';
import { expect } from 'chai';
import Rest from './index';

import Express from '@kites/express';

describe('ext:rest', () => {

  it('should init extension okay!', async () => {
    const app = await engine().use(Rest).use(Express).init();
    expect(app).instanceOf(KitesInstance);
  });
});
