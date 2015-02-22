'use strict';

var Enum = require('./utils').Enum
  , IIPConnection = require('./IIPConnection')
  , IP = require('./IP')
  , Promise = require('bluebird');

var Process = module.exports = function(name, func) {
  this.name = name;
  this.func = func;
  this.fiber = null;
  this.inports = [];
  this.outports = [];
  this.status = Process.Status.NOT_INITIALIZED;  
  this.ownedIPs = 0; 
  this.cbpending = false;
  this.yielded = false; 
  this.result = null; // [data, err]
};

Process.Status = Enum([
  'NOT_INITIALIZED',
  'ACTIVE', // (includes waiting on callback ...)
  'WAITING_TO_RECEIVE',
  'WAITING_TO_SEND',
  'READY_TO_EXECUTE',
  'DORMANT',
  'CLOSED'
]);

Process.prototype.getStatusString = function () {
  return Process.Status.__lookup(this.status);
};

Process.prototype.openInputPort = function (name) {
  var namex = this.name + '.' + name;  
  for (var i = 0; i < this.inports.length; i++) {    
    if (this.inports[i][0] == namex) {
      return this.inports[i][1];
    }
  }
  console.log('Port ' + this.name + '.' + name + ' not found');
  return null;
};

Process.prototype.getIIPContents = function (name) {
  var iipPort = this.openInputPort(name);
  
  var self = this;
  return iipPort.receive().then(function (ip) {
    var data = ip.contents;
    self.dropIP(ip)
    return data;
  });
};

Process.prototype.openOutputPort = function(name) {
  var namex = this.name + '.' + name;
  for (var i = 0; i < this.outports.length; i++) {
    if (this.outports[i][0] == namex) {
      return this.outports[i][1];  // return conn
    }
  }
  console.log('Port ' + this.name + '.' + name + ' not found');
  return null;
};

Process.prototype.createIP = function(contents) {
  var ip = new IP(contents);
  this.ownedIPs++;
  ip.owner = this;
  return ip;
};

Process.prototype.dropIP = function (ip) {
  /*if (ip.owner != this && !(ip.owner instanceof IIPConnection)) {
    throw ip.owner;
    throw "Attempt to drop IP from a foreign process";
  }*/
  this.ownedIPs--;
  ip.owner = null;
}