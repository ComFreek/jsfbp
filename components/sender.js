'use strict';

var Promise = require('bluebird');

module.exports = Promise.coroutine(function *(proc) {
  var count = yield proc.getIIPContents('COUNT');
  var outport = proc.openOutputPort('OUT');

  for (var i=0; i<count; i++) {
    var ip = proc.createIP(i);
    outport.send(ip);
  }
  console.log("SEND END!");
  outport.end();
});