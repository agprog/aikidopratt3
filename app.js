var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session=require('express-session');
var mongoStore=require('connect-mongo')(session);
var bodyParser = require('body-parser');
var multer = require('multer');
var config=require('./config');
var index = require('./index');
var admin = require('./admin/admin');
var users = require('./users/users');
var app = express();

// view engine setup
app.set('env',config.environment);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view options',{layout:false});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: './tmp/' }));
app.use(cookieParser());
app.use(session({secret:'aUx689',
				store:new mongoStore({
					host:config.db[app.get('env')].host,
					db:config.db[app.get('env')].dbname,
					user:config.db[app.get('env')].user,
					pass:config.db[app.get('env')].pass
				})
			}));
app.use('/', index);
app.use('/admin',admin);
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.use('/static',express.static(path.join(__dirname, 'public')));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'dev') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            context:{stylesheets:[],scripts:[]},
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
	res.render('error', {
			message: err.message,
			context:{stylesheets:[],scripts:[]},
			error: {}
		});
});



module.exports = app;
