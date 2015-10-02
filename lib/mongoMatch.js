var async = require('async');

var MongoMatch = function(config, schemas){

  var self = this,
      sync = {};

  self.schemas = schemas;

  self.config = config;

  self.timer = 0;

  self.local = require('./mongo')(config.local, schemas);
  self.remote = require('./mongo')(config.remote, schemas);

  /**
   * Move data from remote to local
   * @param schema
   * @param options
   * @param done
   */
  sync.local = function(schema, options, done){

    self.remote.model(schema).find(options, function(err, res){

      console.log('found',schema, err, res && res.length);
      if( err || !res ){
        console.log('No '+schema+' from production ', err);
        return done();
      }
      async.eachSeries(res, function(game, callback){
        self.local.model(schema).update({_id : game._id}, game, { upsert : true }, function(err, res){

          if( err ) console.log('Unable to update local ' + schema, err);
          callback();
        });
      }, done);
    });
  }

  /**
   * Move data from remote to local
   * @param schema
   * @param options
   * @param done
   */
  sync.remote = function(schema, options, done){

    self.local.model(schema).find(options, function(err, res){

      console.log('found',schema, err, res && res.length);
      if( err || !res ){
        console.log('No '+schema+' from production ', err);
        return done();
      }
      async.eachSeries(res, function(game, callback){
        self.remote.model(schema).update({_id : game._id}, game, { upsert : true }, function(err, res){

          if( err ) console.log('Unable to update local ' + schema, err);
          callback();
        });
      }, done);
    });
  }

  /**
   * Update (sync) the dbs
   *
   * @param server - local, remote
   * @param options - some constraint on the query
   * @param schema - a subset or a single schema
   */
  self.update = function(server, options, schema){

    if( !options ) options = {};

    if( schema && !Array.isArray(schema) )
      schema = [schema];

    self.emit('start', options);

    async.eachSeries(schema || self.schemas, function(schema, callback){

      sync['server'](schema, options, function(){

        // update sync time
        //self.mongo.model('MongoMatch').update();

        console.log('finished syncing from production');
        self.timer = setTimeout(function(){
          // get date from MongoMatch collection
          var d;
          //var d = new Date( Date.now() - interval - 1000 );
          self.update({modified : {$gte : d }});
        }, self.config.interval ); // 5 minute default
      });
    }, function(){
      self.emit('end');
    });
  }
  // sync instantly on startup
  self.update('remote');
  self.update('local');
};
MongoMatch.prototype.MongoMatch = MongoMatch;

var EventEmitter = require('events').EventEmitter;
util.inherits(MongoMatch, EventEmitter);

module.exports = new MongoMatch();