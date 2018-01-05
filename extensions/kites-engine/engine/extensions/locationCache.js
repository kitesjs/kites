var os = require('os');
var path = require('path');
var Promise = require('bluebird');
var fsUtil = require('../util/fs');

var mkdirp = Promise.promisify(require('mkdirp'));
var fs = Promise.promisifyAll(require('fs'));

var pathToLocationCache;

module.exports.get = function (config) {
  var tempDirectory = config.tempDirectory || os.tmpdir();
  pathToLocationCache = path.join(tempDirectory, 'extensions', 'locations.json');

  if (config.mode === 'kites-development' || config.extensionsLocationCache === false) {
    config.logger.info('Skipping extensions location cache when NODE_ENV=kites-development or when option extensionsLocationCache === false, crawling now')

    return Promise.resolve().then(function () {
      return fsUtil.walkSync(config.rootDirectory, 'kites.config.js')
    })
  }

  return fs.statAsync(pathToLocationCache)
    .then(function () {
      return fs.readFileAsync(pathToLocationCache, 'utf8')
        .then(function (content) {
          var cache = JSON.parse(content)[path.join(__dirname, '../../../')]

          if (!cache) {
            config.logger.info('Extensions location cache doesn\'t contain entry yet, crawling')
            return fsUtil.walkSync(config.rootDirectory, 'kites.config.js')
          }

          return fs.statAsync(path.join(__dirname, '../../../')).then(function (stat) {
            if (stat.mtime.getTime() > cache.lastSync) {
              config.logger.info('Extensions location cache ' + pathToLocationCache + ' contains older information, crawling')
              return fsUtil.walkSync(config.rootDirectory, 'kites.config.js')
            }

            return Promise.all(cache.locations.map(function (l) {
              return fs.statAsync(l)
            })).then(function () {
              config.logger.info('Extensions location cache contains up to date information, skipping crawling in ' + path.join(__dirname, '../../../'))
              var directories = fsUtil.walkSync(config.rootDirectory, 'kites.config.js', path.join(__dirname, '../../../'))
              var result = directories.concat(cache.locations)

              return result
            })
          })
        })
    }).catch(function (e) {
      config.logger.info('Extensions location cache not found, crawling directories')
      return fsUtil.walkSync(config.rootDirectory, 'kites.config.js')
    })
}

module.exports.save = function (extensions, config) {
  var directories = extensions.map(function (e) {
    return path.join(e.directory, 'kites.config.js')
  }).filter(function (d) {
    return d.indexOf(path.join(__dirname, '../../../')) !== -1
  })

  var tempDirectory = config.tempDirectory || os.tmpdir();
  return mkdirp(path.join(tempDirectory, 'extensions')).then(function () {
    return fs.statAsync(pathToLocationCache).catch(function () {
      return fs.writeFileAsync(pathToLocationCache, JSON.stringify({}), 'utf8')
    })
  }).then(function () {
    return fs.readFileAsync(pathToLocationCache, 'utf8').then(function (content) {
      var nodes = {}
      try {
        nodes = JSON.parse(content)
      } catch (e) {
        // file is corrupted, nevermind and override all
      }

      nodes[path.join(__dirname, '../../../')] = {
        locations: directories,
        lastSync: new Date().getTime()
      }

      config.logger.debug('Writing extension locations cache to ' + pathToLocationCache)
      return fs.writeFileAsync(pathToLocationCache, JSON.stringify(nodes), 'utf8')
    })
  })
}
