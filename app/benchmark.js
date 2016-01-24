'use strict';

var DOCS = 10000;

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-load'));

module.exports = function (host) {

  describe('benchmark ' + host, function () {

    var db = null,
      from = null,
      to = null,
      remoteCouch = 'http://' + host + ':5984/todos',
      changes = null;

    var syncError = function (err) {
      console.log('sync error=', err);
    };

    var startSyncing = function () {

      changes = db.changes({
        since: 'now',
        live: true,
        include_docs: true,
        batch_size: 100
      }).on('error', function (err) {
        console.log('changes err=', err);
      });

      var opts = { live: true, batch_size: 100 };

      to = db.replicate.to(remoteCouch, opts, syncError);
      from = db.replicate.from(remoteCouch, opts, syncError);

    };

    beforeEach(function () {
      db = new PouchDB('todos');
    });

    afterEach(function () {
      // Destroy the local DB
      return db.destroy();
    });

    it('initial replication of 10,000 docs via native pouch api', function (done) {
      startSyncing();

      var i = 1;
      changes.on('change', function (change) {
        if (i++ === DOCS) { // done reading all docs?
          done();
        }
      });
    });

    it('initial replication of 10,000 docs via pouchdb-load', function () {
      return db.load('http://' + host + ':8001/dump.txt');
    });

  });

};
