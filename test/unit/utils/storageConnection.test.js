var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

describe('Util: Storage Connection', function () {
  var CONNECTION_NAME = 'test';

  it('should attempt to connect with the provided config', function () {
    var storageUtil = rewire('utils/storageConnection');
    var config = {};
    config[CONNECTION_NAME] = { name: 'user', password: 'pass' };

    var createBucketConnection = sinon.spy();
    storageUtil.__set__('createBucketConnection', createBucketConnection);

    var connections = storageUtil.connect(config);

    assert(
      createBucketConnection.calledWith(config.test.name, config.test.password)
    );
    assert(connections.hasOwnProperty(CONNECTION_NAME));
  });

});
