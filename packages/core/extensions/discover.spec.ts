import { expect } from 'chai';
import { join } from 'path';
import createDebugLogger from '../logger';
import { discover } from './discover';

describe('Discover extensions', () => {
  it('should load an extension', async () => {
    const rootDirectory = join(__dirname, '../test');
    let extensions: any = await discover({
      logger: createDebugLogger('discover'),
      rootDirectory: rootDirectory
    });
    console.log('rootDirectory: ', rootDirectory);
    expect(extensions.length).eq(1);
  });
});
