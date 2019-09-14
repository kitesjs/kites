import { expect } from 'chai';
import { join } from 'path';
import { createDebugLogger } from '../logger';
import { discover } from './discover';

describe('Discover extensions', () => {
  it('should load an extension', async () => {
    const location = join(__dirname, '../test');
    const logger = createDebugLogger('kites:discover');
    let extensions: any = await discover({
      logger,
      rootDirectory: [location]
    });
    logger.info('Discovery location: ' + location);
    expect(extensions.length).eq(1);
  });
});
