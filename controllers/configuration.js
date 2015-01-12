module.exports = function() {
	console.log('[WGST] Reading app config file');

	var fs = require('fs');
	var file = __dirname + '/../config.json';

	var appConfigData = fs.readFileSync(file, 'utf8');
	// Global var on purpose
	appConfig = JSON.parse(appConfigData);
	console.dir(appConfig);
};