'use strict';

/* Directives */


angular.module('admin.directives', []).
	directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
	}])
	.directive('delFile',['postSrv',function(postSrv){
		return {
			scope:{
				name:'@'
			},
			restrict:'A,E',
			replace:true,
			template:'<input type="button"  id="{{name}}" name="{{name}}" value="supprimer" />',
			link:function(scope,element,attrs){
				element.on('click',function(){
					var id=document.querySelector("#id").value;
					var spip=document.querySelector("#spip").value;
					var name=scope.name;
					var params="id="+id+
							"&spip="+spip+
							"&field="+scope.name;

					postSrv('/admin/deletefile/',params)
						.success(function(response){
							console.log("le fichier a été retiré correctement de la base de données.");
							document.querySelector("#"+scope.name).value="";
						 })
						 .error(function(error){
							 console.log(error);
						});
				});
			}//fin function link
		};
	}])
	.directive('addGenInput',function(){
		return {
			restrict:'A,E',
			replace:true,
			transclude: true,
			template:'templates/input_general.html'
		}
	})
	.directive('addGenText',function(){
		return{
			restrict:'A,E',
			replace:true,
			transclude:true,
			templateUrl:'templates/text_general.html'
		}
	})
	.directive('addGenField',['$http','$compile','postSrv',function($http,$compile,postSrv){
		return {
			restrict: 'A,E',
			replace: true,
			transclude: true,
			template: '<input id="add-field" type="button" value="Ajouter un champs"/>',
			link: function (scope, element, attrs) {
				// DOM manipulation/events here!
				element.bind('click',function(){
					//on cree la nouvelle entree dans la base
					postSrv("/admin/generalite/add/","type="+scope.typefield,'general').success(function(response){
																		scope.id=response;
																	});
					//on cree le nouveau template dans la page
					$http.get("/static/js/admin/templates/"+scope.typefield+"_general.html")
							.then(function(response){
								$("#liste-generalites").append($compile(response.data)(scope));
							});
					
				});
			}
		}
	}])
	.directive('confirmWindow',['$http','$compile',function($http,$compile){
		return{
			restrict:'E',
			transclude:true,
			replace:true,
			templateUrl:'/static/js/admin/templates/confirm.html'
		}
		}])
	.directive('noEnterKey',function(){
		return{
			link:function(scope,element,attrs){
				element.bind('keypress',function(event){
					if(event.which == 13){
						event.preventDefault();
					}
				});
			}
		};
	})
	.directive('addPhoto',['uploadSrv',function(uploadSrv){
		return{
			restrict:'A,E',
			transclude:true,
			replace:true,
			templateUrl:'/static/js/admin/templates/add_photo.html',
			link:function(scope,element,attrs){
				element.bind('submit',function(event){
					event.preventDefault();
					scope.isloading=true;
					var input=document.querySelector("#input-photos");
					if(input.files.length > 0 && typeof(FormData) !== "undefined"){
						var datas=new FormData();
						datas.append('id',scope.id);
						for(var index in input.files){
							datas.append(index,input.files[index]);
						}
						uploadSrv.post('/admin/galerie/photo/add/',datas)
								.success(function(response){
									scope.isloading=false;
									scope.objet.photos=response;
								})
								.error(function(errors){
									$scope.isloading=false;
								});
					}else{
				
					}
				});
			}
		}
		}]);
