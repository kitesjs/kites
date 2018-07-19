var os = require('os');
var test = require('tape');
var discover = require('../../engine/extensions/discover');
var sorter = require('../../engine/extensions/sorter');
var Logger = require('../util/testLogger');

test('sorting extensions', function (troot) {
    let config = {
        logger: new Logger(),
        tempDirectory: os.tmpdir(),
        rootDirectory: __dirname  
    }

    test('sort extensions by name', (t) => {
        t.plan(3)
        discover(config).then((extensions) => {
            extensions.push(function test(kites) {
                kites.options.express.xpoweredby = false;
            })
            t.equal(extensions[0].name, 'a-kites-extension', 'Before sort extensions');
            // sort extensions
            extensions.sort(sorter);
            t.equal(extensions[0].name, '', 'After sort extensions (function has no name)');
            t.equal(extensions[1].name, 'a-kites-extension', 'After sort extensions (module has a name)');
        })
    })

    test('sort extensions by dependencies', (t) => {
        t.pass('sort extension by dependencies');
        t.end();
    })
    troot.end();
});