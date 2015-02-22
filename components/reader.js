'use strict';

var Fiber = require('fibers')
  , fs = require('fs')
  , InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
	, OutputPort = require('../core/OutputPort'),
  , Promise = require('bluebird');

// Reader based on Bruno Jouhier's code
module.exports = Promise.coroutine(function *(proc) {
  var inport = proc.openInputPort('FILE');
  
  var ip, promises = [];
  
  while ((ip = yield inport.receive()) !== null) {
    var filename = ip.contents;
    proc.dropIP(ip);
    
    readFile(filename, "utf8").then(function (fileContents) {
      var fileContentsIP = proc.createIP(fileContents);
      outport.send(fileContentsIP);
    });
  }
  
  Promise.all(promises).then(function () {
    outport.end();
  });
};

function readFile(filename, encoding) {
  return Promise.fromNode(function(callback) {
    fs.readFile(filename, encoding, callback);
  });
}