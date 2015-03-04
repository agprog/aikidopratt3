'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('admin.services', [])
    .value('version', '0.1')
    .value('application',{})
    .value('defaultsSrv',{
						'actualite':{safename:'actualité',pluralize:'actualités',title:'',slug:'',content:'',excerpt:'',link_:'',location:'',addres_1:'',addres_2:'',ville:'',date:null,start:null,duration:0,category:'',tags:''},
						'cours':{safename:'cours',pluralize:'cours',title:'',slug:'',content:'',jour:'0',addres_1:'',addres_2:'',ville:''},
						'galerie':{safename:'galerie',pluralize:'galeries photos',title:'',slug:'',legend:'',photos:[],thumbnail:'thumbnail.png',show:false},
						'user':{safename:'utilisateur',pluralize:'utilisateurs',firstname:'',lastname:'',email:'',role:'membre',password:'',confirm:''}
	})
    .factory('postSrv',['$http',function($http){
  	    var post = function(url,params,objet){
							var csrf='csrf_test';
							try{
								csrf=document.querySelector("#csrf_token").value;
								if(params !=""){
									params+='&';
								}
								params+='csrf_token='+csrf;
							}catch(error){
								console.log('csrf test');
							}
							return $http.post(url,params);
				};
		return post;
    }])
    .factory('templateCreateSrv',['$http','$compile',function($http,$compile){
		var content=function(templateUrl,scope,target){
						$http.get(templateUrl)
							.then(function(response){
								$(target).append($compile(response.data)(scope));
							});
					};
		return content;
	}])
	.factory('getSrv',['$http',function($http){
		var gets=function(url,objet){
					return $http.get(url);
		}
		return gets;
	}])
	.service('selectIdSrv',[function(){
		this.tab_ids=function(id,ids){
						var tab=[];
						if(ids != ""){tab=ids.split(",");}
						if(tab.indexOf(id) != -1){
							tab.splice(tab.indexOf(id),1);
						}else{
							tab.push(id);
						}
						return tab;
					};
	}])
	.service('fillFormSrv',['postSrv','$q',function(postSrv,$q){
		this.addForm=function(event,objet){
			event.preventDefault();
			var post=postSrv('/admin/'+objet+'/add/',"",objet);
				post.success(function(jdatas){
					console.log(jdatas);
					document.querySelector("#id").value=jdatas._id;
					document.querySelector("#csrf_token").value=jdatas.csrf_token;
					document.querySelector("#confirm_csrf").value=jdatas.response.csrf_token;
				});
			}
			/*this.addForm=function(event,objet){
				event.preventDefault();
				var post=postSrv('/admin/'+objet+'/add/',"",objet);
				post.success(function(jdatas){
					var form=new Datas("#"+objet+"-form");
					form.fill(jdatas);
				});
			},
			this.addFormPromise=function(event,objet){
				event.preventDefault();
				/*var deferred=$q.defer();
				var post=postSrv('/admin/'+objet+'/add/',"",objet);
				post.success(function(jdatas){
								deferred.resolve(true);
								var form=new Datas("#"+objet+"-form");
								form.fill(jdatas);
							})
					.error(function(msg,code){
								deferred.reject(false);
								$log(msg);
								});
					return deferred.promise;
		};*/
		
	}])
	.service('uploadSrv',['$http',function($http){
		this.post=function(url,datas){
					if(typeof FormData === "undefined"){
						alert("Erreur, votre navigateur ne peut pas être utilisé pour ce type d'upload");
						throw new Error("FormData is not implemented");
					}else{
						return $http.post(url, datas, {
									transformRequest: angular.identity,
									headers: {'Content-Type': undefined}
									});
					}
				};
		
	}]);
