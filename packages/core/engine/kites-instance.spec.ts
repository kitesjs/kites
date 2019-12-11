import * as appRoot from 'app-root-path';
import { assert, expect, should } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { IKites, KitesInstance } from './kites-instance';

import * as stdMocks from 'std-mocks';
import { transports } from 'winston';
import { KitesExtension } from '../extensions/extensions';
import { DebugTransport } from '../logger';
import { engine } from './kites-factory';

function safeUnlink(fn: string) {
  try {
    console.log('Remove config file: ', fn);
    fs.unlinkSync(fn);
  } catch (e) {
    // do nothing
  }
}

function removeKitesConfigFiles() {
  safeUnlink(path.join(__dirname, 'prod.config.json'));
  safeUnlink(path.join(__dirname, 'dev.config.json'));
  safeUnlink(path.join(__dirname, 'kites.config.json'));
  safeUnlink(path.join(__dirname, 'custom.config.json'));
}

describe('kites engine', () => {

  it(`should fire 'ready' event`, async () => {

    await engine().on('ready', (app) => {
      app.logger.info('Kites is ready!');
      expect(app).instanceOf(KitesInstance);
    }).init();

  });

  it('should use a legal extension', async () => {

    const app = await engine().use({
      name: 'test',
      main: function (kites: KitesInstance, definition: KitesExtension) {
        kites.logger.info('Kites extension initializing ...');
        expect(kites.isInitialized).eq(false, 'The application should not be ready!');
      }
    }).init();
    expect(app.isInitialized).eq(true, 'The application should be ready!');
    expect(app).instanceOf(KitesInstance);
  });

  it('should use function as an extension', async () => {
    var extensionInitialized = false;

    const app = await engine().use({
      directory: '',
      main: (core, definition) => {
        core.logger.info('Kites use function as an extension!!!', definition.name);
        core.guest = true;
        extensionInitialized = true;
      },
      name: 'test',
    }).init();

    expect(extensionInitialized).eq(true, 'extension has initialized!');
    expect(app.guest).eq(true, 'attach an object to kites!');
  });

  it('should auto discover when the feature is enabled', async () => {

    const rootDirectory = path.join(__dirname, '../test');
    const app = await engine({
      discover: true,
      extensionsLocationCache: false,
      // discover extensions from appDirectory (by default)
      appDirectory: rootDirectory,
      rootDirectory: rootDirectory
    }).init();

    expect(app.aKitesExtensionInitialized).eq(true, 'found a kites extension which has initialized!');
    expect(app.options.sample).eql({
      always: 'be here'
    }, 'read extension options!');
  });

  it('should accept plain function as an extension', async () => {

    const app = await engine(false).use((core) => {
      core.guest2 = true;
    }).init();

    expect(app.guest2).eq(true, 'kites use function definition as an extension!');
  });

});

describe('kites logs', () => {

  it('should keep silent logs', async () => {

    stdMocks.use({
      print: true
    });

    let app = await engine({
      logger: {
        silent: true
      }
    }).init();

    stdMocks.restore();
    let stdoutContent = stdMocks.flush();
    expect(stdoutContent.stdout.length).eq(0, 'stdout must be empty');

    let allTransportAreSilent = app.logger.transports.every((x) => x.silent === true);
    expect(allTransportAreSilent).eq(true, 'all transports are silent');
  });

  it('should have Debug transport enabled by default', () => {
    return engine()
      .init()
      .then((app) => {
        expect(app.logger.transports.some(x => x instanceof transports.Console)).eq(true, 'default transport');
      });
  });

  it('should fail to configure custom transport that does not have enough options', async () => {

    return await engine({
      logger: {
        console: {
          transport: 'console'
        }
      }
    })
      .init()
      .catch((err) => {
        expect(err).is.instanceOf(Error);
        assert.match(err.message, /option "level" is not specified or has an incorrect value/);
      });
  });

  it('should not load disabled transports', async () => {

    return await engine({
      logger: {
        debug: false, // do not add default transport
        console: {
          level: 'debug',
          transport: 'console'
        },
        file: {
          enabled: false,
          level: 'debug',
          transport: 'file',
          filename: './test.log'
        }
      }
    })
      .init()
      .then((app) => {
        expect(app.logger.transports.length).eq(1);
        expect(app.logger.transports.some(x => x instanceof transports.Console)).eq(true);
        expect(app.logger.transports.some(x => x instanceof transports.File)).eq(false);
      });
  });

});

