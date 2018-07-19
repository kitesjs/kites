'use strict';
var os = require('os');
var fs = require('fs');
var path = require('path');
var test = require('tape');
var stdMocks = require('std-mocks');
var engine = require('../index');
var Logger = require('./util/testLogger');

function safeUnlink(p) {
    try {
        fs.unlinkSync(p)
    } catch (e) {

    }
}

function removeKitesConfigFiles() {
    safeUnlink(path.join(__dirname, 'prod.config.json'))
    safeUnlink(path.join(__dirname, 'dev.config.json'))
    safeUnlink(path.join(__dirname, 'kites.config.json'))
    safeUnlink(path.join(__dirname, 'custom.config.json'))
}

test('kites engine', (troot) => {
    test('ready callback', (t) => {
        t.plan(1);

        var kites = engine({
            discover: false
        });

        kites.ready((kites) => {
            kites.logger.info('Kites is ready');
            t.true(kites);
        })
        .init()
        .then((kites) => {
            kites.logger.info('Kites has initialized!');
            t.comment('Kites is ready!')
        })
    })

    troot.end()
})

test('kites extensions', function (troot) {
    let config = {
        logger: new Logger(),
        rootDirectory: __dirname,
        tempDirectory: os.tmpdir(),
        extensionsLocationCache: false
    }

    test('auto discover extensions when no use called', (t) => {
        t.plan(1);

        var kites = engine(config);
        kites.init().then(() => {
            t.equal(kites.aKitesExtensionInitialized, true, 'a kites extension has initialized')
        })
    })

    test('ability to use custom extension', (t) => {
        t.plan(1);

        var extensionInitialized = false;
        var kites = engine({
            rootDirectory: __dirname
        });

        kites.use({
            name: 'test',
            main: (kites, definition) => {
                extensionInitialized = true
            }
        })

        kites.init().then(() => {
            t.equal(extensionInitialized, true, 'kites use an extension has initialized')
        })
    })

    test('accept plain function as an extension', (t) => {
        t.plan(1);

        var kites = engine({
            rootDirectory: __dirname
        });
        var extensionInitialized = false;
        kites.use((kites) => {
            extensionInitialized = true;
        })

        kites.init().then(() => {
            t.equal(extensionInitialized, true);
        })
    })

    troot.end();
});

test('kites logs', function (troot) {

    test('kites do not log to console by default', (t) => {
        t.plan(1);

        var kites = engine({
            discover: true,
            rootDirectory: __dirname
        });
        stdMocks.use({
            print: true
        });

        kites.init()
            .then(() => {
                stdMocks.restore();
                let stdoutContent = stdMocks.flush();
                t.equal(stdoutContent.stdout.length, 0, 'stdout is empty');
            })
    })

    test('keep silent logs', (t) => {
        t.plan(2);

        var kites = engine({
            discover: false,
            logger: {
                silent: true
            }
        });

        stdMocks.use({
            print: true
        });

        kites.init().then(() => {
            stdMocks.restore();
            let stdoutContent = stdMocks.flush();
            t.equal(stdoutContent.stdout.length, 0, 'stdout is empty');

            var allTransportsAreSilent = Object.keys(kites.logger.transports).every((name) => {
                return kites.logger.transports[name].silent === true
            });

            t.equal(allTransportsAreSilent, true, 'all transports are silent');
        })
    })

    test('kites have Debug transport for logs enabled by default', (t) => {
        t.plan(1);
        var kites = engine({
            discover: false
        });
        kites.init().then(() => {
            t.true(kites.logger.transports.debug, 'Debug transport should be not undefined');
        })
    })

    test('fail to configure custom transport that do not have enough options', (t) => {
        t.plan(1);
        var kites = engine({
            discover: false,
            logger: {
                console: {
                    transport: 'console'
                }
            }
        })

        kites.init().catch((err) => {
            t.throws(() => {
                throw err
            }, /option "level" is not specified/)
        })
    })

    test('do not load disabled transports for logger', (t) => {
        t.plan(2);

        let kites = engine({
            discover: false,
            logger: {
                console: {
                    transport: 'console',
                    level: 'debug'
                },
                memory: {
                    transport: 'memory',
                    level: 'debug',
                    enabled: false
                }
            }
        })

        kites.init().then(() => {
            t.equal(typeof kites.logger.transports.debug, 'object', 'debug transport should be not undefined')
            t.equal(typeof kites.logger.transports.memory, 'undefined', 'memory transport shoud be undefined')
        })
    })

    test('configure custom transports for logger', (t) => {
        t.plan(2);

        let kites = engine({
            discover: false,
            logger: {
                console: {
                    transport: 'console',
                    level: 'debug'
                },
                memory: {
                    transport: 'memory',
                    level: 'debug'
                }
            }
        })

        kites.init().then(() => {
            t.equal(typeof kites.logger.transports.debug, 'object', 'debug transport should be not undefined')
            t.equal(typeof kites.logger.transports.memory, 'object', 'memory transport shoud be not undefined')
        })
    })

    troot.end()
})

