import _fs from 'fs';
import mkdirp from 'mkdirp';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

import { IDiscoverOptions } from './discover';
import { KitesExtension } from './extensions';
import { walkSync, walkSyncLevel } from './fs';

// const mkdirp = promisify(_mkdirp);
const stat = promisify(_fs.stat);
const readFile = promisify(_fs.readFile);
const writeFile = promisify(_fs.writeFile);

const KITES_CONFIG_FILE = 'kites.config.js';

export async function get(config: IDiscoverOptions) {
  let tempDirectory = config.tempDirectory || os.tmpdir();
  let pathToLocationCache = path.join(tempDirectory, 'extensions', 'locations.json');

  if (config.env === 'development' || config.extensionsLocationCache === false) {
    config.logger.info('Skipping extensions location cache when NODE_ENV=development or when option extensionsLocationCache === false, crawling now!');
    return walkSyncLevel(config.directories, KITES_CONFIG_FILE, config.depth);
  }

  try {
    // get file status
    await stat(pathToLocationCache);
    // read file content
    let content = await readFile(pathToLocationCache, 'utf-8');
    let json = JSON.parse(content);
    let locations: string[] = [];

    for (const directory of config.directories) {
      let location = path.resolve(directory);
      let cache = json[location];
      let locationInfo = await stat(location);

      if (!cache) {
        config.logger.info('Extensions location cache doesn\'t contain entry yet, crawling');
        const result = walkSyncLevel([location], KITES_CONFIG_FILE, config.depth);
        locations = locations.concat(result);
      } else if (locationInfo.mtime.getTime() > cache.lastSync) {
        config.logger.info('Extensions location cache ' + pathToLocationCache + ' contains older information, crawling: ' + locationInfo.mtime.getTime());
        const result = walkSyncLevel([location], KITES_CONFIG_FILE, config.depth);
        locations = locations.concat(result);
      } else {
        // return cached
        await Promise.all(cache.locations.map((dir: string) => stat(dir)));
        config.logger.info('Extensions location cache contains up to date information, skipping crawling in: ' + directory);
        // get locations from cache
        locations = locations.concat(cache.locations);
      }
    }

    // Remove duplicates
    const vResult = new Set(locations);
    return Array.from(vResult);
  } catch (err) {
    config.logger.info('Extensions location cache not found, crawling directories');
    return walkSyncLevel(config.directories, KITES_CONFIG_FILE, config.depth);
  }
}

export async function save(extensions: KitesExtension[], config: IDiscoverOptions) {

  const caches = config.directories.reduce((cache, directory) => {
    let location = path.resolve(directory);
    let lastSync = new Date().getTime();
    let locations = extensions
      .map(x => path.join(x.directory + '', KITES_CONFIG_FILE))
      .filter(x => x.indexOf(location) > -1);
    // cache location
    cache[location] = { lastSync, locations };
    return cache;
  }, {});

  const tempDirectory = config.tempDirectory || os.tmpdir();
  const pathToLocationCache = path.join(tempDirectory, 'extensions');
  const fileToLocationCache = path.join(pathToLocationCache, 'locations.json');
  config.logger.info('Saving cache to location: ' + fileToLocationCache);

  await mkdirp(pathToLocationCache);
  await (stat(fileToLocationCache).catch(() => writeFile(fileToLocationCache, JSON.stringify({}), 'utf-8')));

  let content = await readFile(fileToLocationCache, 'utf-8');
  let nodes: any = {};
  try {
    nodes = JSON.parse(content);
  } catch (err) {
    // file is corrupted, nevermind and override all
  }

  // unique extension locations
  Object.assign(nodes, caches);

  await writeFile(fileToLocationCache, JSON.stringify(nodes), 'utf-8');
  config.logger.info('Writing extension locations cache to ' + fileToLocationCache + ' done!');
}
