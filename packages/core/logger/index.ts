import * as path from 'path';
import { format, Logger, loggers, transports } from 'winston';
import { DebugTransport } from './debug-transport';

function createLogger(name: string, options?: any): Logger {
  if (!loggers.has(name)) {

    loggers.add(name, {
      exitOnError: false,
      level: 'info',
      format: format.combine(
        format.label({ label: name }),
        format.colorize(),
        format.timestamp(),
        format.printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`)
      ),
      transports: [
        // add default Console transport
        new transports.Console(),
      ],
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
    // remove all transports and add default Console transport
    loggers.get(name).clear();
    loggers.get(name).add(new transports.Console());
  }

  return loggers.get(name);
}

export {
  createLogger,
  DebugTransport
};
