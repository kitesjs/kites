'use strict';
const path = require('path');
const Kites = require('./engine/kites.js');

/**
 * Kites factory.
 * @param {Object} options 
 */
module.exports = function(options) {
    let opts = Object.assign({
        parentModuleDirectory: path.dirname(module.parent.filename)
    }, options);

    return new Kites(opts);
}

module.exports.Kites = Kites;