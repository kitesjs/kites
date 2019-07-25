import {Router} from 'express';

/**
 * Export default router
 */
export function defaultRouter() {
  const router = Router();

  /**
   * get current kites version
   */
  router.get('/version', (req, res) => {
    const kites = req.kites;
    res.send(`${kites.name}@${kites.version}`);
  });

  /**
   * check kites is ready
   */
  router.get('/ping', (req, res) => {
    const kites = req.kites;
    if (!kites.isInitialized) {
      return res.forbidden('Not yet initialized.');
    }
    res.ok({
      kites: kites.version,
      msg: req.param('msg', 'pong'),
    });
  });

  return router;
}
