'use strict';
var os = require('os');
var test = require('tape');
var stdMocks = require('std-mocks');
var engine = require('../index');
var Logger = require('./util/testLogger');

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

    troot.end();
});

test('kites logs', function (troot) {

    test('kites do not log to console by default', (t) => {
        t.plan(1);

        var kites = engine({
            discover: true
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