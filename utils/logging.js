var chalk = require('chalk');
var attention = chalk.white.bgBlue;
var success = chalk.bgGreen;

var morgan = require('morgan');

exports.init = function(app) {
    //
    // Use long stack trace only in development environment
    //
    if (process.env.NODE_ENV === 'development'){
        console.warn(attention('[WGST] Development environment.'));
        require('longjohn');

        app.use(morgan('dev'));

    } else if (process.env.NODE_ENV === 'production') {
        console.warn(attention('[WGST] Production environment.'));

        app.use(morgan(':date :method :url :status :response-time', {
            skip: function(req, res) {
                return res.statusCode < 400;
            }
        }));

        //
        // Ignore console.log and console.dir in production
        //
        console.log = function(){};
        console.dir = function(){};

    } else {
        console.warn(attention('[WGST] Unknown environment. Please identify your environment by running `NODE_ENV=development npm run start` command.'));
    }
};