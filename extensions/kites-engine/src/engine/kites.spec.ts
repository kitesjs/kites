import { assert, expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import {KitesCore} from './kites';

import * as stdMocks from 'std-mocks';

function safeUnlink(fn: string) {
    try {
        console.log('Remove config file: ', fn);
        fs.unlinkSync(fn);
    } catch (e) {
        // do nothing
    }
}

function removeKitesConfigFiles() {
    safeUnlink(path.join(__dirname, 'prod.config.json'));
    safeUnlink(path.join(__dirname, 'dev.config.json'));
    safeUnlink(path.join(__dirname, 'kites.config.json'));
    safeUnlink(path.join(__dirname, 'custom.config.json'));
}

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

describe('kites load configuration', () => {
    beforeEach(() => {

        removeKitesConfigFiles();
    });

    it('should parse dev.config.json when loadConfig and NODE_ENV=development', async () => {
        process.env.NODE_ENV = 'development';
        fs.writeFileSync(path.join(__dirname, 'dev.config.json'), JSON.stringify({
            test: 'kites:dev'
        }));

        let core = new KitesCore({
            appDirectory: __dirname,
            discover: false,
            loadConfig: true
        });

        let kites = await core.init();
        expect(kites.options.test).eq('kites:dev');
    });

    it('should parse prod.config.json when loadConfig and NODE_ENV=production', async () => {
        process.env.NODE_ENV = 'production';
        fs.writeFileSync(path.join(__dirname, 'prod.config.json'), JSON.stringify({
            test: 'kites:prod'
        }));

        let core = new KitesCore({
            appDirectory: __dirname,
            discover: false,
            loadConfig: true
        });

        let kites = await core.init();
        expect(kites.options.test).eq('kites:prod');
    });

    it('should parse kites.config.json when loadConfig and not set NODE_ENV', async () => {
        delete process.env.NODE_ENV;
        fs.writeFileSync(path.join(__dirname, 'kites.config.json'), JSON.stringify({
            test: 'kites:default'
        }));

        let core = new KitesCore({
            appDirectory: __dirname,
            discover: false,
            loadConfig: true
        });

        let kites = await core.init();
        expect(kites.options.test).eq('kites:default');
    });

    it('should parse absolute configFile option when loadConfig', async () => {

        fs.writeFileSync(path.join(__dirname, 'custom.config.json'), JSON.stringify({
            test: 'kites:custom'
        }));

        let core = new KitesCore({
            appDirectory: __dirname,
            configFile: path.join(__dirname, 'custom.config.json'),
            discover: false,
            loadConfig: true
        });

        let kites = await core.init();
        expect(kites.options.test).eq('kites:custom');
    });

    it('should throws error when configFile not found and loadConfig', async () => {

        let core = new KitesCore({
            appDirectory: __dirname,
            configFile: path.join(__dirname, 'custom.config.json'),
            discover: false,
            loadConfig: true
        });

        try {
            await core.init();
        } catch (err) {
            expect(/custom.config.json was not found.$/.test(err)).eq(true);
        }
    });

});

describe('kites load env options', () => {
    it('should parse env options into kites options when loadConfig', async () => {
        process.env.httpPort = '3000';
        process.env.NODE_ENV = 'kites';

        let core = new KitesCore({
            appDirectory: __dirname,
            discover: false,
            loadConfig: true
        });

        let kites = await core.init();
        expect(kites.options.httpPort).eq('3000');
        expect(kites.options.env).eq('kites');
    });

    it('should use options provided when loadConfig', async () => {
        delete process.env.httpPort;
        process.env.NODE_ENV = 'kites';

        let core = new KitesCore({
            appDirectory: __dirname,
            discover: false,
            httpPort: 4000,
            loadConfig: true
        });

        let kites = await core.init();
        expect(kites.options.httpPort).eq(4000);
        expect(kites.options.env).eq('kites');
    });
});

describe('kites utilities', () => {
    it('should access app path', () => {
        let kites = new KitesCore({
            discover: false
        });

        kites.options.indexHtml = 'public/index.html';
        expect(kites.rootDirectory).eq(path.resolve(process.cwd(), '../'));
        expect(kites.appDirectory).eq(process.cwd());
        expect(kites.defaultPath(kites.options.indexHtml)).eq(path.resolve(kites.appDirectory, 'public/index.html'));
        expect(kites.defaultPath(kites.options.indexHtmlNotSet)).eq(kites.appDirectory);
        expect(kites.defaultOption('indexHtml', 'dist/index2.html')).eq('public/index.html');
        expect(kites.defaultOption('indexHtmlNotSet', 'public/index2.html')).eq('public/index2.html');

    });
});
