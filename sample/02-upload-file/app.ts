import { KitesFactory, KitesInstance } from '@kites/core';
import express, { Express } from '@kites/express';
import rest from '@kites/rest';

// import to discover controllers
import './api';

async function bootstrap() {
  const app = await KitesFactory
    .create({
      loadConfig: true,
      discover: false,  // this value will be overrided by kites.config.json
      providers: []
    })
    .use(express())
    .use(rest())
    .use((kites: KitesInstance) => {
      kites.on('express:config', (ea: Express) => {
        kites.logger.info('Configure page views ...');
        ea.get('/', (req, res) => res.view('index'));

        // error handler
        ea.use((err, req, res, next) => {
          kites.logger.error('Error: ', err);
          res.status(500).json(err.message);
        });
      });

    })
    .init();

  // Let's browse http://localhost:3000
  app.logger.info('Server started!');
}

bootstrap();
