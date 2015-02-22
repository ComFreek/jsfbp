'use strict';

var Promise = require('bluebird');

module.exports = Promise.coroutine(function *(proc) {
  var inport = proc.openInputPort('IN');
  var outport = proc.openOutputPort('OUT');
  
  var ip;
  while ((ip = yield inport.receive()) !== null) {
    outport.send(ip);
  }
  outport.end();
});