import { KitesExtension, KitesInstance } from '@kites/core';
import { getDebugLogger } from '@kites/core/logger';
import { MessengerUI } from './ui/messenger';
// import {  } from './extension';

/**
 * Main extension
 * @param kites
 * @param definition
 */
export default function main(kites: KitesInstance, definition: KitesExtension) {

  const options = kites.options.botscript || definition.options;
  const { FB_URL, PAGE_ACCESS_TOKEN, VALIDATION_TOKEN, APP_SECRET } = options.messenger;
  const vMessengerUI = new MessengerUI(PAGE_ACCESS_TOKEN, VALIDATION_TOKEN, APP_SECRET, FB_URL);
  const logger = getDebugLogger('BS:MessengerUI');

  logger.info('Setup config!');
  // add initializer
  kites.on('express:config', (app) => {
    vMessengerUI.init({ app, kites, logger, options: options.messenger });

    vMessengerUI.on('message', (data) => {
      kites.emit('botscript', { data, type: 'message' });
    });
  });
}
