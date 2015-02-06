var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

describe('Service: Storage', function () {

  var mockSuccessConnections = {
    main: {
      get: sinon.stub().yields(null, { value: 'result', cas: 'cas' }),
      set: sinon.stub().yields(null, { value: 'result', cas: 'cas' })
    }
  };

  var mockErrorConnections = {
    main: {
      get: sinon.stub().yields(new Error('get error')),
      set: sinon.stub().yields(new Error('set error'))
    }
  };

  it('should create connections', function () {
    var storageService = rewire('services/storage');

    assert(storageService('main') !== null);
    assert(storageService('resources') !== null);
  });

  it('should return the value of a `get` result', function (done) {
    var storageService = rewire('services/storage');
    var reset = storageService.__set__(
      'storageConnection', mockSuccessConnections
    );

    storageService('main').retrieve('key')
      .then(function (result) {
        assert(mockSuccessConnections.main.get.calledWith('key'));
        assert(result === 'result');
        reset();
        done();
      });
  });

  it('should surface `get` errors', function (done) {
    var storageService = rewire('services/storage');
    var reset = storageService.__set__(
      'storageConnection', mockErrorConnections
    );

    storageService('main').retrieve('key')
      .catch(function (error) {
        assert(error.message === 'get error');
        reset();
        done();
      });
  });

  it('should return the cas of a `set` result', function (done) {
    var storageService = rewire('services/storage');
    var reset = storageService.__set__(
      'storageConnection', mockSuccessConnections
    );

    storageService('main').store('key', 'value')
      .then(function (cas) {
        assert(mockSuccessConnections.main.set.calledWith('key', 'value'));
        assert(cas === 'cas');
        reset();
        done();
      });
  });

  it('should surface `set` errors', function (done) {
    var storageService = rewire('services/storage');
    var reset = storageService.__set__(
      'storageConnection', mockErrorConnections
    );

    storageService('main').store('key', 'value')
      .catch(function (error) {
        assert(error.message === 'set error');
        reset();
        done();
      });
  });

});
