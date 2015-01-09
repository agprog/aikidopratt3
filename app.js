var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
/*var redis=require('redis');*/
var session=require('express-session');
/*var redisStore=require('connect-redis')(session);*/
var mongoStore=require('connect-mongo')(session);
var bodyParser = require('body-parser');
var multer = require('multer');
var config=require('./config');
var commons=require('commons');
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
/*var client=redis.createClient(6379,'localhost');
client.auth(
        'localhost:6379',
        function(err) {
            if (err) {
                // impossible de se connecter au serveur Redis
                console.log(err);
                throw err;
            }else{
				console.log("connecté au serveur redis");
			}
        });
app.use(session({
			secret:'123456',
			store: new redisStore({
				client:client
				})
		}));*/
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
app.get('/login/',function(req,res){
	if(!req.sessionStore.log){
		res.render('login',{title:'Login required',
								target_url:req.sessionStore.target_url,
								msg:req.sessionStore.flash,
								context:commons.contextCreate(req,'admin')
								});
	}else{
		res.redirect('/');
	}
});
app.post('/signin/',function(req,res){
	users.authentificate(req,res);
});
app.get('/logout/',function(req,res){
	users.log_out(req,res);
});
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
