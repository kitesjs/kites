import { expect } from 'chai';
import * as path from 'path';
import {KitesCore} from './kites';

import * as stdMocks from 'std-mocks';

describe('kites engine', () => {

    it('should fire ready callback', async () => {
        var core = new KitesCore({
            discover: false
        });

        core = await core.ready((kites) => {
            kites.logger.info('Kites is ready!');
            expect(kites).instanceOf(KitesCore);
        }).init();

        core.logger.info('Kites has initialized!');
    });

    it('should use function as an extension', async () => {
        var extensionInitialized = false;
        var core = new KitesCore({
            discover: false
        });

        core = await core.use({
            directory: '',
            main: (kites, definition) => {
                kites.logger.info('Kites use function as an extension!!!', definition.name);
                kites.guest = true;
                extensionInitialized = true;
            },
            name: 'test',
        }).init();

        expect(extensionInitialized).eq(true, 'extension has initialized!');
        expect(core.guest).eq(true, 'attach an object to kites!');
    });

    it('should auto discover when no use called', async () => {
        var core = new KitesCore({
            extensionsLocationCache: false,
            rootDirectory: path.resolve('test')
        });

        await core.ready((kites) => {
            kites.logger.info('Kites is ready!');
            expect(kites.aKitesExtensionInitialized).eq(true, 'found a kites extension which has initialized!');
        }).init();
    });

    it('should accept plain function as an extension', async () => {
        var core = new KitesCore({
            discover: false
        });

        await core.use((kites) => {
            kites.guest2 = true;
        }).ready((kites) => {
            expect(kites.guest2).eq(true, 'kites use function definition as an extension!');
        }).init();
    });

});

describe('kites logs', () => {
    it('should not log to console by default', async () => {
        var core = new KitesCore({
            discover: false
        });

        stdMocks.use({
            print: true
        });

        await core.use((kites) => {
            kites.guest2 = true;
        }).ready((kites) => {
            stdMocks.restore();
            let stdoutContent = stdMocks.flush();
            expect(stdoutContent.stdout.length).eq(0, 'stdout is empty');
        }).init();
    });
});
