'use strict';

var IP = require('../core/IP')
  , Promise = require('bluebird');

module.exports = Promise.coroutine(function *(proc) {
  var inport = proc.openInputPort('IN');
  var interval = yield proc.getIIPContents('INTVL');
  var outport = proc.openOutputPort('OUT');
  
  var delays = [];  
  var ip;
  while ((ip = yield inport.receive()) !== null) {
    // wrap ip in a function call, so its reference won't be set to the last one
    // set to ip
    (function (_ip, _interval) {
      delays.push(Promise.delay(_interval).then(function () {
        outport.send(_ip);
      }));
    })(ip, Math.random() * interval);
  }
  Promise.all(delays).then(function () {
    outport.end();
  });
});