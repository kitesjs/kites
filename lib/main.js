'use strict';
const path = require('path');
const engine = require('@kites/engine');
const extendConfig = require('./extendConfig');
const packagejson = require('../package.json');

/**
 * Extends kites engine
 * @param {Object} options
 */
module.exports = (options) => {

    const optionsToUse = Object.assign({}, {
        discover: true,
        rootDirectory: path.join(__dirname, '../../../'),
        loadConfig: true
    }, options);

    const kites = engine(optionsToUse);

    kites.version = packagejson.version;

    return kites.afterConfigLoaded(extendConfig);
}
