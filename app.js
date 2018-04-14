'use strict'
const kites = require('@kites/engine');

/**
 * minimalist kites application
 */
kites({
        loadConfig: true,
        discover: false
    })
    .use(require('./extensions/sum'))
    .init()
    .then(function (kites) {
        var total = kites.sum([2, 4, 6, 8]);
        kites.logger.info('Kites total: ', total);
        kites.logger.info('Hello world!');
    })
    .catch(function (e) {
        console.error(e.stack);
        process.exit(1);
    })