
/*
 * GET users listing.
 */

 exports.list = function(req, res){
 	res.send("respond with a resource");
 };

 exports.name = function(req, res){
 	res.send("Hello, " + req.params.name);
 };