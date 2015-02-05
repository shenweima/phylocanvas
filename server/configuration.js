module.exports = function() {
  //
  // Read config file
  //
  var fs = require('fs');
  var file = __dirname + '/../config.json';
  var appConfigData = fs.readFileSync(file, 'utf8');

  //
  // Store config as a global variable
  //
  global.appConfig = JSON.parse(appConfigData);
};
