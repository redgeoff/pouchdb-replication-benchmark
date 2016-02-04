#!/usr/bin/env node

'use strict';

var HTTP_PORT = 8001;

var fs = require('fs');
var indexfile = './index.js';
var dotfile = './.bundle.js';
var outfile = './bundle.js';
var watchify = require('watchify');
var browserify = require('browserify');

var express = require('express');
var app = express();

var repStream = require('express-pouchdb-replication-stream');

var useWatchify = true;

var b = browserify(indexfile, {
  cache: {},
  packageCache: {},
  fullPaths: true,
  debug: true
});

var filesWritten = false;
var serverStarted = false;
var readyCallback;

function bundle() {
  var wb = (useWatchify ? w.bundle() : b.bundle());
  wb.on('error', function (err) {
    console.error(String(err));
  });
  wb.on('end', end);
  wb.pipe(fs.createWriteStream(dotfile));

  function end() {
    fs.rename(dotfile, outfile, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log('Updated:', outfile);
      filesWritten = true;
      checkReady();
    });
  }
}

if (useWatchify) {
  var w = watchify(b);
  w.on('update', bundle);
}

bundle();

function startServers(callback) {
  readyCallback = callback;

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://couchdb-local.dev:8001");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

  // Use express-pouchdb-replication-stream to speed up the initial replication. This will no longer
  // be needed with CouchDB 2.0 as CouchDB 2.0 contains the bulk_get API, which greatly speeds up
  // the initial replication.
  app.use('/api/couchdb/:db', repStream({
    url     : 'http://localhost:5984/',
    dbReq   : true
  }));

  app.use(express.static('.'));

  app.listen(HTTP_PORT, function () {
    console.log('Listening on port ' + HTTP_PORT + '!');
  });

  console.log('Tests: http://couchdb-local.dev:' + HTTP_PORT + '/index.html');
  serverStarted = true;
  checkReady();
}

function checkReady() {
  if (filesWritten && serverStarted && readyCallback) {
    readyCallback();
  }
}

if (require.main === module) {
  startServers();
} else {
  module.exports.start = startServers;
}
