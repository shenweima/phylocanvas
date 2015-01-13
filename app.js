var chalk = require('chalk');
var attention = chalk.white.bgBlue;
var success = chalk.bgGreen;

//
// Configure app
//
require('./controllers/configuration.js')();

//======================================================
// Module dependencies
//======================================================
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var swig = require('swig');
var app = express();

app.set('port', process.env.PORT || appConfig.server.node.port);
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
// http://stackoverflow.com/a/19965089
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));

//
// Use long stack trace everywhere except for production environment
//
if (process.env.NODE_ENV === 'development'){
    console.warn(attention('Development environment.'));
    console.warn(attention('Using long stack trace.'));
    require('longjohn');

    app.use(morgan('dev'));

} else if (process.env.NODE_ENV === 'production') {
    console.warn(attention('Production environment.'));

    app.use(morgan(':date :method :url :status :response-time', {
        skip: function(req, res) {
            return res.statusCode < 400;
        }
    }));

} else {
    console.warn(attention('Unknown environment. Please identify your environment by running `NODE_ENV=development npm run start` command.'));
}

app.use(express.static(path.join(__dirname, 'public')));

//
// Set our own x-powered-by header
//
app.use(function(req, res, next){
    res.header("X-powered-by", "Blood, sweat, and tears");
    next();
});

//
// Configure Couchbase
//
require('./controllers/couchbase.js')();

//
// Configure RabbitMQ
//
require('./controllers/rabbit.js')();

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log(success('[WGST] ✔ Express server listening on port ' + app.get('port')));

    //
    // Configure Socket.io
    //
    require('./controllers/socket.js')(server);
});

//
// Setup routing
//
require('./routes.js')(app);

//
// Setup error handling
//
require('./controllers/error').handleErrors(app);