var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

describe('Util: Couchbase Connections', function () {

  it('should attempt to connect with the provided config', function () {
    var couchbaseUtil = rewire('utils/couchbaseConnections');
    var config = { test: { name: 'user', password: 'pass' } };

    var spy = sinon.spy();
    couchbaseUtil.__set__('createBucketConnection', spy);

    var connections = couchbaseUtil.connect(config);

    assert(spy.calledWith(config.test.name, config.test.password));
    assert(connections.hasOwnProperty('test'));
  });

});
