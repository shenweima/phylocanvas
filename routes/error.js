var express = require('express');
var router = express.Router();
var controller = require('../controllers/error.js');

//
// No path match - 404
//
router.use(function(req, res, next) {
    return next(controller.createError(404));
});

module.exports = router;