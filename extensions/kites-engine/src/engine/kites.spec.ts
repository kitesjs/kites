import { assert, expect } from 'chai';
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
        let core = new KitesCore({
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

    it('should keep silent logs', async () => {
        let core = new KitesCore({
            discover: false,
            logger: {
                silent: true
            }
        });

        stdMocks.use({
            print: true
        });

        let kites = await core.init();
        stdMocks.restore();
        let stdoutContent = stdMocks.flush();
        expect(stdoutContent.stdout.length).eq(0, 'stdout is empty');

        let allTransportAreSilent = Object.keys(kites.logger.transports).every((name) => kites.logger.transports[name].silent === true);
        expect(allTransportAreSilent).eq(true, 'all transports are silent');
    });

    it('should have Debug transport for logs enabled by default', () => {
        new KitesCore({
            discover: false
        }).init().then((kites) => {
            expect(kites.logger.transports).to.have.property('debug');
        });
    });

    it('should fail to configure custom transport that does not have enough options', async () => {
        let core = new KitesCore({
            discover: false,
            logger: {
                console: {
                    transport: 'console'
                }
            }
        });

        await core.init().catch((err) => {
            expect(err).is.instanceOf(Error);
            assert.match(err.message, /option "level" is not specified or has an incorrect value/);
        });
    });

    it('should not load disabled transports for loggger', async () => {
        let core = new KitesCore({
            discover: false,
            logger: {
                console: {
                    level: 'debug',
                    transport: 'console'
                },
                memory: {
                    enabled: false,
                    level: 'debug',
                    transport: 'memory',
                }
            }
        });

        let kites = await core.init();
        assert.isUndefined(kites.logger.transports.memory, 'memory transport shoud be undefined');
        assert.isNotNull(kites.logger.transports.debug, 'debug transport should be not undefined or null');
    });

    it('should configure custom transports for logger', async () => {
        let core = new KitesCore({
            discover: false,
            logger: {
                console: {
                    level: 'debug',
                    transport: 'console'
                },
                memory: {
                    level: 'debug',
                    transport: 'memory'
                }
            }
        });

        let kites = await core.init();
        assert.isNotNull(kites.logger.transports.memory, 'memory transport shoud be not undefined or null');
        assert.isNotNull(kites.logger.transports.debug, 'debug transport should be not undefined or null');
    });
});

describe('kites initializeListeners', () => {
    it('should fire initialize listeners on custom extension', async () => {
        let core = new KitesCore({
            discover: false,
            logger: {
                console: {
                    level: 'debug',
                    transport: 'console'
                }
            }
        });

        core.use({
            directory: '',
            main: (kites, definition) => {
                kites.initializeListeners.add('big gun', () => {
                    kites.logger.debug('Big gun fires!!!');
                    kites.customExtensionInitialized  = true;
                });
            },
            name: 'test',
        });

        let newkites = await core.init();
        expect(newkites.customExtensionInitialized).eq(true);
    });
});
