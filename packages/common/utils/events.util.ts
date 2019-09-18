import { EventEmitter } from 'events';

/**
 * Promisify event to await
 * @param emitter
 * @param name
 */
function once(emitter: EventEmitter, name) {
  return new Promise((resolve, reject) => {
    const eventListener = (...args) => {
      if (errorListener !== undefined) {
        emitter.removeListener('error', errorListener);
      }
      resolve(args);
    };
    let errorListener;

    // Adding an error listener is not optional because
    // if an error is thrown on an event emitter we cannot
    // guarantee that the actual event we are waiting will
    // be fired. The result could be a silent way to create
    // memory or file descriptor leaks, which is something
    // we should avoid.
    if (name !== 'error') {
      errorListener = (err) => {
        emitter.removeListener(name, eventListener);
        reject(err);
      };

      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}

export {
  once,
};
