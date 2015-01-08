var mongoose=require('mongoose');
var schema={'userSchema':mongoose.Schema({
							created  : {type:Date,default:Date.now()},
							firstname: {type:String,required:'Un prénom est requis.'},
							lastname : {type:String,required:'Un nom est requis.'},
							email    : {type:String,unique:true,required:'Un email est obligatoire.'},
							password : {type:String,required:'Un mot de passe est obligatoire'},
							role     : {type:String,default:'membre'}
							}),
			'roleSchema':mongoose.Schema({
						created  : {type:Date,default:Date.now()},
						role : {type:String,required:'Un type de role est obligatoire'},
						priorite:{type:Number,required:'Une priorite est obligatoire'},
						})
			}
schema.userSchema.path('firstname').validate(function(val){
									return /^([^0-9]+)+$/.test(val);
									},"Le format du prénom ne correspond pas.");
schema.userSchema.path('lastname').validate(function(val){
									return /^([^0-9]+)+$/.test(val);
									},"Le format du nom de famille ne correspond pas.");
schema.userSchema.path('email').validate(function(val){
									return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(val);
									},"Le format de l'email est invalide");
module.exports=schema;
