import { expect } from 'chai';
import { resolve } from 'path';

import InitDebugLogger from '../logger';
import * as cache from './location-cache';

describe('Location cache', () => {

    before(() => {
      // remove ~/test/cache folder before test
    });

    it('should get one and save it!', async () => {
        let extensions: any = await cache.get({
            logger: InitDebugLogger('location-cache'),
            rootDirectory: resolve('test')
        });
        console.log('Found: ', extensions);
        expect(extensions.length).eq(1);
    });
});
