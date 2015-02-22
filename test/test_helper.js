'use strict';

var chai = require('chai');

var InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
  , Promise = require('bluebird')
  , OutputPort = require('../core/OutputPort');

global.expect = chai.expect;

global.MockSender = function(inputArray) {
  return Promise.coroutine(function *(proc) {
    var outport = proc.openOutputPort('OUT');
    inputArray.forEach(function(item) {
      outport.send(proc.createIP(item));
    });
    outport.end();
    console.log("MockSender ended");
  });
}

global.MockReceiver = function(outputArray, receiveCallback) {
  return Promise.coroutine(function *(proc) {
    var inport = proc.openInputPort('IN');
    var ip = null;

    if (typeof receiveCallback !== "function") {
      receiveCallback = function () {};
    }
    
    while ((ip = yield inport.receive()) !== null) {
      console.log("Received at MockReceiver");
      outputArray.push(ip.contents);
      receiveCallback(ip);
      proc.dropIP(ip);
    }
  });
};