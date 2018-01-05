var _ = require('lodash');
var path = require('path');
var Promise = require('bluebird');
var locationCache = require('./locationCache');

var _availableExtensionsCache;
module.exports = function (config) {
  config.logger.info('Searching for available extensions in ' + config.rootDirectory)

  if (config.cacheAvailableExtensions && _availableExtensionsCache) {
    config.logger.info('Loading extensions from cache ' + _availableExtensionsCache.length)
    return Promise.resolve(_availableExtensionsCache)
  }

  return locationCache.get(config).then(function (results) {
    config.logger.info('Found ' + results.length + ' extensions')
    var availableExtensions = results.map(function (configFile) {
      return _.extend({ directory: path.dirname(configFile) }, require(configFile))
    })

    _availableExtensionsCache = availableExtensions
    return locationCache.save(availableExtensions, config).then(function () {
      return availableExtensions
    })
  })
}
