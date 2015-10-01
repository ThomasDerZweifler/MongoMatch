# MongoSync

> Experimental. I use it, it works. Use it at your own risk and test!

Keep two mongo databases in sync - with stipulations :)

 - databases should use uuid ids and not the default mongo ObjectID
 - sync happens at intervals no less than 1 minute
 - assumes the "remote" database is the (main) master. There is no voting on collisions. Remote wins always

### Why would I need this?

You want to keep a local copy, or separate, copy of a mongo database that you need to sync occasionally
and automatically with another instance of mongo.

You need to sync both new and changed data across databases. Mongodump/ mongorestore is insufficient because it
only handles inserts and not updates/upserts.

You need master-master replication or need to write to an instance with no network connection and have it sync
up when it can.


# Usage


** Basic Example **

```
var config = {
  interval : 5,
  local : {
    mongo_uri : 'mongodb://127.0.0.1/test'
  },
  remote : {
    mongo_uri : 'mongodb://127.0.0.1/test'
  }
};

var schemas = [
  'Users',
  'Accounts',
  'Pages'
];

var MongoMatch = require('mongomatch')(config, schemas);
```
