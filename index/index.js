var config = require('../config');
var express = require('express');
var commons=require('commons');
var router = express.Router();
var async=require('async');
var app=express();

/* GET home page. */

app.get('/', function(req, res) {
  debugger;
  res.render('index', {title: 'Association Pratt Nancy',
					   context:commons.contextCreate(req,'index')
						});
  
});
app.get('/init/:schema/',function(req,res){
	commons.start_mongo();
	var model=commons.create_model(req.params['schema']);
	switch(req.params['schema']){
		case 'actualite':
				model.find().sort({date:'desc'}).exec(function(error,results){
					commons.stop_mongo();
					if(error){
						res.send(500);
					}else{
						res.json(results);
						
					}
				});
					break;
		case 'galerie':
				var Photo=commons.create_model('photo');
				model.find().populate('photos').exec(function(error,results){
					commons.stop_mongo();
					if(error){
						res.send(500);
					}else{
						res.json(results);
					}
				});
				break;
		default:
			res.send(500);
	}
});
app.get('/init/',function(req,res){
	commons.start_mongo();
	var model=null;
	async.parallel({generalites:function(callback){
					model=commons.create_model('general');
					model.find().exec(function(error,result){
						if(!error){
							var resultA={};
							for(var elt in result){
								resultA[result[elt].cle]=unescape(result[elt].valeur);
							}
						}
						callback(error,resultA);
					});
				},
				actualites:function(callback){
					model=commons.create_model('actualite');
					model.find().sort({date:'desc'}).exec(function(error,result){
						callback(error,result);
					});
				},
				cours:function(callback){
					model=commons.create_model('cours');
					model.find().exec(function(error,result){
						callback(error,result);
					});
				},
				galeries:function(callback){
					model=commons.create_model('galerie');
					Photo=commons.create_model('photo');
					model.find().populate('photos').exec(function(error,result){
						callback(error,result);
					});
				}},
				function(error,results){
					commons.stop_mongo();
					if(error){
						console.log(error.message);
						res.send(500);
					}else{
						res.json(results);
					}
					});//end async.parrallel
});
app.get('/actualites/:date',function(req,res){
	var date=req.params.date;
	commons.start_mongo();
	var actualite=commons.create_model('actualite');
	actualite.find({date:date}).exec(function(error,results){
		if(error){
			console.log(error);
			res.json({id:'error'});
		}else{
			res.json({id:results[0]._id});
		}
	});
});
app.get('/actualites/',function(req,res){
	commons.start_mongo();
	var actualite=commons.create_model('actualite');
	actualite.find().exec(function(error,results){
		if(error){
			res.send(500);
		}else{
			res.render('actualites',{title: 'Actualites',
									actualites:results,
									context:commons.contextCreate(req,'index')
									})
		}
	});
});
app.get('/galeries/',function(req,res){
	commons.start_mongo();
	var Galerie=commons.create_model('galerie');
	var Photo=commons.create_model('photo');
	Galerie.find().populate('photos').exec(function(error,results){
		if(error){
			res.send(500);
		}else{
			res.render('galeries',{title:'Galeries photos',
									galeries:results,
									context:commons.contextCreate(req,'index')
									});
		}
	});
});
app.get('/galeries/:id',function(req,res){
	commons.start_mongo();
	var Galerie=commons.create_model('galerie');
	var Photo=commons.create_model('photo');
	Galerie.findOne({_id:req.params.id}).populate('photos').exec(function(error,result){
		if(error){
			res.send(500);
		}else{
			console.log(result);
			res.render('galerie',{title:'Galeries photos',
									galery:result,
									context:commons.contextCreate(req,'index')
									});
		}
	});
});
app.get('/contact/',function(req,res){
	var contact={firstname:'',
				lastname:'',
				email:'',
				subject:'',
				content:''
			};
	var texte="<div><p>Pour nous contacter, plusieurs solutions : et pouvoir appréhender notre travail, le mieux est de venir nous \
	voir pendant les séances qui sont dispensées à Nancy, Laxou et Saulxures lès Nancy. (Voir les onglets \
	cours sur la page d'accueil.)</p><p>Si vous voulez monter sur le tatami pour essayer, merci de venir \
	en bas de survêtement pour être à votre aise lors de l'execution des mouvements.</p>"
	res.render('contact',{title:'Contact',
						contact:contact,
						texte:texte,
						context:commons.contextCreate(req,'index')
						});
});
app.post('/send/',function(req,res){
	var contact={'firstname':'',
				'lastname':'',
				'email':'',
				'subject':'',
				'content':'',
				'errors':new Array()
				};
	var validators={firstname:{fr:'prénom',required:true,pattern:/^([^0-9]+)+$/},
					lastname:{fr:'nom',required:true,pattern:/^([^0-9]+)+$/},
					email:{fr:'email',required:true,pattern:/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/},
					content:{fr:'message',required:true,pattern:''}
				}
	var errors=[];
	if(commons.csrf_check(req) == false){
		res.status(403).send('Erreur csrf').end();
	}else{
		for(var field in contact){
			var message;
			var error=false;
			if(field != 'errors'){
				try{
					if(validators[field].required == true && !req.body[field] == true){
						error=true;
						message="le champ "+validators[field].fr+" doit être renseigné.";
					}
					if(error==false && validators[field].pattern != ''){
						if(validators[field].pattern.test(req.body[field])==false && !req.body[field] == false){
							error=true;
							message="le champ "+validators[field].fr+" n'a pas le format spécifié.";
						}
					}
					if(error){
						var elt={};elt[field]={message:message};
						errors.push(elt);
						contact['errors'].push(field);
					}else{
						contact[field]=req.body[field];
					}
				}catch(e){
					console.log(e);
					contact[field]=req.body[field];
				}
			}
		}//fin for
		/*!-------- envoi de l'email ou renvoi formulaire -------------*/
			var texte="<div><p>Pour nous contacter, plusieurs solutions : et pouvoir appréhender notre travail, le mieux est de venir nous \
			voir pendant les séances qui sont dispensées à Nancy, Laxou et Saulxures lès Nancy. (Voir les onglets \
			cours sur la page d'accueil.)</p><p>Si vous voulez monter sur le tatami pour essayer, merci de venir \
			en bas de survêtement pour être à votre aise lors de l'execution des mouvements.</p>"
			if(contact.errors.length > 0){
				var message="<ul id='errors-list'>";
				for(var err in errors){
					for(var key in errors[err]){
						message+="<li>"+errors[err][key].message+"</li>";
					}
				}
				message+="</ul>";
				req.sessionStore.flash=message;
				res.render('contact',{title:'Contact',
									contact:contact,
									texte:texte,
									context:commons.contextCreate(req,'index')
									});
			}else{
				/* **** on envoie le mail  ****/
				(!req.body.subject)?subject='pas de sujet':subject=req.body.subject;
				var mail=require('nodemailer');
				var smtp=require('nodemailer-smtp-transport');
				var transporter=mail.createTransport(smtp({
					service:config.MAIL_SERVICE,
					auth:{
						user:config.MAIL_USER,
						pass:config.MAIL_PASS
					}
					}));
				var content=req.body.firstname+" "+req.body.lastname+" <"+req.body.email+"> a écrit : \n"+
							req.body.content;
							
				var mailOptions={
					from:req.body.email,
					to:config.MAIL_USER,
					replyTo:req.body.email,
					subject:subject,
					text:escape(content),
					html:content
					};
				transporter.sendMail(mailOptions,function(error,info){
					if(error){
						var message="Une erreur a été rencontrée lors de l'envoi, \
									merci de vérifier votre adresse email et réessayer.\n"+
									error.message;
									;
						req.sessionStore.flash=message;
						res.render('contact',{title:'Contact',
									contact:contact,
									texte:texte,
									message:message,
									context:commons.contextCreate(req,'index')
									});
					}else{
						req.sessionStore.flash="Votre message a correctement été envoyé, \
												nous y répondrons le plus rapidement possible.";
						res.redirect('/contact/');
					}
				});
			}
	}//fin csrf check
});
module.exports=app;
