'use strict';

var IP = require('./IP')
  , IIPConnection = require('./IIPConnection')
  , ProcessStatus = require('./Process').Status
  , util = require('util')
  , Promise = require('bluebird')
  , Readable = require('stream').Readable;

var InputPort = module.exports = function() {
  Readable.call(this, {objectMode: true});
  
  var self = this;
  this.ended = false;
};

util.inherits(InputPort, Readable);

InputPort.prototype.setConnection = function (conn) {
  if (this.conn) {
    throw "Resetting a connection is not possible yet!";
  }
  this.conn = conn;
  var self = this;
  this.conn.on('readable', function () {
    self._read();
  });
  this.conn.on('end', function () {
    self.ended = true;
    console.log("Connection ended, therefore ending InputPort as well");
    // Trigger end of InputPort's readable stream
    self.push(null);
  });
};

InputPort.prototype._read = function() {
  var ip = this.conn.read();
  if (ip !== null) {
    console.log("InputPort read from connection ", ip);
    this.push(ip);
  }
};

InputPort.prototype.receive = function() {
  var self = this;
  var data = this.read();

  // Directly resolve if data was instantly available
  if (data !== null) {
    return Promise.resolve(data);
  }
  
  // If we encountered an EOF while reading
  if (this.ended) {
    return Promise.resolve(null);
  }
  // Data could possibly exist, but isn't there yet
  else {
    return new Promise(function (resolve, reject) {
      self.once('readable', function () {
        console.log("Data now readable at InputPort");
        var ip = self.read();
        console.log("That data was:", ip);
        resolve(ip);
      });
      self.once('end', function () {
        resolve(null);
      });
    });
  }
};

InputPort.prototype.setRuntime = function(runtime) {
  this._runtime = runtime;
};

/*InputPort.prototype.close = function(){
  var proc = Fiber.current.fbpProc; 
  var conn = this.conn;
  conn.closed = true;
  console.log(proc.name + ': ' + conn.usedslots + ' IPs dropped because of close on ' + conn.name);
  while (true) {
    var ip = conn.array[conn.nxtget];
    conn.array[conn.nxtget] = null;
    conn.nxtget ++;
    if (conn.nxtget > conn.array.length - 1)
      conn.nxtget = 0; 
    conn.usedslots--;  
    if (conn.usedslots <= 0)
    break;  
  }
  for (var i = 0; i < conn.up.length; i ++) { 
    if (conn.up[i].status == ProcessStatus.WAITING_TO_SEND)
    this._runtime.pushToQueue(conn.up[i]); 
   }
};*/