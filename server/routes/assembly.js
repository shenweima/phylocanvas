var express = require('express');
var router = express.Router();
var controller = require('controllers/assembly.js');

router.get('/assembly/:id', controller.get);
router.post('/api/assembly', controller.getComplete);
router.post('/api/assemblies', controller.getMany);
router.post('/api/assembly/table-data', controller.getTableData);
router.post('/assembly/add', controller.add);
router.post('/api/assembly/resistance-profile', controller.getResistanceProfile);
router.get('/api/assembly/:id/core-result', controller.getCoreResult);

module.exports = router;
