'use strict';

var Connection = require('./Connection')
  , IP = require('./IP')
  , Readable = require('stream').Readable
  , util = require('util');

var IIPConnection = module.exports = function(data) {
  Readable.call(this, {objectMode: true});
  this.contents = data;
  this.closed = false;
  this.push(new IP(data, this));
  this.push(null);
};

util.inherits(IIPConnection, Readable);

// Empty because the constructor automatically
// pushes the data passed to it.
IIPConnection.prototype._read = function() {};