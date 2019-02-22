import { IKites } from '@kites/engine';
import * as mkdirp from 'mkdirp';
import * as path from 'path';

/**
 * Route configuration to add logger Transports
 * @param {Object} kites
 */
export function addTransports(kites: IKites) {
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
    const defaultLevel = kites.options.env === 'production' ? 'info' : 'debug';

    /**
     * Log to console
     */
    kites.options.logger.console = Object.assign({
        colorize: true,
        level: defaultLevel,
        timestamp: true,
        transport: 'console',
    }, kites.options.logger.console);

    /**
     * Log to file (info)
     */
    kites.options.logger.file = Object.assign({
        filename: 'logs/kites.log',
        json: false,
        level: defaultLevel,
        maxsize: 10485760,
        transport: 'file',
    }, kites.options.logger.file);

    /**
     * Log to file (error)
     */
    kites.options.logger.error = Object.assign({
        filename: 'logs/error.log',
        handleExceptions: true,
        json: false,
        level: 'error',
        transport: 'file',
    }, kites.options.logger.error);

    /**
     * winston doesn't create the directories for logs automatically
     * we don't want to do it for developers as well, but also we want to make kites with default config running
     * without errors, so we break the consistency here and precreate the logs directory if the config equals to default
     */
    if (kites.options.logger.file.filename === 'logs/kites.log') {
        mkdirp.sync(path.dirname(kites.options.logger.file.filename));
    }
}
