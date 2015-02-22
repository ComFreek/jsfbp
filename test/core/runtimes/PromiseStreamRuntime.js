'use strict';

var fbp = require('../../..');

describe('PromiseStreamRuntime', function() {
  it('should be able to run a simple sender-->receiver setup', function(done) {
    var network = new fbp.Network();

    var result = [];
    var sender = network.defProc(MockSender([1,2,3,4,5]), 'MockSender');
    var recvr  = network.defProc(MockReceiver(result), 'MockReceiver');

    network.connect(sender, 'OUT', recvr, 'IN', 5);

    network.run(new fbp.PromiseStreamRuntime(), { trace: false }, function () {
      expect(result).to.deep.equal([1,2,3,4,5]);
      done();
    });
  });
});