import { assert, expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import engine, { KitesExtension } from '../main';
import { IKites, KitesInstance } from './kites';

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

        await engine().ready((app) => {
            app.logger.info('Kites is ready!');
            expect(app).instanceOf(KitesInstance);
        }).init();

    });

    it('should use a legal extension', async () => {
        class Aa implements KitesExtension {
            get name() {
                return 'abc';
            }

            init(core: IKites) {
                core.logger.info('Kites extension initializing ...');
                expect(core.isInitialized).eq(false, 'The application should not be ready!');
            }
        }

        const app = await engine().use(new Aa()).init();
        expect(app.isInitialized).eq(true, 'The application should be ready!');
        expect(app).instanceOf(KitesInstance);
    });

    it('should use function as an extension', async () => {
        var extensionInitialized = false;

        const app = await engine().use({
            directory: '',
            main: (core, definition) => {
                core.logger.info('Kites use function as an extension!!!', definition.name);
                core.guest = true;
                extensionInitialized = true;
            },
            name: 'test',
        }).init();

        expect(extensionInitialized).eq(true, 'extension has initialized!');
        expect(app.guest).eq(true, 'attach an object to kites!');
    });

    it('should auto discover when the feature is enabled', async () => {

        await engine({
            discover: true,
            extensionsLocationCache: false,
            rootDirectory: path.resolve('test')
        }).ready((core) => {
            core.logger.info('Kites is ready!');
            expect(core.aKitesExtensionInitialized).eq(true, 'found a kites extension which has initialized!');
        }).init();
    });

    it('should accept plain function as an extension', async () => {

        await engine(false).use((app) => {
            app.guest2 = true;
        }).ready((app) => {
            expect(app.guest2).eq(true, 'kites use function definition as an extension!');
        }).init();
    });

});

describe('kites logs', () => {
    it('should not log to console by default', async () => {

        stdMocks.use({
            print: true
        });

        await engine(false).use((app) => {
            app.guest2 = true;
        }).ready(() => {
            stdMocks.restore();
            let stdoutContent = stdMocks.flush();
            expect(stdoutContent.stdout.length).eq(0, 'stdout is empty');
        }).init();
    });

    it('should keep silent logs', async () => {

        stdMocks.use({
            print: true
        });

        let app = await engine({
            logger: {
                silent: true
            }
        }).init();

        stdMocks.restore();
        let stdoutContent = stdMocks.flush();
        expect(stdoutContent.stdout.length).eq(0, 'stdout is empty');

        let allTransportAreSilent = Object.keys(app.logger.transports).every((name) => app.logger.transports[name].silent === true);
        expect(allTransportAreSilent).eq(true, 'all transports are silent');
    });

    it('should have Debug transport for logs enabled by default', () => {
        engine(false).init().then((app) => {
            expect(app.logger.transports).to.have.property('debug');
        });
    });

    it('should fail to configure custom transport that does not have enough options', async () => {

        await engine({
            logger: {
                console: {
                    transport: 'console'
                }
            }
        })
        .init()
        .catch((err) => {
            expect(err).is.instanceOf(Error);
            assert.match(err.message, /option "level" is not specified or has an incorrect value/);
        });
    });

    it('should not load disabled transports for loggger', async () => {

        let app = await engine({
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
        }).init();

        assert.isUndefined(app.logger.transports.memory, 'memory transport shoud be undefined');
        assert.isNotNull(app.logger.transports.debug, 'debug transport should be not undefined or null');
    });

    it('should configure custom transports for logger', async () => {

        let app = await engine({
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
        }).init();
        assert.isNotNull(app.logger.transports.memory, 'memory transport shoud be not undefined or null');
        assert.isNotNull(app.logger.transports.debug, 'debug transport should be not undefined or null');
    });
});

