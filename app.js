
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var config = require('./config').config;
var map = require('./map');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
// app.use(utils.sanitize(req.body));
// app.use(utils.sanitize(req.params));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// production only
if ('production' === app.get('env')) {
	var log4js = require('log4js');
	log4js.configure({
		appenders: [
			{	type: 'console' },
			{
				type: 'file',
				filename: 'logs/access.log',
				maxLogSize: 1024,
				backup: 3,
				category: 'normal'
			}
		]
	});
	var logger = log4js.getLogger('normal');
	logger.setLevel('WARN');

	app.use(log4js.connectLogger(logger, {level: log4js.levels.WARN}));
	app.use(express.compress());
	app.use(function(req, res, callback) {
		res.removeHeader('X-Powered-By');
		callback();
	});

	app.use(express.cookieParser());
	app.use(express.session({
		key : 'sirius.sid',
		secret : config.SESSION_SECRET,
		store : new RedisStore(),
		cookie : {
			maxAge : 60000 * 60 * 24
		}
	}));

	app.set('port', process.env.PORT || 8080);
}

map(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
