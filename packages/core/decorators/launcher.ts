import { ApplicationOptions, AppConfig } from '@kites/common';

export const appInfo: ApplicationOptions = {} as any;

export function Launcher(appConfig: AppConfig): ClassDecorator {
  Object.assign(appInfo, appConfig);

  (async () => {
    let shutdownResolve;

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
