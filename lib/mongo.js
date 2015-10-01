var uuid = require('uuid');

/**
 * Only used if you're saving data using the schemas on the connections created here.
 * use uuid to avoid conflicts when syncing data created across 2 or more databases
 *
 * @param schema
 */
function mongoose_uuid(schema) {

  schema.add({
    _id: {type: String, index: {unique: true}}
  });
  schema.pre('save', function(next) {
    if(!this.isNew || this._id) return next();

    this._id = uuid.v1();
    return next();
  });
}

module.exports = function(config, schemas){

  var self = {};
  var mongoose = require('mongoose');

  var connect = mongoose.createConnection(config.mongo_uri, {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
  });

  var Schema = mongoose.Schema;

  var MongoMatch = new Schema({
    server : String,
    modified : { type : Date, default : Date.now}
  }, {_id: false, collection: 'MongoMatch'});
  MongoMatch.plugin(mongoose_uuid);
  connect.model('MongoMatch', MongoMatch);

  /**
   * build the schemas from the schemas list
   */
  schemas.forEach(function(scheme){

    self[scheme] = new Schema({
    }, {_id: false, strict:false, collection: scheme});
    self[scheme].plugin(mongoose_uuid);

    connect.model(scheme, self[scheme]);
  });

  return connect;
};