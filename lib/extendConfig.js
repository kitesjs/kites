'use strict';
const path = require('path')
const mkdirp = require('mkdirp')

function addTransports(kites) {
    if (
        kites.logger.transports.console ||
        kites.logger.transports.file ||
        kites.logger.transports.error
    ) {
        // this condition prevents adding the same transports again.
        // usually this only happens when testing where there is a
        // lot of kites instances created
        return;
    }

    // default enable debug level for development
    const defaultLevel = kites.options.env === 'production' ? 'info' : 'debug'

    /**
     * Log to console
     */
    kites.options.logger.console = Object.assign({
        transport: 'console',
        level: defaultLevel,
        timestamp: true,
        colorize: true
    }, kites.options.logger.console)

    /**
     * Log to file (info)
     */
    kites.options.logger.file = Object.assign({
        transport: 'file',
        level: defaultLevel,
        filename: 'logs/kites.log',
        maxsize: 10485760,
        json: false
    }, kites.options.logger.file)

    /**
     * Log to file (error)
     */
    kites.options.logger.error = Object.assign({
        transport: 'file',
        level: 'error',
        filename: 'logs/error.log',
        handleExceptions: true,
        json: false
    }, kites.options.logger.error)

    /**
     * winston doesn't create the directories for logs automatically
     * we don't want to do it for developers as well, but also we want to make kites with default config running
     * without errors, so we break the consistency here and precreate the logs directory if the config equals to default
     */
    if (kites.options.logger.file.filename === 'logs/kites.log') {
        mkdirp.sync(path.dirname(kites.options.logger.file.filename))
    }
}

/**
 * Route configuration to add logger Transports
 * @param {Object} kites
 */
module.exports = (kites) => {
    addTransports(kites)
}
