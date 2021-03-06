/*!
 * Handlers permettant de manipuler la base de donnée avant rendu html
 * Module admin
 * 
 * */
var orm=require('mongoose');
var schema  = require('./schema');
var config  = require('../config');
var commons = require('commons');
var async   = require('async');
var fs      = require('fs');
var path    = require('path');
var env = config.environment;


module.exports={
	objet:function(req,res,params){
		commons.start_mongo();
		var model=commons.create_model(params['schema']);
		objet=new model();
		async.parallel({
					liste:function(cb){
						if(params['schema']=='galerie'){
							model.find().sort({'order_num':'asc'}).exec(function(err,result){
												cb(err,result);
											});
						}else{
							model.find().sort().exec(function(err,result){
												cb(err,result);
											});
						}
					},//end liste
					count:function(cb){
						model.aggregate({$group:{_id:null,sum:{$sum:1}}}).exec(function(err,result){
											commons.stop_mongo();
											cb(err,result);
										});//fin aggregate
					}//end count
				},
				function(err,results){
					commons.stop_mongo();
					if(err){
						results.liste=[];
					}
					if(params['schema']=='galerie'){
						console.log(results.count[0].sum);
						objet.order_num=results.count[0].sum;
					}
					params['showform']='add';
					__render_admin(req,res,results.liste,objet,params);
				});//fin async
				
	},//fin function objet
	liste:function(req,res,params){
		commons.start_mongo();
		var model=commons.create_model(params['schema']);
		model.find().sort().exec(function(err,result){
									if(err){
										return res.send(err.message);
									}else{
										return res.json(result);
									}
		});
	},//fin function liste
	get:function(req,res,params){
		commons.start_mongo();
		var model=commons.create_model(params['schema']);
		
		if(params['populate']){
			var Photo=commons.create_model(params['populate'].schema);
		}
		
		var id=req.params.id;
		async.parallel({
			liste:function(cb){
				model.find().exec(function(err,result){
											cb(err,result);
									});
				},//end liste
			objet:function(cb){
					if(params['populate']){
						model.findOne({_id:id}).populate(params['populate'].populate).exec(function(err,result){
																				cb(err,result);
																				
																	});
					}else{
						model.findById(id).exec(function(err,result){
												cb(err,result);
										});
					}
				}//end objet
			},
			function(errors,results){
				commons.stop_mongo();
				if(!errors){
					if(!req.xhr){
						params['showform']='edit';
						__render_admin(req,res,results.liste,results.objet,params);
					}else{
						/*console.log(__create_datas(req,params,model,results.objet));*/
						res.json(__create_datas(req,params,model,results.objet));
					}
				}else{
					message=errors.type+" "+errors.message;
					__render_404(req,res,params,message);
				}
			});//fin async
	},//fin function get
	add:function(req,res,params){
		commons.start_mongo();
		var model=commons.create_model(params['schema']);
		if(!req.xhr){
			async.parallel({
				liste:function(cb){
					model.find().exec(function(err,result){
										cb(err,result);
								});
					},//fin liste
				count:function(result,cb){
					model.aggregate({$group:{_id:null,sum:{$sum:1}}}).exec(function(err,result){
											commons.stop_mongo();
											cb(err,result);
										});//fin aggregate
					}//fin count
				},
				function(errors,results){
					commons.stop_mongo();
					params['showform']='add';
					var objet=new model();
					if(params['schema'] == 'galerie'){objet.order_num=results.count[0].sum;};
					__render_admin(req,res,results.liste,objet,params);
				}
			);//fin async
		}else{
			async.waterfall([
				function(cb){
					model.aggregate({$group:{_id:null,sum:{$sum:1}}}).exec(function(err,result){
											cb(err,result);
										});//fin aggregate
				},
				function(result,cb){
					var objet=new model();
					if(params['schema'] == 'galerie'){objet.order_num=result[0].sum};
					datas=__create_datas(req,params,model,objet);
					commons.stop_mongo();
					res.json(datas).end();
				}]);
		}
	},
	put:function(req,res,params){
		commons.start_mongo();
		var model=commons.create_model(params['schema']);
		/*query sanitize*/
		for(var field in req.body){
			try{
				if(model.schema.paths[field].options.type.name == 'Date'){
					req.body[field]=commons.todate(req.body[field]);
				}
			}catch(error){
				console.log('internal functional field. %s',field); 
			}
		}
		/*!************ TRAITE L'UPLOAD *****************/
		if(req.files && params['schema'] != 'galerie'){
			for(file in req.files){
				commons.upload(req.files[file],'docs');
				req.body.file=req.files[file].originalname;
			}
		}
		async.parallel({
			liste:function(cb){
					model.find().exec(function(error,result){
								cb(error,result);
					});
				},
			getDoc:function(cb){
					model.findOne({_id:req.body.id}).exec(function(error,doc){
								cb(error,doc);
					});
				},
			},
			function(err,results){
				if(results.getDoc){
					for(var field in req.body){
						objet=results.getDoc;
						objet[field]=req.body[field];
					}
					params['showform']='edit';
				}else{
					req.body._id=req.body.id;
					objet=new model(req.body);
					params['showform']='add';
				}
				objet.save(function(invalid,doc){
							commons.stop_mongo();
							if(invalid || params['errors']){
								/*objet=objet.toObject({'hide':'_id','transform':true});*/
								if(params['errors']){
									for(var err in params['errors']){
										if(invalid){
											invalid.errors[err]=params['errors'][err];
										}
									}
								}
								req.sessionStore.flash=__create_errors(invalid.errors,objet);
								__render_admin(req,res,results.liste,objet,params);
								/*res.json(params);*/
							}else{
								req.sessionStore.flash="L'enregistrement a été correctement effectué;.";
								res.redirect("/"+params['dir']+"/"+params['schema']+"/");
							}//fin si errors
						});//fin save
			});//fin async
	},//fin fonction put
	confirm:function(req,res,params){
		commons.start_mongo();
		var ids=req.body['ids'].split(',');
		/*console.log(ids);*/
		var model=commons.create_model(params['schema']);
		model.find({_id:{$in:ids}}).exec(function(err,liste){
									commons.stop_mongo();
									if(err){
										throw err;
									}else{
										__render_admin(req,res,liste,new model(),params);
									}
					});
	},//fin function confirm
	delete:function(req,res,params){
		commons.start_mongo();
		var ids=req.body['ids'].split(',');
		var model=commons.create_model(params['schema']);
		model.find({_id:{$in:ids}}).remove().exec(function(err,liste){
									commons.stop_mongo();
									if(err){
										console.log(err);
										message=err.message;
									}else{
										message="les éléments ont été supprimés";
									}
									try{
										req.sessionStore.flash=message;
									}catch(msg_err){
										console.log(msg_err);
									}
									res.redirect("/"+params['dir']+"/"+params['schema']+"/");
								});//end model find
		
	},//end delete
	delete_file:function(req,res){
		var field=req.body.field;
		var id=req.body.id;
		var model=commons.create_model(req.body.schema);
		commons.start_mongo();
		model.find({_id:req.body.id}).remove().exec(function(err,doc){
										commons.stop_mongo();
										var rep=config.UPLOADS_DIR+'docs/';
										try{
											fs.unlinkSync(rep+doc[req.body.field]);
											fs.unlinkSync(rep+'/thumbnails/'+doc[req.body.field].slice(0,-4)+'.png');
											message='la photo '+doc.name+' a été correctement supprimée';
										}catch(error){
											message=error.message;
										}
										res.send(message);
								
								});//end model find
	},
	/*! *** MODULE INLINE ***/
	/*! params -> schema:general, 
	 * 			dir:admin,
	 * 			template:generalites,
	 * 			espace:administration,
	 * 			title:élements géneraux,
	 * 			*/
	inline_show:function(req,res,params){
		commons.start_mongo();
		var model=commons.create_model(params['schema']);
		model.find({}).exec(function(error,liste){
									commons.stop_mongo();
									if(error){
										console.log(error);
									}else{
										res.render(params['dir']+'/'+params['template'],{
													title:params['espace']+'|'+params['title'],
													liste:liste,
													context:commons.contextCreate(req,'admin')
													});
									}
		});
	},//end home
	inline_add:function(req,res,params){
		commons.start_mongo();
		var model=commons.create_model(params['schema']);
		var objet=new model({'type':req.body.type});
		objet.save(function(error){
					if(error){
						commons.stop_mongo();
						console.log(error);
					}else{
						commons.stop_mongo();
						res.send(objet.id).end();
					}
				});
	},
	inline_update:function(req,res,params){
		commons.start_mongo();
		var model=commons.create_model(params['schema']);
		model.findOne({_id:req.body.id}).exec(function(error,doc){
												if(error){
													console.log(error);
													commons.stop_mongo();
												}else{
													doc[req.body.field]=req.body.value;
													doc.save(function(error){
															if(error){
																throw error;
															}else{
																res.send("la modification a ete effectuee "+req.body.field+":"+req.body.value);
															}
															commons.stop_mongo();
														});
												}
											});
			
			
	},
	inline_delete:function(req,res,params){
		commons.start_mongo();
		var model=commons.create_model(params['schema']);
		model.findOneAndRemove({_id:req.body.id}).exec(function(err,doc){
									if(err){
										message=err.message;
									}else{
										message='la clé '+req.body.id+' a été correctement supprimée';
									}
									commons.stop_mongo();
									/*console.log("message="+message);*/
									res.send(message);
								});//end model find
		
	},
	
	/*! *** MODULE GALERIE PHOTOS ***/
	photo_add:function(req,res){
		if(req.files){
			var tab_files=[];
			for(file in req.files){
				tab_files.push(req.files[file]);
			}
			var id=req.body.id;
			var rep='galeries/'+id;
			var galerie=null;
			var nb_photos=0;
			var index=0;
			/*! nested fonction utilisée dans map */
			
			commons.start_mongo();
			var Galerie=commons.create_model('galerie');
			var Photo=commons.create_model('photo');
			Galerie.findOne({_id:req.body.id}).populate('photos').exec(function(error,result){
			/* <<-- contenu callback findOne */
				if(error){
					throw error;
				}
				galerie=result;
				nb_photos=galerie.photos.length-1;
				async.map(tab_files,AsyncCropAndSave,function(err,results){
					commons.stop_mongo();
					res.json(galerie.photos);
				});
			});//fin functionfindOne
			
			function AsyncCropAndSave(file,callback){
				var name=file.originalname;
				async.series([
						function(callback){
							commons.upload(file,rep);
							callback(null,"upload reussi");
							},
						function(callback){
							var src=config.UPLOADS_DIR+rep+"/"+name;
							var dest=config.UPLOADS_DIR+rep+"/thumbnails/"+name;
							commons.imageCrop(name,src,dest,index,200,200,callback);
						},
						function(callback){
							photo=new Photo({name:name,order_num:nb_photos+index,legend:name,_galerie:id});
							photo.save(function(err,success){
								if(err){
									throw err;
								}else{
									galerie.photos.push(photo);
									galerie.save(function(err,success){
												callback(null,photo._id);
												index+=1;
									});
								}
							});
						}
						],function(err,results){
								var objet={'id':results[2],
										'path':results[1].path,
										'name':results[1].name,
										'legend':results[1].name,
										'order_num':results[1].index};
								callback(null,objet);
							});
						index+=1;
			}
		}//fin if request.files
	},//fin methode photo_add
	photo_delete:function(req,res){
		var id_photo=req.body.id_photo;
		var order_num=req.body.order_num;
		var id_galerie=req.body.galerie;
		commons.start_mongo();
		var model=commons.create_model('photo');
		
		async.waterfall([
						function(callback){ /*! fonction servant a trouver le nombre maximal de photos dans une galerie */
							model.find({"_galerie":id_galerie}).exec(function(err,list){
								if(err){
									message=err.message;
								}else{
									callback(err,commons.range(order_num,(list.length-1)));
								}
							});
							
						},
						function(interval,callback){ /*! fonction servant à décaler les autres photos */
							function _save(photo,callback){ /* fonction interne permettant d'enregistrer le chgt du numero d'ordre */
								photo.order_num-=1;
								photo.save(function(err,result){
									if(err){
										console.log("erreur decalage photo="+err.message);
									}else{
										/*console.log("la photo "+photo.order_num+" a été décalée");*/
									}
								});
							}
							model.find({'_galerie':id_galerie,"order_num":{"$in":interval}}).exec(function(err,liste){
								if(err){
									callback(null,false);
								}else{
									if(order_num < interval[1]){
										async.map(liste,_save,function(err,result){
											/*console.log("les photos ont été décalées");*/
										});
									}
									callback(null,true);
								}
								});
						},
						function(result,callback){ /*! fonction servant a supprimer la photo concernée */
							model.findOneAndRemove({_id:id_photo}).exec(function(err,doc){
									if(err){ 
										message=err.message;
										console.log("suppression="+message);
									}else{
										/*! effacement de la photo concernée */
										var rep=config.UPLOADS_DIR+'galeries/'+doc._galerie+'/';
										fs.unlinkSync(rep+doc.name);
										fs.unlinkSync(rep+'/thumbnails/'+doc.name);
										message='la photo '+doc.name+' a été correctement supprimée';
										callback(err,doc);
									}
								});//end model find
						},
						
					]
					,function(error,results){
						if(error){
							commons.stop_mongo();
							res.send(error.message);
						}else{
							model.find({"_galerie":id_galerie}).sort("order_num").exec(function(err,liste_photos){
								commons.stop_mongo();
								res.json(liste_photos);
							});
							
						}
					});
	},//fin methode photo_delete
	/**
	 * methode changeorder
	 * @brief permet de modifier le numero d'ordre des photos dans la base de données
	 * */
	photo_changeorder:function(req,res){
		commons.start_mongo();
		var tableau;
		var initial=parseInt(req.body.initial);
		var final=parseInt(req.body.final);
		/*!** gestion du sens de deplacement **/
		var sens=1;
		if(initial < final ){sens=-1;}
		
		var model=commons.create_model('photo');
		async.waterfall([
			function(callback){
					model.find({'_galerie':req.body.galerie,
								'order_num':{ '$in' : commons.range(initial,final)} }).sort({'order_num':1}).exec(function(error,liste){
																callback(null,liste);
													});
					},
			function(liste,callback){
				function _switchnum(photo,callback){
					photo.order_num=photo.order_num+sens;
					photo.save(function(err,doc){
						/*console.log("la photo "+photo.order_num+" a été décalée");*/
						callback(null,true);
					});
				}
				
				var liste_a_decaler;
				var last;
				
				if(sens == 1){
					liste_a_decaler=liste.slice(0,liste.length-1);
					last=liste[liste.length-1];
				}else{
					liste_a_decaler=liste.slice(1,liste.length);
					last=liste[0];
				}
				
				async.map(liste_a_decaler,_switchnum,function(err,result){
						last.order_num = final;
					last.save(function(err,doc){
						/*console.log("decalage effectué");*/
					});
					if(err){console.log(err.message);}else{res.json("les photos ont été décalées");}
				});
			}
		]);
	}
}// fin module exports
/*!----- retourne le modele desire ou une erreur ---*/

