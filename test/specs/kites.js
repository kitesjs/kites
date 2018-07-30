'use strict';
var test = require('tape');
var kites = require('../../index');

test('kites engine', (troot) => {
    test('ready callback', (t) => {
        t.plan(1);

        kites({
                discover: false
            })
            .ready((kites) => {
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
