var express = require('express');
var router = express.Router();
var controller = require('../controllers/download.js');

//
// Download routes
//
router.get('/api/download/assembly/:id/metadata/:format', controller.apiGetDownloadAssemblyMetadata);

module.exports = router;