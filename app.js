'use strict'
const kites = require('kites');

/**
 * minimalist kites application
 */
kites({
        rootDirectory: __dirname,
        loadConfig: true,
        discover: true
    })
    .init()
    .then(function (kites) {
        kites.logger.info('Hello world!');
    })
    .catch(function (e) {
        console.error(e.stack);
        process.exit(1);
    })
