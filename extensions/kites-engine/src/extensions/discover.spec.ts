import { expect } from 'chai';
import * as path from 'path';
import InitDebugLogger from '../logger';
import {discover} from './discover';

describe('Discover extensions', () => {
    it('should load an extension', async () => {
        let extensions: any = await discover({
            logger: InitDebugLogger('discover'),
            rootDirectory: path.resolve('test')
        });
        expect(extensions.length).eq(1);
    });
});
