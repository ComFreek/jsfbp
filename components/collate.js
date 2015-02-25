'use strict';

var Promise = require('bluebird');

module.exports = Promise.coroutine(function *(proc) {
  var ctlfields = proc.openInputPort('CTLFIELDS');
  var inportArray = proc.openInputPortArray('IN');
  var outport = proc.openOutputPort('OUT');

  var ctlfieldsP = yield ctlfields.receive();
  proc.dropIP(ctlfieldsP);

  var fields = ctlfieldsP.contents.split(',').map(function(str) { return parseInt(str); });
  var totalFieldLength = fields.reduce(function(acc, n) { return acc + n; }, 0);

  var portCount = inportArray.length;
  var ips = [];
  
  for (var index=0; index<inportArray.length; index++) {
    ips[index] = yield inportArray[index].receive();
    if (ips[index] === null) {
      portCount--;
    }
  }

  while (portCount) {
    var lowestIndex = 0;
    var lowestKey = "\uffff";
    ips.forEach(function(ip, portIndex) {
      if (ip !== null) {
        var key = ip.contents.substring(0, totalFieldLength);
        if (key < lowestKey) {
          lowestKey = key;
          lowestIndex = portIndex;
        }
      }
    });

    outport.send(ips[lowestIndex]);

    ips[lowestIndex] = yield inportArray[lowestIndex].receive();
    if (ips[lowestIndex] === null) {
      portCount--;
    }
  }
  
  outport.end();
});