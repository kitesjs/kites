'use strict';

class TestLogger {
    constructor() {
        this.info = console.log.bind(console);
        this.warn = console.log.bind(console);
        this.error = console.log.bind(console);
        this.debug = console.log.bind(console);
    }
}

module.exports = TestLogger;