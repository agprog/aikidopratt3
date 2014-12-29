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
					model.find().exec(function(error,result){
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

module.exports=app;
