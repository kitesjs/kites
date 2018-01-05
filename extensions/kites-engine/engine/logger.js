'use strict';
const debug = require('debug');

const NAMESPACE = 'Kites';

/**
 * Expose new instance of `Logger`
 */
module.exports = function (prefix) {
    return new Logger(prefix);
};

class Logger {
    constructor(prefix) {
        if (prefix) {
            this._debug = debug(NAMESPACE + ':' + prefix);
            this._log = debug(NAMESPACE + ':INFO:' + prefix);
            this._warn = debug(NAMESPACE + ':WARN:' + prefix);
            this._error = debug(NAMESPACE + ':ERROR:' + prefix);
        } else {
            this._debug = debug(NAMESPACE);
            this._log = debug(NAMESPACE + ':INFO');
            this._warn = debug(NAMESPACE + ':WARN');
            this._error = debug(NAMESPACE + ':ERROR');
        }

        this._debug.log = console.info.bind(console);
        this._log.log = console.info.bind(console);
        this._warn.log = console.warn.bind(console);
        this._error.log = console.error.bind(console);
    }

    get debug() {
        return this._debug;
    }

    get log() {
        return this._log;
    }

    get info() {
        return this._log;
    }

    get warn() {
        return this._warn;
    }

    get error() {
        return this._error;
    }
}