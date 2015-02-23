'use strict';

var IP = module.exports = function IP(contents, owner) {
  this.NORMAL = 0;
  this.OPEN = 1;
  this.CLOSE = 2;
  this.owner = null;
  this.type = this.NORMAL;  
  this.contents = contents;
  // can either be a Process or an IIPConnection
  this.owner = owner;
};
  
IP.createBracket = function(bktType, x) {
  if (x == undefined) {
    x = null;
  }
  var ip = new IP(x);    
  ip.type = bktType;     
  var proc = Fiber.current.fbpProc;
  if (tracing) {
    //console.log(proc.name + ' Create bracket with ' + bktType + ', ' + x);
  }
  proc.ownedIPs++;
  ip.owner = proc;   
  return ip;
};