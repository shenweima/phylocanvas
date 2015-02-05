var express = require('express');
var router = express.Router();
var controller = require('../controllers/assembly.js');

//
// Assembly routes
//
router.get('/assembly/:id', controller.get);
//app.post('/assembly', assembly.getData);
router.post('/api/assembly', controller.apiGetAssembly);
router.post('/api/assemblies', controller.apiGetAssemblies);
router.post('/api/assembly/table-data', controller.apiGetAssemblyTableData);
//app.post('/api/assemblies', assembly.apiGetAssemblies);
router.post('/assembly/add', controller.add);
router.post('/api/assembly/resistance-profile', controller.apiGetResistanceProfile);
router.get('/api/all-antibiotics', controller.apiGetAllAntibiotics);
router.get('/api/assembly/:id/core-result', controller.apiGetCoreResult);

module.exports = router;
