var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

describe('Util: Storage Connection', function () {

  it('should attempt to connect with the provided config', function () {
    var storageUtil = rewire('utils/storageConnection');
    var config = { test: { name: 'user', password: 'pass' } };

    var spy = sinon.spy();
    storageUtil.__set__('createBucketConnection', spy);

    var connections = storageUtil.connect(config);

    assert(spy.calledWith(config.test.name, config.test.password));
    assert(connections.hasOwnProperty('test'));
  });

});
