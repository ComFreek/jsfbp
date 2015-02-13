'use strict';

/**
  * @module jsfbp/InputPort
  */

var IP = require('./IP')
  , Fiber = require('fibers')
  , ProcessStatus = require('./Process').Status
  , Utils = require('./utils');

/**
  * InputPort
  * @constructor
  * @param {array} queue - Process queue dependency
  */
var InputPort = module.exports = function(queue){
  /**
    * The port name
    * @member {string}
    * @default
    **/
  this.name = null;
  /**
    * The connection
    * @member {Connection}
    * @default
    */
  this.conn = null;
  /**
    * @member {boolean}
    * @default
    */
  this.closed = false;
  /**
    * Queue passed to the constructor
    * @member {array}
    * @deprecated
    */
	this.queue = queue;
};

/**
  * Opens a new input port
  * @param {string} name - The name of the port
  */
InputPort.openInputPort = function(name) {
  var proc = Fiber.current.fbpProc;
  var namex = proc.name + '.' + name;  
  //console.log(proc.inports);
  for (var i = 0; i < proc.inports.length; i++) {    
    if (proc.inports[i][0] == namex)
    return proc.inports[i][1];  // return inputport
  } 
  console.log('Port ' + proc.name + '.' + name + ' not found');
  return null;
};

InputPort.prototype.receive = function(){
  var proc = Fiber.current.fbpProc; 
  var conn = this.conn;
    
  if (conn.constructor == Utils.InitConn)  {
   if (tracing)
    console.log(proc.name + ' recv IIP from port ' + this.name + ': ' + conn.contents);
   //var ip = new exports.IP(conn + '');
   var ip = IP.create(conn.contents);
   conn.closed = true;
   ip.user = proc;
   //console.log(conn);
   return ip;
   }
   
  if (tracing)
   console.log(proc.name + ' recv from ' + this.name);
   
  while (true) {    
   if (conn.usedslots == 0){
    if (conn.closed)  {
   if (tracing)
    console.log(proc.name + ' recv EOS from ' + this.name );
   return null; 
   } 
    proc.status = ProcessStatus.WAITING_TO_RECEIVE;
    proc.yielded = true; 
    Fiber.yield();
    proc.status = ProcessStatus.ACTIVE;   
    proc.yielded = false;    
   }
   else
    break;
  }
  //if (conn.usedslots == conn.array.length) 
   for (var i = 0; i < conn.up.length; i ++) { 
    if (conn.up[i].status == ProcessStatus.WAITING_TO_SEND) {
    conn.up[i].status = ProcessStatus.READY_TO_EXECUTE; 
    this.queue.push(conn.up[i]); 
    }  
   }
      
  var ip = conn.array[conn.nxtget];
  conn.array[conn.nxtget] = null;
  conn.nxtget ++;
  if (conn.nxtget > conn.array.length - 1)
   conn.nxtget = 0;   
  if (tracing)
   console.log(proc.name + ' recv OK: ' + ip.contents); 
  conn.usedslots--;
  ip.owner = proc; 
  proc.ownedIPs++; 
  return ip; 
};


InputPort.prototype.close = function(){
  var proc = Fiber.current.fbpProc; 
  var conn = this.conn;
  conn.closed = true;
  console.log(proc.name + ': ' + conn.usedslots + ' IPs dropped because of close on ' + conn.name);
  for (var i = 0; i < conn.up.length; i ++) { 
    if (conn.up[i].status == ProcessStatus.WAITING_TO_SEND)
    this.queue.push(conn.up[i]); 
   }
};