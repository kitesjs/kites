import { expect } from 'chai';

import {walkSync} from './fs';

describe('walkSync', () => {

    it('should find a kites.config.js', async () => {
        let result = await walkSync('test/extensions', 'kites.config.js');
        expect(result.length).eq(1);
    });
});
