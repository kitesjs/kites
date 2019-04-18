import _fs from 'fs';
import _mkdirp from 'mkdirp';
import os from 'os';
import path from 'path';
import {promisify} from 'util';

import { IDiscoverOptions } from './discover';
import { KitesExtention } from './extensions';
import { walkSync } from './fs';

const mkdirp = promisify(_mkdirp);
const stat = promisify(_fs.stat);
const readFile = promisify(_fs.readFile);
const writeFile = promisify(_fs.writeFile);

const KITES_CONFIG_FILE = 'kites.config.js';
// var pathToLocationCache:string;

export async function get(config: IDiscoverOptions) {
    let tempDirectory = config.tempDirectory || os.tmpdir();
    let pathToLocationCache = path.join(tempDirectory, 'extensions', 'locations.json');

    if (config.mode === 'kites-development' || config.extensionsLocationCache === false) {
        config.logger.info('Skipping extensions location cache when NODE_ENV=kites-development or when option extensionsLocationCache === false, crawling now');
        return walkSync(config.rootDirectory, KITES_CONFIG_FILE);
    }

    try {
        // get file status
        await stat(pathToLocationCache);
        // read file content
        let content = await readFile(pathToLocationCache, 'utf-8');
        let json = JSON.parse(content);
        let location = path.join(__dirname, '../../../');
        let cache = json[location];

        if (!cache) {
            config.logger.info('Extensions location cache doesn\'t contain entry yet, crawling');
            return walkSync(config.rootDirectory, KITES_CONFIG_FILE);
        }

        let extensionInfo = await stat(location);
        if (extensionInfo.mtime.getTime() > cache.lastSync) {
            config.logger.info('Extensions location cache ' + pathToLocationCache + ' contains older information, crawling');
            return walkSync(config.rootDirectory, KITES_CONFIG_FILE);
        }

        // return cached
        await Promise.all(cache.locations.map((dir: string) => stat(dir)));
        config.logger.info('Extensions location cache contains up to date information, skipping crawling in ' + config.rootDirectory);

        let directories = walkSync(config.rootDirectory, KITES_CONFIG_FILE, location);
        let result = directories.concat(cache.locations);
        return result;
    } catch (err) {
        config.logger.info('Extensions location cache not found, crawling directories');
        return walkSync(config.rootDirectory, KITES_CONFIG_FILE);
    }
}

export async function save(extensions: KitesExtention[], config: IDiscoverOptions) {
    let location = path.join(__dirname, '../../../');
    let directories = extensions
        .map(x => path.join(x.directory + '', KITES_CONFIG_FILE))
        .filter(x => x.indexOf(location) > -1);

    let tempDirectory = config.tempDirectory || os.tmpdir();
    let pathToLocationCache = path.join(tempDirectory, 'extensions');
    let fileToLocationCache = path.join(pathToLocationCache, 'locations.json');
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

    nodes[location] = {
        lastSync: new Date().getTime(),
        locations: directories
    };

    await writeFile(fileToLocationCache, JSON.stringify(nodes), 'utf-8');
    config.logger.info('Writing extension locations cache to ' + fileToLocationCache + ' done!');
}
