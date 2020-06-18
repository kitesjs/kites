import { KitesExtension, KitesInstance } from '@kites/core';
import { existsSync, readFile } from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

/**
 * Bootstrap the main extension
 * @param kites
 * @param options
 */
export default function (kites: KitesInstance, extension: KitesExtension) {
  // config one page application
  kites.on('express:config:static', (app) => {
    if (typeof extension.options.pages === 'object') {
      const vRoutes = Object.keys(extension.options.pages);
      for (const vRoute of vRoutes) {
        const vPage = extension.options.pages[vRoute];
        const vFilePath = kites.defaultPath(vPage);
        kites.logger.debug(`Spa test: ${vRoute}, ${vFilePath}`);
        if (existsSync(vFilePath)) {
          kites.logger.info('Spa config route: ' + vRoute);
          app.get(vRoute, async (req, res) => {
            kites.logger.debug('Serve static file: ' + vFilePath);
            const vContent = await readFileAsync(vFilePath, 'utf-8');
            res.send(vContent);
          });
        }
      }
    }
  });

}
