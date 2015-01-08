/**************************
 * ***     ENTETES      ***/

var commons = require('commons');
var express = require('express');
var fs      = require('fs');
var path    = require('path');
var handlers = require('./handlers');
var schema  = require('./schema');
var config  = require('../config');
/* ************************/
var app= express();
var users=require('../users/users');
var dir='admin';
var espace='Administration';
var env='dev';
var params={dir:'admin',espace:'administration'}; //parametres communs à injecter, \
												  //permet de définir un espace commun statique complementaire du contexte
												  
function _conf_params(value_schema){
	switch(value_schema){
		case 'galerie':
			params['schema']='galerie';
			params['template']='galerie';
			break;
		case 'generalite':
			params['schema']='general';
			params['template']='generalites';
			break;
		default:
			params['schema']=value_schema;
			params['template']='objet';
	}
}
/* ************************ 
 * *** CONTROLLER ADMIN ***/
 


app.locals.commons = require('commons');

app.get('/', function(req, res) {
	users.is_login(req,res,function(){
							res.render(dir+'/admin', {title: espace,
													context:commons.contextCreate(req,'admin')
											});
							});
});
app.post('/galerie/photo/add/',function(req,res){
	users.is_login(req,res,function(){
							handlers.photo_add(req,res);
						});
});
app.post('/galerie/photo/delete/',function(req,res){
	users.is_login(req,res,function(){
			if(commons.csrf_check(req) == false && config.environment != 'dev'){
				res.status(403).send('Erreur csrf').end();
			}else{
				handlers.photo_delete(req,res);
			}
	});
});
app.post('/galerie/photo/update/',function(req,res){
	users.is_login(req,res,function(){
			if(commons.csrf_check(req) == false && config.environment != 'dev'){
				res.status(403).send('Erreur csrf').end();
			}else{
				params['schema']='photo';
				handlers.inline_update(req,res,params);
			}
		});
});
app.get('/generalite/',function(req,res){
	params['title']='éléments généraux';
	users.is_login(req,res,function(){
				_conf_params('generalite');
				handlers.inline_show(req,res,params);
			});
});
app.post('/generalite/add/',function(req,res){
	params['schema']='general';
	users.is_login(req,res,function(){
			if(commons.csrf_check(req) == false && config.environment != 'dev'){
				res.status(403).send('Erreur csrf').end();
			}else{
				handlers.inline_add(req,res,params);
			}
		});
});
app.post('/generalite/update/',function(req,res){
	params['schema']='general';
	users.is_login(req,res,function(){
		if(commons.csrf_check(req) == false && config.environment != 'dev'){
			res.status(403).send('Erreur csrf').end();
		}else{
			handlers.inline_update(req,res,params);
		}
	});
});
app.post('/generalite/delete/',function(req,res){
	params['schema']='general';
	users.is_login(req,res,function(){
			if(commons.csrf_check(req) == false && config.environment != 'dev'){
				res.status(403).send('Erreur csrf').end();
			}else{
				handlers.inline_delete(req,res,params);
			}
		});
});
app.post('/deletefile/',function(req,res){
	users.is_login(req,res,function(){
			if(commons.csrf_check(req) == false && config.environment != 'dev'){
				res.status(403).send('Erreur csrf').end();
			}else{
				handlers.delete_file(req,res);
			}
		});
});
app.post('/:schema/add/',function(req,res){
	users.is_login(req,res,function(){
			params['schema']=req.params.schema;
			handlers.add(req,res,params);
		});
});
app.post('/:schema/delete/',function(req,res){
	users.is_login(req,res,function(){
				if(commons.csrf_check(req) == false && config.environment != 'dev'){
					res.status(403).send('Erreur csrf').end();
				}else{
					_conf_params(req.params.schema);
					if( params['schema'] == 'galerie'){
						for(var id in req.body.ids){
							commons.delete_dir(config.UPLOADS_DIR+'/galerie/'+id);
						}
					}
					message='Les éléments '+req.body.ids.split(',').join(',')+' ont été correctement supprimés';
					handlers.delete(req,res,params);
				}
		});
});
app.post('/:schema/confirm/',function(req,res){
	/*--- Configuration schema de l'orm ---*/
	users.is_login(req,res,function(){
			_conf_params(req.params.schema);
			params['template']='confirm';
			handlers.confirm(req,res,params);
		});
});
app.post('/:schema/put/',function(req,res){
	/*--------  verification csrf -------------*/
	users.is_login(req,res,function(){
			if(commons.csrf_check(req) == false && config.environment != 'dev'){
				res.status(403).send('Erreur csrf').end();
			}else{
				_conf_params(req.params.schema);
				if(req.params.schema=='user' && req.body.show_form=='add'){
					/*!*** valide les champs mots de passes ***/
					/*! si pas ok rajoute un champ errors à params ***/
					/*! ce comportement simule une validation type formulaire ***/
					if(!req.body.password || !req.body.confirm || req.body.confirm != req.body.password){
						var error_pwd={	message:'Le mot de passe est invalide.',
										name:'ValidatorError',
										path:'password',
										type:'required',
										value:req.body.password
									};
						params['errors']={password:error_pwd,
										confirm:error_pwd
										};
					}else{
						req.body.password=commons.create_sha1(req.body.password);
					}
				}else if(req.params.schema=='galerie'){
					var rep=config.UPLOADS_DIR+'galeries/'+req.body.id;
					commons.create_dir(rep);
				}
				handlers.put(req,res,params);
			}
		});
});
app.post('/user/chgpwd/',function(req,res){
	users.is_login(req,res,function(){
		console.log(req.body);
		users.chgpwd(req,res);
	});
});
app.get('/:schema/:id/',function(req,res){
	users.is_login(req,res,function(){
			if(req.params.schema == 'galerie'){
				params['populate']={schema:'photo',populate:'photos'};
			}
			_conf_params(req.params.schema);
			handlers.get(req,res,params);
		});
});
app.get('/:schema/',function(req,res){
	users.is_login(req,res,function(){
			_conf_params(req.params.schema);
			handlers.objet(req,res,params);
		});
});

module.exports = app;
