var MongoMatch = function(config, schemas){

  var self = this;

  self.schemas = schemas;

  self.local = require('./mongo')(config.local, schemas);
  self.remote = require('./mongo')(config.remote, schemas);

  function sync(schema, options, done){

    schema.find(options, function(err, res){
      console.log('found games', err, res && res.length);
      if( err || !res ){
        console.log('No TeamGames from production ', err);
        return done();
      }
      async.eachSeries(res, function(game, callback){
        schema.update({_id : game._id}, game, { upsert : true }, function(err, res){

          if( err ) console.log('Unable to update local team game stats ', err);
          callback();
        });
      }, done);
    });
  }

  self.update = function(options){

    if( !options ) options = {};

    self.emit('start', options);

    sync(schema, options, function(){

      // update sync time
      //self.mongo.model('MongoMatch').update();

      console.log('finished syncing from production');
      setTimeout(function(){
        var d = new Date( Date.now() - interval - 1000 );
        update({modified : {$gte : d }});
      }, interval); // 5 minute default
    });
  }

  // sync instantly on startup
  self.update();

};
MongoMatch.prototype.MongoMatch = MongoMatch;

var EventEmitter = require('events').EventEmitter;
util.inherits(MongoMatch, EventEmitter);

module.exports = new MongoMatch();