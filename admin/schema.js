var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var schema={
	generalSchema   : mongoose.Schema({
								cle    : {type:String,default:''},
								type   : {type:String,default:'input'},
								valeur : {type:String,default:''}
						}),
	actualiteSchema : mongoose.Schema({
								created  : {type:Date,default:Date.now()},
								title    : {type:String,default:"",
											required:'Un titre est requis pour une actualité'},
								slug     : {type:String,default:"",
											required:'Un raccourci est requis pour une actualité'},
								content  : {type:String,default:''},
								excerpt  : {type:String,default:''},
								link_    : {type:String,default:''},
								file     : {type:String,default:''},
								location : {type:String,default:''},
								coordonnates : {type:String,default:''},
								date     : {type:Date,date:true},
								start    : {type:String},
								duration : {type:Number,default:1},
								category : {type:String,default:''},
								tags     : {type:String,default:''}
								}),

	coursSchema     : mongoose.Schema({
								created : {type:Date,default:Date.now()},
								title   : {type:String,default:''},
								slug    : {type:String,default:''},
								day     : {type:String,default:'lundi'},
								start   : {type:String,default:''},
								end: {type:String,default:''},
								location: {type:String,default:'Salle'},
								adress_1: {type:String,default:''},
								adress_2: {type:String,default:''},
								ville:    {type:String,default:''},
								telephone:{type:String,default:''},
								coordonnates : {type:String,default:''}
							}),
	themeSchema		: mongoose.Schema({
								value: {type:String,default:''}
								}),
	photoSchema		: mongoose.Schema({
									name    : {type:String,default:''},
									order_num:{type:Number,default:0},
									legend  : {type:String,default:''},
									_galerie : {type:Schema.Types.ObjectId,ref:'galerie'}
								}),
 	galerieSchema	: mongoose.Schema({
								created : {type:Date,default:Date.now()},
								title   : {type:String,default:''},
								theme   : {type:String,default:''},
								slug    : {type:String,default:''},
								legend  : {type:String,default:''},
								path    : {type:String,default:''},
								photos  : [{type:Schema.Types.ObjectId,ref:'photo'}]
 							})
 	};//schema
schema.actualiteSchema.path('title').validate(function(val){return val != "";},"Un titre est requis.");
schema.actualiteSchema.path('slug').validate(function(val){return val != "";},"Un slug doit être renseigné.");
module.exports=schema;
