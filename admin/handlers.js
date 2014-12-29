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
						model.find().exec(function(err,result){
												cb(err,result);
											});
					}//end liste
				},
				function(err,results){
					if(err){results.liste=[];};
					commons.stop_mongo();
					params['showform']='add';
					__render_admin(req,res,results.liste,objet,params);
				});//fin async
				
	},//fin function objet
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
					}//fin liste
				},
				function(errors,results){
					commons.stop_mongo();
					params['showform']='add';
					__render_admin(req,res,results.liste,new model(),params);
				}
			);//fin async
		}else{
			commons.stop_mongo();
			datas=__create_datas(req,params,model,new model());
			res.json(datas);
		}
	},
	put:function(req,res,params){
		commons.start_mongo();
		var model=commons.create_model(params['schema']);
		/*query sanitize*/
		for(var field in req.body){
			try{
				if(model.schema.paths[field].options.type.name == 'Date'){
					req.body[field]=new Date(req.body[field]);
				}
			}catch(error){
				console.log('internal functional field. %s',field); 
			}
		}
		console.log(req.body);
		/*!************ TRAITE L'UPLOAD *****************/
		if(req.files){
			for(file in req.files){
				commons.upload(req.files[file],'docs');
				req.body.file=req.files[file].originalname;
			}
		}
		async.parallel({
			liste:function(cb){
					model.find().exec(function(error,result){
								if(error){
									cb(error,[]);
								}else{
									cb(error,result);
								}
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
						console.log(objet);
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
							if(invalid){
								objet=objet.toObject();
								req.sessionStore.flash=__create_errors(invalid.errors,objet);
								__render_admin(req,res,results.liste,objet,params);
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
		var model=commons.create_model(req.body.spip);
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
															commons.stop_mongo();
															if(error){
																throw error;
															}else{
																res.send("la modification a ete effectuee "+req.body.field+":"+req.body.value);
															}
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
									console.log("message="+message);
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
					res.json(galerie.photos).end();
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
							commons.imageCrop(name,rep,index,200,200,callback);
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
		commons.start_mongo();
		var model=commons.create_model('photo');
		async.series({
						del    : function(callback){
							model.findOneAndRemove({_id:req.body.id}).exec(function(err,doc){
									if(err){ 
										message=err.message;
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
						photos : function(callback){
							model.find().exec(function(err,list){
								callback(err,list);
							});
						}
					},function(error,results){
						commons.stop_mongo();
						if(error){
							res.send(error.message);
						}else{
							res.json(results.photos);
						}
					});
	}
}// fin module exports
/*!----- retourne le modele desire ou une erreur ---*/

function __render_admin(req,res,liste,objet,params){
	var datas={title:params['espace']+'|Liste des '+params['schema']+'s',
				showform:params['showform'],
				schema:params['schema'],
				form:"/forms/"+params['schema'],
				objet:objet,
				liste:liste,
				ids:(req.body['ids'])?req.body['ids']:null,
				context:commons.contextCreate(req,params['dir'])
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
		if(model.schema.paths[field].options.type.name == 'Date'){
			datas[field]=commons.dateFormat(objet[field]);
		}else{
			datas[field]=objet[field];
		}
	}
	return datas;
}
