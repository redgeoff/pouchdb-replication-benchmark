'use strict';

var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();

var benchmark = require('./benchmark');

describe('pouchdb', function () {

  this.timeout(60000000);

  benchmark('couchdb-local.dev');

  benchmark('couchdb-remote.dev');

});
