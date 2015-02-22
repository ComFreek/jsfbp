'use strict';
var ProcessStatus = require('./Process').Status
  , util = require('util')
  , Writable = require('stream').Writable;

var OutputPort = module.exports = function(array){
  Writable.call(this, {objectMode: true});
  this.name = null;
  this.conn = null;  
  this.closed = false;
  this.array = [];
  var self = this;
  this.on('finish', function () {
    console.log("Output Port ended!!!");
    self.conn.end();
  });
};

util.inherits(OutputPort, Writable);

OutputPort.prototype._write = function(chunk, encoding, callback) {
  // TODO should be pass callback forth to conn.write()?
  
  // The encoding could theoretically be ignored because we are in objectMode
  this.conn.write(chunk, encoding);
  callback();
};

OutputPort.prototype.send = function(ip) {
  if (ip !== null) {
    console.log("Pushed " + ip.contents + " through OutputPort");
  }
  this.write(ip);
};

OutputPort.prototype.setRuntime = function(runtime) {
  this._runtime = runtime;
};