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
    
    troot.end();
});