'use strict';

var Promise = require('bluebird');

module.exports = Promise.coroutine(function *(proc) {
  var inport = proc.openInputPort('IN');
  
  var ip;
  while ((ip = yield inport.receive()) !== null) {
    proc.dropIP(ip);
  }
});