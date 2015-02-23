var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var sender = network.defProc(require('../components/sender.js'));
var copier = network.defProc(require('../components/copier.js'));
var recvr  = network.defProc(require('../components/recvr.js'));
// var recvr = fbp.defProc(require('../components/recvr.js'), 'recvr'); // equivalent

network.initialize(sender, 'COUNT', Math.pow(10, 5));
network.connect(sender, 'OUT', copier, 'IN', 5);
network.connect(copier, 'OUT', recvr, 'IN', 5);

// --- run ---
var runtime = new fbp.PromiseStreamRuntime();
network.run(runtime, { trace: true }, function() { console.log("FINISHED");});