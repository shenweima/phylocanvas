var express = require('express');
var router = express.Router();
var controller = require('../controllers/collection.js');

//
// Collection routes
//
router.post('/collection/', controller.get);
router.post('/collection/add', controller.add);
router.get('/collection/new', controller.renderNew);
//app.get('/collection/representative', routes.getRepresentativeTreeMetadata);
router.get('/api/collection/representative/metadata', controller.getRepresentativeCollection);
router.get('/collection/:id', controller.renderExisting);
router.post('/api/collection/tree/merge', controller.mergeCollectionTrees);
router.post('/api/collection/merged', controller.getMergeTree);

module.exports = router;
