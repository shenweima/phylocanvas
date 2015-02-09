module.exports = function (app) {
  app.use(require('routes/landing'));
  app.use(require('routes/collection'));
  app.use(require('routes/assembly'));
  app.use(require('routes/antibiotic'));
  app.use(require('routes/download'));
  app.use(require('routes/error'));
  // TODO:
  //app.use(require('./routes/user.js'));
};
