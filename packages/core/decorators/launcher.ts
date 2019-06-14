import { AppConfig, ApplicationOptions } from '@kites/common';
import { IKitesOptions } from '../engine/kites';
import { engine } from '../engine/main';

export const appInfo: ApplicationOptions = {} as any;

export function Launcher(options: IKitesOptions): ClassDecorator {
  Object.assign(appInfo, options);

  (async () => {
    let shutdownResolve;

    const app = await engine(options).init();
    // app.logger.info('Server started!');

    console.log('Server started!');

    // // Wait for the system to stop
    // await new Promise(resolve => shutdownResolve = resolve);

    // // Stop system
    // for (let workerFactory of appInfo.workerFactorys) {
    //   workerFactory.shutdown();
    // }
    // appInfo.webServer.shutdown();
    // process.exit(0);
  })();

  return function (target) { };
}
