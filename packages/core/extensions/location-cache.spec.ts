import { expect } from 'chai';
import { join } from 'path';

import { getDebugLogger } from '../logger';
import * as cache from './location-cache';

describe('Location cache', () => {

  before(() => {
    // remove ~/test/cache folder before test
  });

  it('should get one and save it!', async () => {
    const rootDirectory = join(__dirname, '../test');
    const logger = getDebugLogger('location-cache');
    let extensions: any = await cache.get({
      logger,
      directories: [rootDirectory]
    });
    logger.info('Found: ', extensions, rootDirectory);
    expect(extensions.length).eq(1);
  });
});
