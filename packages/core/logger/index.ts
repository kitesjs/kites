import { defaults } from 'lodash';
import * as path from 'path';
import { format as logFormat, Logger, LoggerOptions, loggers } from 'winston';
import { DebugTransport } from './debug-transport';

/**
 * Get or create a logger with empty transport
 * @param name
 * @param options
 */
export function getLogger(name: string, options?: any): Logger {
  // TODO: Refactor options for logger (not for transport)
  if (!loggers.has(name)) {
    const {format, transports} = options;
    const defaultTransports = transports || [];

    if (defaultTransports && defaultTransports.length === 0) {
      // add default Debug transport
      defaultTransports.push(new DebugTransport(options, name));
    }

    const loggerOptions: LoggerOptions = defaults(
    {
      exitOnError: false,
      level: 'info',
      format: logFormat.combine(
        logFormat.splat(), // formats level.message based on Node's util.format().
        logFormat.label({ label: name }),
        logFormat.colorize(),
        logFormat.timestamp(),
        logFormat.printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`)
      ),
      transports: defaultTransports,
    }, {
      format,
    });

    loggers.add(name, loggerOptions);
    loggers.get(name).on('error', (err: any) => {
      if (err.code === 'ENOENT') {
        let msg = err;
        if (path.dirname(err.path) === '.') {
          msg = 'Error from logger (winston) while trying to use a file to store logs:';
        } else {
          msg = 'Error from logger (winston) while trying to use a file to store logs, if the directory "'
            + err.path + '" does not exists please create it:';
        }
        // make the error intentionally more visible to get the attention of the user
        console.error('------------------------');
        console.error(msg, err);
        console.error('------------------------');
      }
    });
  }

  return loggers.get(name);
}

/**
 * Get or create logger with default `debug` transport
 */
export function getDebugLogger(name: string, options?: any) {
  if (!loggers.has(name)) {
    loggers.add(name, {
      exitOnError: false,
      level: 'info',
      format: logFormat.combine(
        logFormat.splat(), // formats level.message based on Node's util.format().
        logFormat.label({ label: name }),
        logFormat.colorize(),
        logFormat.timestamp(),
        logFormat.printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`)
      ),
      transports: [new DebugTransport(options, name)],
    });
  }
  return loggers.get(name);
}

export {
  DebugTransport
};
