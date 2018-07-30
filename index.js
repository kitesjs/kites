'use strict';
const path = require('path');
const main = require('./lib/main');

module.exports = function (options) {
    options = options || {};

    options.parentModuleDirectory = path.dirname(module.parent.filename);

    return main(options);
}