function __render_admin(req,res,liste,objet,params){
	var datas={'title':params['espace']+'|Liste des '+params['schema']+'s',
				'showform':params['showform'],
				'schema':params['schema'],
				'form':"/forms/"+params['schema'],
				'liste':liste,
				'objet':objet,
				'ids':(req.body['ids'])?req.body['ids']:null,
				'context':commons.contextCreate(req,params['dir'])
				};
	res.render(params['dir']+'/'+params['template'],datas);
}

function __render_404(req,res,params,err){
	res.status(404).render('404',{title:"Erreur 404",
										message:err,
										context:commons.contextCreate(req,params['dir'])});
}

function __create_errors(errors,objet){
	objet.errors=[];
	message="<ul id='errors-list'>"
	for(var err in errors){
		message+="<li>"+errors[err].message+"</li>";
		objet.errors.push(err);
	}
	message+="</ul>";
	return message;
}
function __create_datas(req,params,model,objet){
	var datas={id:objet._id,
				csrf_token:commons.contextCreate(req,params['dir']).csrf_token};
	for(var field in objet.toObject()){
		try{
			if(model.schema.paths[field].options.type.name == 'Date'){
				datas[field]=objet[field];
			}else{
				datas[field]=objet[field];
			}
		}catch(err){
			datas[field]=objet[field];
		}
	}
	return datas;
}
function __newOrderValue(schema){
	var commons=require('commons');
	commons.start_mongo();
	var model=commons.create_model(schema);
	async.waterfall([
		function(cb){
				
			}
		,function(result,cb){
			console.log("jaime''"+result[0].sum);
			return result[0].sum;
		}
	]);//fin parralel
}
