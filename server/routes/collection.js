var express = require('express');
var router = express.Router();
var controller = require('../controllers/collection.js');

//
// Collection routes
//
router.post('/collection/', controller.get);
router.post('/collection/add', controller.add);
router.get('/collection/new', controller.newCollection);
//app.get('/collection/representative', routes.getRepresentativeTreeMetadata);
router.get('/api/collection/representative/metadata', controller.getRepresentativeCollection);
router.get('/collection/:id', controller.get);
router.post('/api/collection/tree/merge', controller.mergeCollectionTrees);
router.post('/api/collection/merged', controller.apiGetMergeTree);

module.exports = router;
