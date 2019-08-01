import { expect } from 'chai';
import { join } from 'path';

import { createLogger } from '../logger';
import * as cache from './location-cache';

describe('Location cache', () => {

  before(() => {
    // remove ~/test/cache folder before test
  });

  it('should get one and save it!', async () => {
    const rootDirectory = join(__dirname, '../test');
    let extensions: any = await cache.get({
      logger: createLogger('location-cache'),
      rootDirectory: rootDirectory
    });
    console.log('Found: ', extensions, rootDirectory);
    expect(extensions.length).eq(1);
  });
});
