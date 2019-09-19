import { engine } from '@kites/core';

async function bootstrap() {
  // load config & autodiscover
  const app = await engine(true).init();
  app.logger.info('Kites application started!');
}

bootstrap();
