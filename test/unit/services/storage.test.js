var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

describe('Service: Storage', function () {

  var mockSuccessConnections = {
    main: {
      get: sinon.stub().yields(null, 'result'),
      set: sinon.stub().yields(null, 'result')
    }
  };

  var mockErrorConnections = {
    main: {
      get: sinon.stub().yields('get error'),
      set: sinon.stub().yields('set error')
    }
  };

  it('should create connections', function () {
    var storageService = rewire('services/storage');

    assert(storageService('main') !== null);
    assert(storageService('resources') !== null);
  });

  it('should get single values', function (done) {
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

  it('should surface get errors', function (done) {
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

  it('should set single values', function (done) {
    var storageService = rewire('services/storage');
    var reset = storageService.__set__(
      'storageConnection', mockSuccessConnections
    );

    storageService('main').store('key', 'value')
      .then(function (result) {
        assert(mockSuccessConnections.main.set.calledWith('key', 'value'));
        assert(result === 'result');
        reset();
        done();
      });
  });

  it('should surface set errors', function (done) {
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
