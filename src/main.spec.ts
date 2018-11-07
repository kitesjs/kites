import { KitesCore } from '@kites/engine';
import { assert, expect } from 'chai';
import { InitKites } from './main';

describe('kites engine', () => {

    it('should fire ready callback', async () => {
        var core = InitKites({
            discover: false
        });

        core = await core.ready((kites) => {
            kites.logger.info('Kites is ready!');
            expect(kites).instanceOf(KitesCore);
        }).init();

        core.logger.info('Kites has initialized!');
    });
});
