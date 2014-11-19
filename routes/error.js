var express = require('express');
var router = express.Router();
var controller = require('../controllers/error.js');

//
// No path match - 404
//
router.use(function(req, res, next) {
    return next(controller.createError(404));
});

//
// Handle error
//
router.use(function(error, req, res, next) {
    if (error.status === 404) {
        res.status(404);
        res.render('404');
        return;
    }

    res.status(500);
    res.render('500');
});

module.exports = router;