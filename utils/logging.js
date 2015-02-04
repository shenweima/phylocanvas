var bunyan = require('bunyan');
var morgan = require('morgan');

function createLogger(appendedName) {
  var loggerName = 'WGSA';
  if (appendedName) {
    loggerName += ' ' + appendedName.toUpperCase();
  }
  return bunyan.createLogger({ name: loggerName });
}

/**
 * Caching a standard logger should be more efficient than creating multiple
 * loggers throughout the application.
 */
var BASE_LOGGER = createLogger();
function getBaseLogger() {
  return BASE_LOGGER;
}

function initHttpLogging(app, env) {
  getBaseLogger().warn('Environment: ' + env);
  if (env === 'production') {
    app.use(morgan(':date :method :url :status :response-time', {
      skip: function(req, res) {
        return (res.statusCode < 400);
      }
    }));
  } else {
    app.use(morgan('dev'));
    require('longjohn');
  }
}

module.exports = {
  createLogger: createLogger,
  getBaseLogger: getBaseLogger,
  initHttpLogging: initHttpLogging
};
