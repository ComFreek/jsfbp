'use strict';

var IIPConnection = require('../../IIPConnection')
  , Process = require('../../Process')
  , Promise = require('bluebird');

var PromiseStreamRuntime = module.exports = function() {
};

PromiseStreamRuntime.prototype.run = function (processes, options, callback) {
  var processPromises = processes.map(function (process) {
    return process.func(process);
  });

  Promise.all(processPromises).then(function() {
    callback();
  }).done();
};