describe('kites initializeListeners', () => {
    it('should fire initialize listeners on custom extension', async () => {
        let kites = engine({
            logger: {
                console: {
                    level: 'debug',
                    transport: 'console'
                }
            }
        });

        kites.use((core, definition) => {
            core.logger.info('Log ext definition: ', definition);
            core.initializeListeners.add('big gun', () => {
                core.logger.debug('Big gun fires!!!');
                core.customExtensionInitialized  = true;
            });
        });

        let app = await kites.init();
        expect(app.customExtensionInitialized).eq(true);
    });
});

describe('kites load configuration', () => {
    beforeEach(() => {
        // remove config file before each test
        removeKitesConfigFiles();
    });

    it('should parse dev.config.json when loadConfig and NODE_ENV=development', async () => {
        process.env.NODE_ENV = 'development';
        fs.writeFileSync(path.join(__dirname, 'dev.config.json'), JSON.stringify({
            test: 'kites:dev'
        }));

        let kites = engine({
            appDirectory: __dirname,
            loadConfig: true
        });

        let app = await kites.init();
        expect(app.options.test).eq('kites:dev');
    });

    it('should parse prod.config.json when loadConfig and NODE_ENV=production', async () => {
        process.env.NODE_ENV = 'production';
        fs.writeFileSync(path.join(__dirname, 'prod.config.json'), JSON.stringify({
            test: 'kites:prod'
        }));

        let kites = engine({
            appDirectory: __dirname,
            loadConfig: true
        });

        let app = await kites.init();
        expect(app.options.test).eq('kites:prod');
    });

    it('should parse kites.config.json when loadConfig and not set NODE_ENV', async () => {
        delete process.env.NODE_ENV;
        fs.writeFileSync(path.join(__dirname, 'kites.config.json'), JSON.stringify({
            test: 'kites:default'
        }));

        let kites = engine({
            appDirectory: __dirname,
            loadConfig: true
        });

        let app = await kites.init();
        expect(app.options.test).eq('kites:default');
    });

    it('should parse absolute configFile option when loadConfig', async () => {

        fs.writeFileSync(path.join(__dirname, 'custom.config.json'), JSON.stringify({
            test: 'kites:custom'
        }));

        let kites = engine({
            appDirectory: __dirname,
            configFile: path.join(__dirname, 'custom.config.json'),
            loadConfig: true
        });

        let app = await kites.init();
        expect(app.options.test).eq('kites:custom');
    });

    it('should throws error when configFile not found and loadConfig', async () => {

        let kites = engine({
            appDirectory: __dirname,
            configFile: path.join(__dirname, 'custom.config.json'),
            loadConfig: true
        });

        try {
            await kites.init();
        } catch (err) {
            expect(/custom.config.json was not found.$/.test(err)).eq(true);
        }
    });

});

describe('kites load env options', () => {
    it('should parse env options into kites options when loadConfig', async () => {
        process.env.httpPort = '3000';
        process.env.NODE_ENV = 'kites';

        let kites = engine({
            appDirectory: __dirname,
            loadConfig: true
        });

        let app = await kites.init();
        expect(app.options.httpPort).eq('3000');
        expect(app.options.env).eq('kites');
    });

    it('should use options provided when loadConfig', async () => {
        delete process.env.httpPort;
        process.env.NODE_ENV = 'kites';

        const app = new KitesInstance({
            appDirectory: __dirname,
            httpPort: 4000,
            loadConfig: true
        });

        await app.init();
        expect(app.options.httpPort).eq(4000);
        expect(app.options.env).eq('kites');
    });
});

describe('kites utilities', () => {
    it('should access app path', () => {
        let app = new KitesInstance();

        app.options.indexHtml = 'public/index.html';
        expect(app.rootDirectory).eq(path.resolve(process.cwd(), '../'));
        expect(app.appDirectory).eq(process.cwd());
        expect(app.defaultPath(app.options.indexHtml)).eq(path.resolve(app.appDirectory, 'public/index.html'));
        expect(app.defaultPath(app.options.indexHtmlNotSet)).eq(app.appDirectory);
        expect(app.defaultOption('indexHtml', 'dist/index2.html')).eq('public/index.html');
        expect(app.defaultOption('indexHtmlNotSet', 'public/index2.html')).eq('public/index2.html');

    });
});
