module.exports = function(app) {
	app.use(require('./routes/landing.js'));
	app.use(require('./routes/user.js'));
	app.use(require('./routes/collection.js'));
	app.use(require('./routes/assembly.js'));
	app.use(require('./routes/download.js'));
	app.use(require('./routes/error.js'));
};