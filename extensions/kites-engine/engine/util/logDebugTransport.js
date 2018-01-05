'use strict';
const debug = require('debug')('kites');
const Transport = require('winston').Transport;

class LogDebugTransport extends Transport {
    constructor(options) {
        super();
        
        this.options = Object.assign({
            level: 'debug'
        }, options);

        this.name = 'debug';
        this.level = this.options.level;
    }

    log(level, msg, meta, callback) {
        debug(`${level} ${msg}`);
        callback(null, true);
    }
}

module.exports = function (options) {
    return new LogDebugTransport(options);
}