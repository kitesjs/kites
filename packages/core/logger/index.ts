import * as path from 'path';
import { format, Logger, loggers } from 'winston';
import { DebugTransport } from './debug-transport';

/**
 * Create a logger with empty transport
 * @param name
 * @param options
 */
function createLogger(name: string, options?: any): Logger {
  // TODO: Refactor options for logger (not for transport)
  if (!loggers.has(name)) {
    // add default Debug transport?
    const defaultTransports = Object.keys(options || {}).length > 0 ? [] : [
      new DebugTransport(options, name),
    ];

    loggers.add(name, {
      exitOnError: false,
      level: 'info',
      format: format.combine(
        format.splat(), // formats level.message based on Node's util.format().
        format.label({ label: name }),
        format.colorize(),
        format.timestamp(),
        format.printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`)
      ),
      transports: defaultTransports,
    });

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
  } else {
    // remove all transports and add default Debug transport
    loggers.get(name).clear();

    if (Object.keys(options || {}).length === 0) {
      loggers.get(name).add(new DebugTransport(options, name));
    }
  }

  return loggers.get(name);
}

/**
 * Create logger with default `debug` transport
 */
function createDebugLogger(name: string, options?: any) {
  if (!loggers.has(name)) {
    loggers.add(name, {
      exitOnError: false,
      level: 'info',
      format: format.combine(
        format.splat(), // formats level.message based on Node's util.format().
        format.label({ label: name }),
        format.colorize(),
        format.timestamp(),
        format.printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`)
      ),
      transports: [new DebugTransport(options, name)],
    });
  }
  return loggers.get(name);
}

export {
  createLogger,
  createDebugLogger,
  DebugTransport
};
