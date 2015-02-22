'use strict';

var Promise = require('bluebird');

module.exports = Promise.coroutine(function *delay(proc) {
  var inport = proc.openInputPort('IN');
  var intvlport = proc.openInputPort('INTVL');
  var outport = proc.openOutputPort('OUT');
  
  var intervalIP = yield intvlport.receive();
  var interval = parseInt(intervalIP.contents);
  
  var delays = [];  
  var ip;
  while ((ip = yield inport.receive()) !== null) {
    // wrap ip in a function call, so its reference won't be set to the last one
    // set to ip
    (function (_ip) {
      delays.push(Promise.delay(interval).then(function () {
        outport.send(_ip);
      }));
    })(ip);
  }
  Promise.all(delays).then(function () {
    outport.end();
  });
});