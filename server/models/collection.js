var uuid = require('node-uuid');

var errorController = require('./error');
var assemblyModel = require('models/assembly');
var antibioticModel = require('models/antibiotic');

var LOGGER = require('utils/logging').createLogger('Collection model');

function add(ids, callback) {
  var collectionId = ids.collectionId;
  var userAssemblyIds = ids.userAssemblyIds;
  var isNewCollection = true;
  var collectionRequest;

  // Create new collection id
  if (collectionId.length === 0) {

    // Prepare object to publish
    collectionRequest = {
      taskId: 'new',
      inputData: userAssemblyIds
    };

  // Reuse existing collection id and just get new user assembly id to assembly id mapping
  }  else {

    // Prepare object to publish
    collectionRequest = {
      taskId: collectionId,
      inputData: userAssemblyIds
    };

    isNewCollection = false;
  }

  // TODO: Validate request

  var queueId = 'ART_CREATE_COLLECTION_' + uuid.v4();

  // Publish message
  rabbitMQExchanges[rabbitMQExchangeNames.COLLECTION_ID].publish('id-request', collectionRequest, {
    mandatory: true,
    contentType: 'application/json',
    deliveryMode: 1,
    // Generate UUID?
    correlationId: 'Art',
    replyTo: queueId
  }, function (error) {
    if (error) {
      LOGGER.error('Error in trying to publish');
      return callback(error, null);
    }

    LOGGER.info('Message was published');
  });

  rabbitMQConnection
  .queue(queueId, {
    passive: false,
    durable: false,
    exclusive: true,
    autoDelete: true,
    noDeclare: false,
    closeChannelOnUnsubscribe: false
  }, function (queue) {
    LOGGER.info('Queue "' + queue.name + '" is open');

  })
  .subscribe(function (message, headers, deliveryInfo) {
    LOGGER.info('Received response');

    var buffer = new Buffer(message.data);
    var data = JSON.parse(buffer.toString());
    var collectionId = data.uuid;
    var userAssemblyIdToAssemblyIdMap = data.idMap;

    callback(null, {
      collectionId: collectionId,
      userAssemblyIdToAssemblyIdMap: userAssemblyIdToAssemblyIdMap
    });

  });
}

function get(collectionId, callback) {

  var collection = {
    assemblies: {},
    tree: {}
  };

  LOGGER.info('Getting list of assemblies for collection ' + collectionId);

  // Get list of assemblies
  couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN].get('COLLECTION_LIST_' + collectionId, function (error, assemblyIdsData) {
    if (error) {
      LOGGER.error('Failed to get collection ' + collectionId + ': ' + error);
      return callback(error);
    }

    var assemblyIds = assemblyIdsData.value.assemblyIdentifiers;

    console.log('[WGST] Got list of assemblies for collection ' + collectionId);
    console.dir(assemblyIds);

    var assemblyCounter = assemblyIds.length;
    while (assemblyCounter !== 0) {
      assemblyCounter = assemblyCounter - 1;

      var assemblyId = assemblyIds[assemblyCounter];

      assemblyModel.getComplete(assemblyId, function (error, assembly) {
        if (error) {
          LOGGER.error('Failed to get assembly: ' + error);
          return callback(error);
        }

        LOGGER.info('Got assembly ' + assembly.ASSEMBLY_METADATA.assemblyId);

        var assemblyId = assembly.ASSEMBLY_METADATA.assemblyId;

        collection.assemblies[assemblyId] = assembly;

        //
        // Log assemblies that you have received
        //
        if (parseInt(assemblyIds.length - Object.keys(collection.assemblies).length, 10) > 0) {
          // Log how many assemblies left to receive
          LOGGER.info(parseInt(assemblyIds.length - Object.keys(collection.assemblies).length, 10) + ' assemblies left:');
          // Log which assemblies left to receive
          LOGGER.info(
            assemblyIds.filter(function (assemblyId, index, array) {
              if (typeof collection.assemblies[assemblyId] === 'undefined') {
                return assemblyId;
              }
            })
          );
        } else {
          LOGGER.info('0 assemblies left');
        }

        // If got all assemblies
        if (Object.keys(collection.assemblies).length === assemblyIds.length) {

          var collectionTreeQueryKeys = [];

          //collectionTreeQueryKeys.push('CORE_TREE_RESULT_' + collectionId);
          collectionTreeQueryKeys.push('CORE_TREE_RESULT_' + collectionId);
          //collectionTreeQueryKeys.push('CORE_ALLELE_TREE_' + collectionId);

          // Get collection tree data
          couchbaseDatabaseConnections[COUCHBASE_BUCKETS.MAIN].getMulti(collectionTreeQueryKeys, {}, function(error, collectionTreesData) {
            if (error) {
              LOGGER.error(error);
              return callback(error);
            }

            collection.tree = {};

            for (var collectionTreeKey in collectionTreesData) {
              if (collectionTreesData.hasOwnProperty(collectionTreeKey)) {
                var collectionTreeData = collectionTreesData[collectionTreeKey].value;

                  //console.dir(collectionTreesData);

                  // Parsing COLLECTION_TREE
                if (collectionTreeKey.indexOf('COLLECTION_TREE_') !== -1) {
                  console.log('[WGST] Got ' + collectionTreeData.type + ' data for ' + collectionId + ' collection');
                  collection.tree[collectionTreeData.type] = {};
                  collection.tree[collectionTreeData.type].name = 'FP Tree';
                  collection.tree[collectionTreeData.type].data = collectionTreeData.newickTree;

                  // Parsing CORE_TREE_RESULT
                } else if (collectionTreeKey.indexOf('CORE_TREE_RESULT_') !== -1) {
                  console.log('[WGST] Got ' + collectionTreeData.type + ' data for ' + collectionId + ' collection');
                  collection.tree[collectionTreeData.type] = {};
                  collection.tree[collectionTreeData.type].name = 'Core Mutations Tree';
                  collection.tree[collectionTreeData.type].data = collectionTreeData.newickTree;

                  // Parsing CORE_ALLELE_TREE
                } else if (collectionTreeKey.indexOf('CORE_ALLELE_TREE_') !== -1) {
                  console.log('[WGST] Got ' + collectionTreeData.type + ' data for ' + collectionId + ' collection');
                  collection.tree[collectionTreeData.type] = {};
                  collection.tree[collectionTreeData.type].name = 'Core Allele Tree';
                  collection.tree[collectionTreeData.type].data = collectionTreeData.newickTree;
                } // if
              } // if
            } // for

            // Get antibiotics
            antibioticModel.getAll(function (error, antibiotics) {
              if (error) {
                LOGGER.error(error);
                return callback(error);
              }

              LOGGER.info('Finished getting collection ' + collectionId);

              callback(null, {
                collection: collection,
                antibiotics: antibiotics
              });
            });
          });
        } // if
      });
    } // for
  });
}

function getRepresentativeCollection(callback) {
  LOGGER.info('[WGST] Getting representative collection');

  // Get list of assemblies
  couchbaseDatabaseConnections[COUCHBASE_BUCKETS.RESOURCES].get('REP_METADATA_1280', function (err, representativeCollectionMetadata) {
    if (err) {
      return callback(err);
    }
    representativeCollectionMetadata = representativeCollectionMetadata.value;
    LOGGER.info('Got representative collection');
    callback(null, representativeCollectionMetadata);
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