test('kites initializeListeners', (troot) => {

    test('fire initialize listeners on custom extension', (t) => {
        t.plan(1);

        var kites = engine({
            discover: false,
            logger: {
                console: {
                    transport: 'console',
                    level: 'debug'
                }
            }
        });
        var customExtensionInitialized = false;

        kites.use({
            name: 'test',
            main: (kites, definition) => {
                kites.initializeListeners.add('big gun', () => {
                    kites.logger.debug('Big gun fires!!!')
                    customExtensionInitialized = true;
                })
            }
        })

        kites.init().then(() => {
            t.equal(customExtensionInitialized, true, 'Big gun has fired')
        })
    })

    troot.end();
})

test('kites load configuration', (troot) => {

    test('parse dev.config.json when loadConfig and NODE_ENV=development', (t) => {
        t.plan(1);
        removeKitesConfigFiles();

        process.env.NODE_ENV = 'development'
        fs.writeFileSync(path.join(__dirname, 'dev.config.json'), JSON.stringify({
            test: 'kites:dev'
        }))

        var kites = engine({
            discover: false,
            appDirectory: __dirname,
            loadConfig: true
        })

        kites.init().then(() => {
            t.equal(kites.options.test, 'kites:dev')
        })

    })

    test('parse prod.config.json when loadConfig and NODE_ENV=production', (t) => {
        t.plan(1);
        removeKitesConfigFiles();

        process.env.NODE_ENV = 'production'
        fs.writeFileSync(path.join(__dirname, 'prod.config.json'), JSON.stringify({
            test: 'kites:prod'
        }))

        var kites = engine({
            discover: false,
            appDirectory: __dirname,
            loadConfig: true
        })

        kites.init().then(() => {
            t.equal(kites.options.test, 'kites:prod')
        })

    })

    test('parse kites.config.json when loadConfig and not set ENV', (t) => {
        t.plan(1);
        removeKitesConfigFiles();

        delete process.env.NODE_ENV;
        fs.writeFileSync(path.join(__dirname, 'kites.config.json'), JSON.stringify({
            test: 'kites:default'
        }))

        var kites = engine({
            discover: false,
            appDirectory: __dirname,
            loadConfig: true
        })

        kites.init().then(() => {
            t.equal(kites.options.test, 'kites:default')
        })

    })


    test('parse absolute configFile option when loadConfig', (t) => {
        t.plan(1);
        removeKitesConfigFiles();

        fs.writeFileSync(path.join(__dirname, 'custom.config.json'), JSON.stringify({
            test: 'kites:custom'
        }))

        var kites = engine({
            rootDirectory: __dirname,
            discover: false,
            configFile: path.join(__dirname, 'custom.config.json'),
            loadConfig: true
        })

        kites.init().then(() => {
            t.equal(kites.options.test, 'kites:custom')
        })

    })

    test('throw error when configFile not found and loadConfig', (t) => {
        t.plan(1);
        removeKitesConfigFiles();

        var kites = engine({
            rootDirectory: __dirname,
            discover: false,
            configFile: path.join(__dirname, 'custom.config.json'),
            loadConfig: true
        })

        kites.init().catch((err) => {
            t.throws(() => {
                throw err
            }, /custom.config.json/)
        })

    })

    test('parse env options into kites options when loadConfig', (t) => {
        t.plan(2);

        process.env.httpPort = 3000
        process.env.NODE_ENV = 'kites'

        var kites = engine({
            rootDirectory: __dirname,
            discover: false,
            loadConfig: true
        })

        kites.init().then(() => {
            t.equal(kites.options.httpPort, '3000')
            t.equal(kites.options.env, 'kites')
        })

    })

    test('use options provided when loadConfig', (t) => {
        t.plan(2);

        delete process.env.httpPort
        process.env.NODE_ENV = 'kites'

        var kites = engine({
            rootDirectory: __dirname,
            discover: false,
            loadConfig: true,
            httpPort: 4000
        })

        kites.init().then(() => {
            t.equal(kites.options.httpPort, 4000)
            t.equal(kites.options.env, 'kites')
        })

    })

    troot.end()
})

test('kites utilities', (t) => {
    
    var kites = engine({
        discover: false
    });

    kites.options.indexHtml = 'public/index.html'

    t.equal(kites.rootDirectory, path.resolve(process.cwd(), '../../'));
    t.equal(kites.appDirectory, path.resolve(process.cwd()));
    t.equal(kites.defaultPath(kites.options.indexHtml, '../dist/index.html'), path.resolve(__dirname, '../public/index.html'));
    t.equal(kites.defaultPath(kites.options.indexHtmlNotSet, 'dist/index.html'), path.resolve(__dirname, '../dist/index.html'));
    t.equal(kites.defaultOption('indexHtml', 'dist/index2.html'), 'public/index.html');
    t.equal(kites.defaultOption('indexHtmlNotSet', 'dist/index2.html'), 'dist/index2.html');

    t.end();
})