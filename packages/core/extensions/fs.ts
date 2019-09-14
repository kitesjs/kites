import * as fs from 'fs';
import * as path from 'path';
import { getDebugLogger } from '../logger';

const logger = getDebugLogger('kites:discover:fs', { level: 'debug' });

/**
 * Delete file and folder
 * @param pathToDelete path to delete
 */
export function deleteFiles(pathToDelete: string) {
  try {
    let files = fs.readdirSync(pathToDelete);
    files.forEach(fn => {
      let filePath = pathToDelete + '/' + fn;
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      } else {
        deleteFiles(filePath);
      }
    });
    // remove current dir
    fs.rmdirSync(pathToDelete);
  } catch (err) {
    return;
  }
}

/**
 * Walk and find files by filename or regex
 *
 * @param rootPath
 * @param fileName template for searching
 * @param exclude template to exclude
 */
export function walkSync(rootPath: string, fileName: string, exclude?: string | RegExp): string[] {
  let results: string[] = [];
  let queue: string[] = [];
  let next: string | undefined = rootPath;

  function dirname(fn: string) {
    let parts = path.dirname(fn).split(path.sep);
    return parts[parts.length - 1];
  }

  while (next) {
    let list: string[];
    try {
      list = fs.readdirSync(next);
    } catch (err) {
      // no permissions to read folder for example
      // just skip it
      list = [];
    }
    list.forEach((it) => {
      let item = path.join(next as string, it);
      if (item.indexOf(exclude as string) > -1) {
        return;
      }

      try {
        if (fs.statSync(item).isDirectory()) {
          queue.push(item);
        }
      } catch (err) {
        // do nothing if cannot get directory info
      }

      if (it === fileName) {
        let extensionsDirectoryName = dirname(item);
        let alreadyListedConfig = results.filter((fn) => extensionsDirectoryName === dirname(fn));
        if (!alreadyListedConfig.length) {
          results.push(item);
        }
      }
    });
    next = queue.shift();
  }

  return results;
}

/**
 * Discovery file list with depth level
 * @param dirname Folder to scan extensions
 * @param filename Pattern for searching
 * @param depth max level to discover
 * @param exclude pattern to exclude searching
 */
export function walkSyncLevel(dirname: string[], filename: string, depth: number = 2, exclude?: string) {
  logger.info('Start searching: ' + dirname);

  function readFiles(candidate: string, level: number): string[] {
    logger.debug('Find in: ' + candidate);

    let results: string[] = [];
    let list: string[];
    try {
      list = fs.readdirSync(candidate);
    } catch (err) {
      // no permissions to read folder for example
      // just skip it
      list = [];
    }

    for (const item of list) {
      let fullname = path.join(candidate, item);
      if (fullname.indexOf(exclude as string) < 0) {
        if (fs.statSync(fullname).isDirectory()) {
          if (level < depth) {
            const next = readFiles(fullname, level + 1);
            results = results.concat(next);
          }
        } else if (item === filename) {
          results.push(fullname);
        }
      }
    }

    return results;
  }

  let vResults = [];
  for (const item of dirname) {
    vResults = vResults.concat(readFiles(item, 0));
  }

  return vResults;
}