describe('kites initializeListeners', () => {
  it('should fire initialize listeners on custom extension', async () => {
    let kites = engine({
      logger: {
        console: {
          level: 'debug',
          transport: 'console'
        }
      }
    });

    kites.use((core, definition) => {
      core.logger.info('Log ext definition: ', definition);
      core.initializeListeners.add('big gun', () => {
        core.logger.debug('Big gun fires!!!');
        core.customExtensionInitialized = true;
      });
    });

    let app = await kites.init();
    expect(app.customExtensionInitialized).eq(true);
  });
});

describe('kites load configuration', () => {
  beforeEach(() => {
    // remove config file before each test
    removeKitesConfigFiles();
  });

  it('should parse dev.config.json when loadConfig and NODE_ENV=development', async () => {
    process.env.NODE_ENV = 'development';
    fs.writeFileSync(path.join(__dirname, 'dev.config.json'), JSON.stringify({
      test: 'kites:dev'
    }));

    let kites = engine({
      appDirectory: __dirname,
      loadConfig: true
    });

    let app = await kites.init();
    expect(app.options.test).eq('kites:dev');
  });

  it('should parse prod.config.json when loadConfig and NODE_ENV=production', async () => {
    process.env.NODE_ENV = 'production';
    fs.writeFileSync(path.join(__dirname, 'prod.config.json'), JSON.stringify({
      test: 'kites:prod'
    }));

    let kites = engine({
      appDirectory: __dirname,
      loadConfig: true
    });

    let app = await kites.init();
    expect(app.options.test).eq('kites:prod');
  });

  it('should parse kites.config.json when loadConfig and not set NODE_ENV', async () => {
    delete process.env.NODE_ENV;
    fs.writeFileSync(path.join(__dirname, 'kites.config.json'), JSON.stringify({
      test: 'kites:default'
    }));

    let kites = engine({
      appDirectory: __dirname,
      loadConfig: true
    });

    let app = await kites.init();
    expect(app.options.test).eq('kites:default');
  });

  it('should parse absolute configFile option when loadConfig', async () => {

    fs.writeFileSync(path.join(__dirname, 'custom.config.json'), JSON.stringify({
      test: 'kites:custom'
    }));

    let kites = engine({
      appDirectory: __dirname,
      configFile: path.join(__dirname, 'custom.config.json'),
      loadConfig: true
    });

    let app = await kites.init();
    expect(app.options.test).eq('kites:custom');
  });

  it('should throws error when configFile not found and loadConfig', async () => {

    let kites = engine({
      appDirectory: __dirname,
      configFile: path.join(__dirname, 'custom.config.json'),
      loadConfig: true
    });

    try {
      await kites.init();
    } catch (err) {
      expect(/custom.config.json was not found.$/.test(err)).eq(true);
    }
  });

});

describe('kites load env options', () => {
  it('should parse env options into kites options when loadConfig', async () => {
    process.env.httpPort = '3000';
    process.env.NODE_ENV = 'kites';

    let kites = engine({
      appDirectory: __dirname,
      loadConfig: true
    });

    let app = await kites.init();
    expect(app.options.httpPort).eq('3000');
    expect(app.options.env).eq('kites');
  });

  it('should use options provided when loadConfig', async () => {
    delete process.env.httpPort;
    process.env.NODE_ENV = 'kites';

    const app = new KitesInstance({
      appDirectory: __dirname,
      httpPort: 4000,
      loadConfig: true
    });

    await app.init();
    expect(app.options.httpPort).eq(4000);
    expect(app.options.env).eq('kites');
  });
});

describe('kites utilities', () => {
  it('should access app path', () => {
    let app = new KitesInstance();
    expect(app.rootDirectory).eq(process.cwd());
    expect(app.appDirectory).eq(appRoot.toString());
  });
});
