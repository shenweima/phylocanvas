var collectionModel = require('models/collection');
var appConfig = require('configuration');

var LOGGER = require('utils/logging').createLogger('Collection ctrl');

function add(req, res, next) {
  var collectionId = req.body.collectionId;

  var message = (collectionId.length > 0 ?
    'Received request for collection id: ' + collectionId :
    'Received request for new collection id');
  LOGGER.info(message);

  collectionModel.add(req.body, function (error, result) {
    if (error) {
      return next(error);
    }
    res.json(result);
  });
}

function get(req, res, next) {
  var collectionId = req.body.collectionId;
  collectionModel.get(collectionId, function (error, result) {
    if (error) {
      return next(error);
    }
    res.json(result);
  });
}

function getRepresentativeCollection(req, res, next) {
  LOGGER.info('Getting representative collection');
  collectionModel.getRepresentativeCollection(function (error, result) {
    if (error) {
      return next(error);
    }
    res.json(result);
  });
}

function renderExisting(req, res) {
  var collectionId = req.params.id;

  LOGGER.info('Requested ' + collectionId + ' collection');

  res.render('app', {
    appConfig: JSON.stringify(appConfig.client),
    requestedCollectionId: collectionId
  });
}

function renderNew(req, res) {
  res.render('app', {
    appConfig: JSON.stringify(appConfig.client),
    newCollection: true
  });
}

function mergeCollectionTrees(req, res) {
  res.json({});
  collectionModel.mergeCollectionTrees(req.body);
}

function getMergeTree(req, res) {
  res.json({});
  collectionModel.getMergeTree(req);
}

module.exports.add = add;
module.exports.get = get;
module.exports.getRepresentativeCollection = getRepresentativeCollection;
module.exports.renderExisting = renderExisting;
module.exports.renderNew = renderNew;
module.exports.mergeCollectionTrees = mergeCollectionTrees;
module.exports.getMergeTree = getMergeTree;
