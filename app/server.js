#!/usr/bin/env node

'use strict';

var HTTP_PORT = 8001;

var http_server = require('http-server');
var fs = require('fs');
var indexfile = './index.js';
var dotfile = './.bundle.js';
var outfile = './bundle.js';
var watchify = require('watchify');
var browserify = require('browserify');

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
  http_server.createServer().listen(HTTP_PORT);
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
