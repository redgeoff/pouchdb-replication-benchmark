'use strict';

var PouchDB = require('pouchdb');
var replicationStream = require('pouchdb-replication-stream');
var fs = require('fs');

PouchDB.plugin(replicationStream.plugin);
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream);

describe('pouchdb', function () {

  this.timeout(5000);

  it('load', function () {
    var db = new PouchDB('http://localhost:5984/todos');
    var rs = fs.createReadStream('dump.txt');
    return db.load(rs);
  });

});
