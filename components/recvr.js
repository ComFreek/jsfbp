'use strict';

var InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
  , Promise = require('bluebird');

module.exports = Promise.coroutine(function *() {
  var inport = InputPort.openInputPort('IN');
  
  var ip = yield inport.receive();
  IP.drop(ip);
  console.log('RECVR DATA: ' + ip.contents);
});