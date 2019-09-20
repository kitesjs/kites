import { expect } from 'chai';
import { join } from 'path';
import { getDebugLogger } from '../logger';
import { discover } from './discover';

describe('Discover extensions', () => {
  it('should load an extension', async () => {
    const location = join(__dirname, '../test');
    const logger = getDebugLogger('kites:discover');
    let extensions: any = await discover({
      logger,
      directories: [location]
    });
    logger.info('Discovery location: ' + location);
    expect(extensions.length).eq(1);
  });
});
