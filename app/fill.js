'use strict';

var PouchDB = require('pouchdb'),
  Promise = require('bluebird');

describe('pouchdb', function () {

// 3162692ms
  this.timeout(6000000);

  // NOTE: we split the write operations into batches so that we don't bog down the process with
  // tons of promises. In addition, the updates are processed sequentially so that we can prevent
  // conflicts.

  var db = new PouchDB('http://localhost:5984/todos');

  var DOCS = 10000;
  var UPDATES_PER_DOC = 100;

// TODO: bump to 100?
  var BATCH_SIZE = 10;
  var BATCHES = DOCS/BATCH_SIZE;

  var create = function () {
    return db.post({
      thing: 'write0'
    });
  };

  var update = function (id, rev, i) {
    return db.put({
      _id: id,
      _rev: rev, // populate the rev so that we don't have to do a look up before each update
      thing: 'write' + i
    }).then(function (response) {
      // Need to wait until change is recorded by CouchDB or else we can have a conflict
      return response.rev;
    });
  };

  var updateFactory = function (id, rev, i) {
    // Need to use a promise factory when sequentially chaining promises
    return function (_rev) {
      // console.log('id=', id, '_rev=', _rev, 'i=', i);
      return update(id, _rev ? _rev : rev, i);
    };
  };

  var updateMany = function (id, rev) {
    var chain = Promise.resolve();

    // NOTE: the updates have to be done sequentially or else we could generate conflicts
    for (var i = 1; i <= UPDATES_PER_DOC; i++) {
      // Create new instance for this iteration so that updateFactory doesn't share the same i
      var j = i + 0;
      chain = chain.then(updateFactory(id, rev, j));
    }

    return chain;
  };

  var createAndThenUpdate = function () {
    return create().then(function (response) {
      return updateMany(response.id, response.rev);
    });
  };

  var createAndUpdateManyBatch = function () {
    var promises = [];

    for (var i = 0; i < BATCH_SIZE; i++) {
      promises.push(createAndThenUpdate());
    }

    return Promise.all(promises);
  };

  var createAndUpdateManyBatchFactory = function () {
    // Need to use a promise factory when sequentially chaining promises
    return function () {
      return createAndUpdateManyBatch();
    };
  };

  var createAndUpdateMany = function () {
    var chain = Promise.resolve();

    for (var i = 0; i < BATCHES; i++) {
      chain = chain.then(createAndUpdateManyBatchFactory());
    }

    return chain;
  };

  it('fill', function () {
    return createAndUpdateMany();
  });

});
