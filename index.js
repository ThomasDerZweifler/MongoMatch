/**
 *
 * @param {Object} config - connection and interval information
 * @param {Number} config.interval - how often to sync the databases in minutes
 *
 * @param {Object} config.local - local mongo database
 * @param {String} config.local.mongo_uri - local mongo connection string
 * @param {Number} config.local.interval - how often to sync local data to remote (overrides config.interval)
 *
 * @param {Object} config.remote - remote mongo database
 * @param {String} config.remote.mongo_uri - remote mongo connection string
 * @param {Number} config.remote.interval - how often to sync remote data to local (overrides config.interval)
 *
 * @param {Array} schemas - Mongo schemas to sync. List of collection names
 *
 * @returns {{mongo}|*}
 */
module.exports = function(config, schemas){

  return require('./lib/mongoMatch')(config, schemas);
};

