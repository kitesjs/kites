import { expect } from 'chai';
import { join } from 'path';

import { createDebugLogger } from '../logger';
import * as cache from './location-cache';

describe('Location cache', () => {

  before(() => {
    // remove ~/test/cache folder before test
  });

  it('should get one and save it!', async () => {
    const rootDirectory = join(__dirname, '../test');
    const logger = createDebugLogger('location-cache');
    let extensions: any = await cache.get({
      logger,
      rootDirectory: [rootDirectory]
    });
    logger.info('Found: ', extensions, rootDirectory);
    expect(extensions.length).eq(1);
  });
});
