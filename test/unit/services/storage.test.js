var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

describe('Service: Storage', function () {

  var CONNECTION_NAME = 'main';
  var COUCHBASE_RESULT = { value: 'result', cas: 'cas' };

  var mockSuccessConnection = {};
  mockSuccessConnection[CONNECTION_NAME] = {
    get: sinon.stub().yields(null, COUCHBASE_RESULT),
    set: sinon.stub().yields(null, COUCHBASE_RESULT)
  };

  var mockErrorConnection = {};
  mockErrorConnection[CONNECTION_NAME] = {
    get: sinon.stub().yields(new Error('get error'), null),
    set: sinon.stub().yields(new Error('set error'), null)
  };

  it('should create connections', function () {
    var storageService = rewire('services/storage');

    assert(storageService('main') !== null);
    assert(storageService('resources') !== null);
  });

  it('should return the value property of a `get` result', function (done) {
    var storageService = rewire('services/storage');

    storageService.__set__('storageConnection', mockSuccessConnection);

    storageService(CONNECTION_NAME).retrieve('key')
      .then(function (result) {
        assert(mockSuccessConnection[CONNECTION_NAME].get.calledWith('key'));
        assert.equal(result, COUCHBASE_RESULT.value);
        done();
      });
  });

  it('should surface `get` errors', function (done) {
    var storageService = rewire('services/storage');

    storageService.__set__('storageConnection', mockErrorConnection);

    storageService(CONNECTION_NAME).retrieve('key')
      .catch(function (error) {
        assert.equal(error.message, 'get error');
        done();
      });
  });

  it('should return the cas property of a `set` result', function (done) {
    var storageService = rewire('services/storage');

    storageService.__set__('storageConnection', mockSuccessConnection);

    storageService(CONNECTION_NAME).store('key', 'value')
      .then(function (result) {
        assert(mockSuccessConnection[CONNECTION_NAME].set.calledWith('key', 'value'));
        assert.equal(result, COUCHBASE_RESULT.cas);
        done();
      });
  });

  it('should surface `set` errors', function (done) {
    var storageService = rewire('services/storage');

    storageService.__set__('storageConnection', mockErrorConnection);

    storageService(CONNECTION_NAME).store('key', 'value')
      .catch(function (error) {
        assert.equal(error.message, 'set error');
        done();
      });
  });

});
