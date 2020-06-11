import { ExtensionDefinition, KitesInstance } from '@kites/core';
import { readFile } from 'fs';
import { join as pathJoin } from 'path';
import { promisify } from 'util';

import { getAuthToken } from './lib/utils';

const readFileAsync = promisify(readFile);
const viewFilePath = pathJoin(__dirname, 'pages/login.html');

export default function (kites: KitesInstance, definition: ExtensionDefinition) {

  // TODO: Get user from database
  const vUsers = kites.options[definition.name].users || {};
  const vMapUsers = new Map(Object.entries(vUsers));
  kites.logger.info(`Config: ${definition.name}, vUsers: ${vMapUsers.size}`);

  // config login page & users token
  kites.on('before:express:config', (app) => {

    app.all('/logout', (req, res) => {
      req.user = undefined;
      res.clearCookie('token');
      res.redirect('/');
    });

    // config login page.
    app.get('/login', async (req, res) => {

      if (req.user) {
        return res.redirect('/');
      }

      const viewPage = await readFileAsync(viewFilePath, 'utf-8');
      res.set('Content-Type', 'text/html');
      res.send(viewPage);
    });

    app.post('/login', (req, res) => {
      const vUrlBack = req.query.back || '/';
      const { username, password } = req.body;
      if (vMapUsers.has(username) && vMapUsers.get(username) === password) {
        const vToken = Buffer.from(`${username}:${password}`).toString('base64');

        kites.logger.info(`Login success: ${username}! Redirect to: ${vUrlBack}`);
        res.cookie('token', vToken);
        res.redirect(vUrlBack);
      } else {
        kites.logger.debug('Login bad request!');
        res.status(401);
        res.redirect('/login');
      }
    });

    if (vMapUsers.size > 0) {
      kites.logger.info('Config user login with basic authentication!');
      app.use((req, res, next) => {
        const urlBack = req.url;
        const authToken = getAuthToken(req);
        if (!authToken) {

          kites.logger.debug(`User is not auth!`);
          res.status(401);
          return res.redirect('/login?back=' + urlBack);
        }
        const auth = Buffer.from(authToken, 'base64').toString();
        const [username, password] = auth.split(':');
        if (vMapUsers.has(username) && vMapUsers.get(username) === password) {
          req.user = username;
          // authorized
          next();
        } else {

          res.status(401);
          return res.redirect('/login?back=' + urlBack);
        }
      });
    } else {
      kites.logger.info('[Auth] No user logins required!');
    }
  });
}
