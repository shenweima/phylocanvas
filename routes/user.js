
/*
 * GET users listing.
 */

 exports.list = function(req, res){
 	res.send("respond with a resource");
 };

 exports.name = function(req, res){
 	res.send("Hello, " + req.params.name);
 };
/*
exports.join = function(req, res) {

	// TO DO: Validate input
	var user = {
			email: 'test@test.com',
			password: 'abc'
		},
		userId = 'user-' + user.email;

	// Get requested assembly from db
	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;
		db.add(userId, user, function(err, result){
			if (err) throw err;

			console.log(result);

			res.send(200);
		});
	});
};

exports.signIn = function(req, res) {
	
	var userId = 'user-' + req.body.email;

	// Get requested assembly from db
	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;
		db.get(userId, function(err, result) {
			if (err) throw err;

			console.log(result);

			res.send(200);
		});
	});
};
*/