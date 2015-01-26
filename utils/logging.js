var bunyan = require('bunyan');
var morgan = require('morgan');
var rootLogger = bunyan.createLogger({ name: 'WGSA' });
module.exports = {
  getRootLogger: function() {
    return rootLogger;
  },
  initHttpLogging: function(app, env) {
    rootLogger.warn('Environment: ' + env);
    if (env === 'production') {
      app.use(morgan(':date :method :url :status :response-time', {
        skip: function(req, res) {
          return res.statusCode < 400;
        }
      }));
    } else {
      app.use(morgan('dev'));
      require('longjohn');
    }
  }
};
