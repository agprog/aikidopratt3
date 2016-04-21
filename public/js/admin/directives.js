'use strict';

/* Directives */


angular.module('admin.directives', []).
	directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
	}])
	.directive('agdragdrop',['$http',function($http){
		return{
			scope:false,
			replace:false,
			link:function(scope,element,attrs){
				var position=-1;
				var initial=-1; /*!** position initiale <integer>**/
				var onwork=false;
				var ondrag=false;
				/*! definit la fonction dataTransfert dans les evenements jQuery*/
				jQuery.event.props.push('dataTransfer');
				/*! cherche et attribue la  classe elt aux elements du tableau */
				
				scope.$watch('objet',function(){
					/*! wrap les elements par leurs positions respectives */
					
					jQuery("#hidden-cell").remove();
					
					/*! préparation des éléments concernés dans la page */
					
					var elts=element.children();
					elts.attr('draggable','draggable');
					elts.addClass('elt');
					jQuery(elts).wrap(function(ind){return "<div id='cell-"+ind+"' class='cell' data-position='"+ind+"'></div>"});
					element.append("<div id='hidden-cell' style='display:none;'></div>");
					   /*!** position dynamique de l'element au cours du drag **/
					elts.find("img").on({'dragstart':function(event){
													event.target.preventDefault();
												}});
					elts.on({'dragstart':function(event){
											event.stopPropagation();
											if(ondrag==false){
												position=jQuery(event.currentTarget).parent().attr('data-position');
												initial=position;
												event.dataTransfer.effectAllowed='move';
												event.dataTransfer.clearData("Text");
												event.dataTransfer.setData("Text",this.id);
												event.dataTransfer.setDragImage(event.target,0,0);
												ondrag=true;
											}
											return true;
						
											},
								'dragenter':function(event){
											/*event.preventDefault();*/
											event.stopPropagation();
											/** 
											* @brief  la fonction shift permet de décaler 
											* les éléments au moment du drag and drop
											*/   
											var shift=function(direction){
													jQuery("#hidden-cell").html(jQuery("#cell-"+slidebegin).children()[0]);
													if(direction>0){ 
														for(var i=slidebegin;i<slideend;i++){  
														   jQuery("#cell-"+i).html(jQuery("#cell-"+(i+1)).children()[0]);   
														}
													}else if(direction<0){
														for(var i=slidebegin;i>slideend;i--){ 
														   jQuery("#cell-"+i).html(jQuery("#cell-"+(i-1)).children()[0]);   
														}
													}
													jQuery("#cell-"+slideend).html(jQuery("#hidden-cell").children()[0]);
													
											}//end of shift
											if(onwork == false){
												onwork=true;
												var target=jQuery(event.currentTarget).parent();
												var slidebegin=parseInt(position);
												var slideend=parseInt(target.attr('data-position'));
												
												if(slideend != slidebegin){
													shift(slideend-slidebegin);
													return true;
												}else{
													onwork=false;
													return false;
												}
											}
											},
								'dragleave':function(event){
										var target=jQuery(event.currentTarget);
										if(position != target.attr("data-position") && onwork==true){
											position = target.parent().attr("data-position");
											onwork=false;
										};
										event.preventDefault();
										event.stopPropagation();
										return true;
								},
								'dragover':function(event){
										event.preventDefault();
										return false;
										}
								});
					element.find(".cell").on('drop',function(event){
													event.preventDefault();
													event.stopPropagation();
													/*console.log(event.dataTransfer.getData("Text"));*/
													var target=jQuery(event.currentTarget)
													var final=parseInt(target.attr('data-position'));
													var csrf_token=jQuery("input[name='csrf_token']").val();
													var id_galerie=jQuery("input[name='id']").val();
													if(initial !="NaN" && final !="NaN" && initial != final){
														$http.post("/admin/galerie/changeorder","csrf_token="+csrf_token+
																							"&galerie="+id_galerie+
																							"&initial="+initial+
																							"&final="+final).success(function(response){
																														console.log(response);
																													});
													}
													ondrag=false;
													return false;
										 });
				}); //end of watch
			}// end of link
			
		}
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
					var schema=document.querySelector("#schema").value;
					var name=scope.name;
					var params="id="+id+
							"&schema="+schema+
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
			templateUrl:'/static/js/admin/templates/input_general.html'
		}
	})
	.directive('addGenText',function(){
		return{
			restrict:'A,E',
			replace:true,
			transclude:true,
			templateUrl:'/static/js/admin/templates/text_general.html'
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
	.directive('chgPwd',['postSrv',function(postSrv){
		return{
			restrict:'A,E',
			replace:true,
			templateUrl:'/static/js/admin/templates/chgpwd.html',
			link:function(scope,element,attrs){
				scope.error="";
				element.find('#no').on('click',function(event){
					scope.chgpwd=false;
				});
				element.find('#yes').on('click',function(event){
					var parametres='id='+document.querySelector('#id').value+
					'&password='+document.querySelector('#chgpassword').value+
					'&confirm='+document.querySelector('#chgconfirm').value;
					postSrv('/admin/user/chgpwd/',parametres).success(function(response){
						console.log(response);
						if(response.error == true){
							scope.error=response.message;
						}else{
							scope.chgpwd=false;
							$("#message").html(response.message);
						}
					});
				});
			}
		}
	}])
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
									$("#input-photos").val("");
								})
								.error(function(errors){
									scope.isloading=false;
								});
					}else{
						return false;
					}
				});
			}
		}
		}])
		.directive('connect',function(){
			return{
				restrict:'A,E',
				scope:{log:'@'},
				transclude:true,
				replace:true,
				templateUrl:"/static/js/admin/templates/connect.html",
				link:function(scope,element,attrs){
					var timer;
					function isLoaded(){
						try{
							document.querySelector('#menu-principal').style.top='30px';
							clearInterval(timer);
							element.find('#connect-block').on('mouseover',function(event){
								
								this.style.height='90px';
							});
							element.find('#connect-block').on('mouseleave',function(event){
								this.style.height='30px';
							});
						}catch(error){
							console.log('connect pending');
						}
					}
					timer=setInterval(isLoaded,10);
				}
			}
		});
