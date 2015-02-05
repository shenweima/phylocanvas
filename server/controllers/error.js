exports.errorCodes = {
  KEY_DOES_NOT_EXIST: 13
};

exports.createError = function(status) {
  var error = new Error();
  error.status = status;
  return error;
};

exports.handleErrors = function(app) {
  //
  // Handle error
  //
  app.use(function(error, req, res) {
    if (error.status === 404) {
      res.status(404);
      res.render('404');
      return;
    }

    res.status(500);
    res.render('500');
  });
};
