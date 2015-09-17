
var mongoose=require('mongoose');
var Schema=mongoose.Schema;

function dateToStr(value){
	var commons=require('commons');
	return commons.datetostr(value);
}
var schema={
	
	generalSchema   : mongoose.Schema({
								cle    : {type:String,default:''},
								type   : {type:String,default:'input'},
								valeur : {type:String,default:''}
						}),
	actualiteSchema : mongoose.Schema({
								created  : {type:Date,default:Date.now(),get:dateToStr},
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
								date     : {type:Date,get:dateToStr},
								start    : {type:String},
								duration : {type:Number,default:1},
								category : {type:String,default:''},
								tags     : {type:String,default:''},
								visible  : {type:Boolean,default:true}
								}),

	coursSchema     : mongoose.Schema({
								created : {type:Date,default:Date.now(),get:dateToStr},
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
								created : {type:Date,default:Date.now(),get:dateToStr},
								order_num:{type:Number,default:0},
								title   : {type:String,default:''},
								theme   : {type:String,default:''},
								slug    : {type:String,default:''},
								thumbnail: {type:String,default:''},
								legend  : {type:String,default:''},
								path    : {type:String,default:''},
								show    : {type:Boolean,default:true},
								photos  : [{type:Schema.Types.ObjectId,ref:'photo'}]
 							}),
 	userSchema		: mongoose.Schema({
							created  : {type:Date,default:Date.now(),get:dateToStr},
							firstname: {type:String,required:'Un prénom est requis.'},
							lastname : {type:String,required:'Un nom est requis.'},
							pseudo   : {type:String,required:'Un pseudo est requis.'},
							email    : {type:String,unique:true,required:'Un email est obligatoire.'},
							password : {type:String,required:'Un mot de passe est obligatoire'},
							role     : {type:String,default:'membre'}
							}),
 	};//schema

schema.actualiteSchema.path('title').validate(function(val){return val != "";},"Un titre est requis.");
schema.actualiteSchema.path('slug').validate(function(val){return val != "";},"Un slug doit être renseigné.");
schema.actualiteSchema.set('toObject',{getters:true});
schema.actualiteSchema.set('toJSON',{getters:true});
schema.coursSchema.set('toJSON',{getters:true});
schema.coursSchema.set('toObject',{getters:true});
schema.userSchema.set('toObject',{getters:true});
schema.userSchema.set('toJSON',{getters:true});
schema.galerieSchema.path('thumbnail').validate(function(val){return val !=""},"Une vignette est requise pour illustrer la galerie.");
schema.galerieSchema.set('toObject',{getters:true});
schema.galerieSchema.set('toJSON',{getters:true});


schema.userSchema.path('firstname').validate(function(val){
									return /^([^0-9]+)+$/.test(val);
									},"Le format du prénom ne correspond pas.");
schema.userSchema.path('lastname').validate(function(val){
									return /^([^0-9]+)+$/.test(val);
									},"Le format du nom de famille ne correspond pas.");
schema.userSchema.path('email').validate(function(val){
									return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(val);
									},"Le format de l'email est invalide");
schema.userSchema.virtual('title').get(function () {
  return this.firstname + ' ' + this.lastname;
});
module.exports=schema;
