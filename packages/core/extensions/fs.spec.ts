import { expect } from 'chai';

import { join } from 'path';
import { walkSync } from './fs';

describe('walkSync', () => {

  it('should find a kites.config.js', async () => {
    let result = await walkSync(join(__dirname, '../test/extensions'), 'kites.config.js');
    expect(result.length).eq(1);
  });
});
