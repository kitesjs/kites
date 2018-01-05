var os = require('os');
var test = require('tape');
var discover = require('../../engine/extensions/discover');
var Logger = require('../util/testLogger');

// close server by exit application
test('discover extensions', function (troot) {
    let config = {
        logger: new Logger(),
        tempDirectory: os.tmpdir(),
        rootDirectory: __dirname  
    }

    test('load an extension', (t) => {
        t.plan(1)
        discover(config).then((extensions) => {
            // console.log('info:', config, extensions);
            t.equal(extensions.length, 1, 'number of extensions in current directory');
        })
    })
    
    troot.end();
});