'use strict';
var os = require('os');
var test = require('tape');
var engine = require('../index');
var Logger = require('./util/testLogger');

// close server by exit application
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