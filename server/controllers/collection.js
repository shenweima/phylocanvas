var collectionModel = require('models/collection');
var appConfig = require('configuration');

var LOGGER = require('utils/logging').createLogger('Collection ctrl');

function add(req, res, next) {
  var collectionId = req.body.collectionId;

  var message = collectionId.length > 0 ?
    'Received request for collection id: ' + collectionId :
    'Received request for new collection id';
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

exports.mergeCollectionTrees = function(req, res) {
  console.log('[WGST] Merging trees');
  console.dir(req.body);

  res.json({});

  var socketRoomId = req.body.socketRoomId;

  /**
  * Each collection tree type needs
  * it's own data source flag for merge request.
  */
  var collectionTreeTypeToDataSourceMap = {
    'COLLECTION_TREE': 'CORE',
    'CORE_TREE_RESULT': 'CORE',
    'CORE_ALLELE_TREE': ''
  };

  var mergeRequest = {
    assemblies: [],
    targetCollectionId: req.body.collectionId, // Your collection id
    inputData: [req.body.mergeWithCollectionId], // e.g.: EARSS collection, etc.
    //dataSource: collectionTreeTypeToDataSourceMap[req.body.collectionTreeType]
    dataSource: 'CORE'
  };

  // Generate queue id
  // TODO: Rename ART to WGST_CLIENT_
  var notificationQueueId = 'ART_NOTIFICATION_MERGE_TREES_' + uuid.v4();

  // Create queue
  rabbitMQConnection.queue(notificationQueueId,
  {
    exclusive: true
  }, function(queue){
    console.log('[WGST][RabbitMQ] Notification queue "' + queue.name + '" is open');

    queue.bind(rabbitMQExchangeNames.NOTIFICATION, "MERGE_TREE.COLLECTION." + mergeRequest.targetCollectionId); // binding routing key

    // Subscribe to response message
    queue.subscribe(function(message, headers, deliveryInfo){
      console.log('[WGST][RabbitMQ] Received notification message');

      var buffer = new Buffer(message.data);
      var bufferJSON = buffer.toString();
      var parsedMessage = JSON.parse(bufferJSON);
      var mergedTreeId = parsedMessage.documentKeys[0];

      queue.destroy();

      // -----------------------------------------------------------
      // Get merged tree
      // -----------------------------------------------------------
      console.dir(parsedMessage);

      getMergedCollectionTree(mergedTreeId, function(error, mergedTree){
        if (error) {
          console.error(danger('[WGST][Couchbase][Error] ✗ ' + error));
          return;
        }

        var tree = {
          'MERGED': {
            name: 'Merged tree',
            data: mergedTree.newickTree
          }
        };

        // -----------------------------------------------------------
        // Emit socket message
        // -----------------------------------------------------------
        if (parsedMessage.taskType === 'MERGE') {
          console.log('[WGST][Socket.io] Emitting ' + parsedMessage.taskType + ' message for socketRoomId: ' + socketRoomId);
          io.sockets.in(socketRoomId).emit("collectionTreeMergeNotification", {
            mergedCollectionTreeId: mergedTreeId.replace('MERGE_TREE_', ''),
            //tree: mergedTree.newickTree,
            tree: tree,
            assemblies: mergedTree.assemblies,
            targetCollectionId: mergeRequest.targetCollectionId,
            inputData: mergeRequest.inputData,
            status: "MERGE ready",
            result: "MERGE",
            socketRoomId: socketRoomId
          });
        } // if
      });
    });

    // -----------------------------------------------------------
    // Publish collection tree merge request
    // -----------------------------------------------------------
    rabbitMQExchanges[rabbitMQExchangeNames.TASKS].publish('merge-trees', mergeRequest, {
      mandatory: true,
      contentType: 'application/json',
      deliveryMode: 1,
      // Generate UUID?
      correlationId: 'Art',
      replyTo: 'noQueueId'
    }, function(err) {
      if (err) {
        console.error(danger('[WGST][RabbitMQ][Error] ✗ Failed to publish to ' + rabbitMQExchangeNames.TASKS + ' exchange'));
        return;
      }

      console.log('[WGST][RabbitMQ] Message was published to ' + rabbitMQExchangeNames.TASKS + ' exchange');
    });
  });
};

exports.apiGetMergeTree = function(req, res) {
  var mergeTreeId = req.body.mergeTreeId;
  var socketRoomId = req.body.socketRoomId;

  res.json({});

  // -----------------------------------------------------------
  // Get merged tree
  // -----------------------------------------------------------
  getMergedCollectionTree('MERGE_TREE_' + mergeTreeId, function(error, mergeTree) {
    if (error) {
      console.error(danger('[WGST][Couchbase][Error] ✗ ' + error));
      return;
    }

    var tree = {
      MERGED: {
        name: 'Merged tree',
        data: mergeTree.newickTree
      }
    };

    // -----------------------------------------------------------
    // Emit socket message
    // -----------------------------------------------------------
    //if (parsedMessage.taskType === 'MERGE') {
    console.log('[WGST][Socket.io] Emitting MERGE_TREE message for socketRoomId: ' + socketRoomId);
    io.sockets.in(socketRoomId).emit("collectionTreeMergeNotification", {
      mergedCollectionTreeId: mergeTreeId,
      //tree: mergedTree.newickTree,
      tree: tree,
      assemblies: mergeTree.assemblies,
      //targetCollectionId: mergeRequest.targetCollectionId,
      //inputData: mergeRequest.inputData,
      status: "MERGE ready",
      result: "MERGE",
      socketRoomId: socketRoomId
    });
    //} // if
  });
};

var getMergedCollectionTree = function(mergedTreeId, callback) {
  console.log('[WGST] Getting merged tree ' + mergedTreeId);

  couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN].get(mergedTreeId, function(error, result) {
    if (error) {
      callback(error, null);
      return;
    }

    console.log('[WGST] Got merged tree ' + mergedTreeId);

    var treeData = result.value;

    callback(null, treeData);
  });
};

module.exports.add = add;
module.exports.get = get;
module.exports.getRepresentativeCollection = getRepresentativeCollection;
module.exports.renderExisting = renderExisting;
module.exports.renderNew = renderNew;
