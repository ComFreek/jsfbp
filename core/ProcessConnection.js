'use strict';

var Connection = require('./Connection')
  , util = require('util')
  , Promise = require('bluebird')
  , Duplex = require('stream').Duplex;

var ProcessConnection = module.exports = function(size) {  
  Duplex.call(this, {objectMode: true});
  
  this.closed = false;
  this.name = null;
  this.nxtget = 0;
  this.nxtput = 0; 
  this.down = null;  // downstream process
  this.usedslots = 0;
  this.array = [];
  this.up = [];    // list of upstream processes
  this.upstreamProcsUnclosed = 0;
  for (var i = 0; i < size; i++) {
    this.array[i] = null;
  }
  
  var self = this;
  this.on('finish', function () {
    //console.log("Ended ProcessConnection");
    // End InputPort
    self.push(null);
  });
};

util.inherits(ProcessConnection, Duplex);

ProcessConnection.prototype._write = function(chunk, encoding, callback) {
  this.push(chunk, encoding);
  if (chunk !== null) {
    //console.log("Pushed " + chunk.contents + " through ProcessConnection");
  }
  callback();
};

// Empty because we automatically push
// once something is written to us using ProcessConnection#write.
// See ProcessConnection#_write
ProcessConnection.prototype._read = function() {};