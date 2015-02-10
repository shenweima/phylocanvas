var _ = require('lodash');

var assemblyModel = require('models/assembly');
var antibioticModel = require('models/antibiotic');

var LOGGER = require('utils/logging').createLogger('Assembly ctrl');

function add(req, res) {

  var ids = _.pick(req.body,
    ['collectionId', 'socketRoomId', 'userAssemblyId', 'assemblyId']);

  LOGGER.info(
    'Adding assembly ' + ids.assemblyId + ' to collection ' + ids.collectionId
  );

  // Validate request
  if (!ids.collectionId) {
    LOGGER.error('Missing collection id');
  }
  if (!ids.socketRoomId) {
    LOGGER.error('Missing socket room id');
  }
  if (!ids.userAssemblyId) {
    LOGGER.error('Missing user assembly id');
  }
  if (!ids.assemblyId) {
    LOGGER.error('Missing assembly id');
  }

  res.json({
    assemblyId: ids.assemblyId
  });

  assemblyModel.beginUpload(ids, req.body.metadata, req.body.sequences);
}

function get(req, res) {
  assemblyModel.get(req.params.id, function (error, result) {
    if (error) {
      LOGGER.error(error, result);
      return res.sendStatus(500);
    }
    var assembly = result.value;
    LOGGER.info(assembly);
    res.render('app', { requestedAssemblyObject: JSON.stringify(assembly) });
  });
}

function getComplete(req, res) {
  assemblyModel.getComplete(req.body.assemblyId, function (error, assembly) {
    if (error) {
      LOGGER.error(error, assembly);
      return res.sendStatus(500);
    }
    antibioticModel.getAll(function (antibiotics) {
      if (error) {
        LOGGER.error(error, antibiotics);
        return res.sendStatus(500);
      }
      res.json({
        assembly: assembly,
        antibiotics: antibiotics
      });
    });
  });
}

function getMany(req, res) {
  assemblyModel.getMany(req.body.assemblyIds, function (error, assemblies) {
    if (error) {
      LOGGER.error(error);
      return res.sendStatus(500);
    }
    res.json(assemblies);
  });
}

function getResistanceProfile(req, res) {
  assemblyModel.getResistanceProfile(req.body.assemblyIds,
    function (error, resistanceProfile) {
      if (error) {
        LOGGER.error(error, resistanceProfile);
        return res.sendStatus(500);
      }
      res.json({
        resistanceProfile: resistanceProfile
      });
    }
  );
}

function getTableData(req, res) {
  var assemblyIds = req.body.assemblyIds;
  assemblyModel.getTableData(assemblyIds, function (error, tableData) {
    if (error) {
      return res.json(500, { error: error });
    }
    res.json(tableData);
  });
}

function getCoreResult(req, res, next) {
  assemblyModel.getCoreResult(req.params.id, function (error, result) {
    if (error) {
      return next(error, null);
    }
    res.send(result);
  });
}

module.exports = {
  add: add,
  get: get,
  getMany: getMany,
  getComplete: getComplete,
  getResistanceProfile: getResistanceProfile,
  getTableData: getTableData,
  getCoreResult: getCoreResult
};
