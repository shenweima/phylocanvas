
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	user = require('./routes/user'),
	assembly = require('./routes/assembly'),
	http = require('http'),
	path = require('path'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
// http://stackoverflow.com/a/19965089
app.use(express.json({limit: '500mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/users/name/:name', user.name);
app.post('/assembly/add', assembly.add);
app.get('/assembly/:id', assembly.get);
//app.post('/join', user.join);
//app.post('/signin', user.signIn);
app.get('/dev/d3tree', require('./routes/dev').d3tree);
app.get('/dev/d3test', require('./routes/dev').d3test);
app.get('/dev/d3dots-svg', require('./routes/dev').d3dotsSVG);
app.get('/dev/d3dots-canvas', require('./routes/dev').d3dotsCanvas);
app.get('/dev/canvas', require('./routes/dev').canvas);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});