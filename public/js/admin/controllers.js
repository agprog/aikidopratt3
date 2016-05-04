'use strict';
/*!*******************************************************
* ****************   CONTROLLERS ADMIN                ****
 
**********************************************************/

angular.module('admin.controllers',[])
	.controller('TestCtl',['$scope',function($scope){
		$scope.test="TESTDATAS";
	}])//fin TestCtl

	.controller('MainCtl',['$scope','postSrv','selectIdSrv','getSrv','fillFormSrv','defaultsSrv',function($scope,postSrv,selectIdSrv,getSrv,fillFormSrv,defaultsSrv){
		$scope.test='main';
		/*! *** raz scope *** */
		$scope.nb_ids=0;
		$scope.ids="";
		$scope.reverse=false;
		//initialisation de l'objet vide
		$scope.showform='add';
		$scope.schema=$("#schema").val();
		$scope.safename=defaultsSrv[$scope.schema].safename;
		$scope.pluralize=defaultsSrv[$scope.schema].pluralize;
		$scope.form_title='Ajouter '+$scope.safename;
		$scope.messageshow=false;
		$scope.confirmshow=false;
		/*if($(".error").length > 0){*/
		$scope.objet=defaultsSrv[$scope.schema];
		if(window.content!=null){
			for(var field in window.content){
				if($scope.objet[field] !== 'undefined'){
					$scope.objet[field]=window.content[field];
				}
			}
		}
		/*}else{
			
		}*/
		console.log($scope.objet);
		$scope.liste=[];
		$scope.sort='created';
		
		getSrv("/admin/liste/"+$scope.schema)
		.success(function(response){
				$scope.csrf_token=$("input[name='csrfmiddlewaretoken']").val();
				$scope.liste=response;
		});
		/*!*** */
		/*! *** Retour après selection d'un élément pour une action ***/
		/*! *** en lot. *** */
		/*!*** */
		$scope.select_elt=function(id){
			console.log(id);
			var tab_ids=selectIdSrv.tab_ids(id,$scope.ids);
			$scope.ids=tab_ids.join(',');
			$scope.nb_ids=tab_ids.length;
		};// fin select_elt
		
		/*!*** */
		/*! *** Remplit formulaire avec données  ***  */
		/*!*** */
		$scope.add=function($event,objet){
			$scope.objet=defaultsSrv[$scope.schema];
			$scope.showform='add';
			$scope.form_title='Ajouter '+$scope.safename;
			fillFormSrv.addForm($event,$scope.objet,objet);
			
		};// fin remplissage formulaire
		/*!** */
		/* *** */
		/*! *** CheckVal change la valeur d'un input type checkbox car angular a du mal a gerer'
		 *! *** */
		 
		$scope.check_val=function(event){
			var elt=document.getElementById('visible');
			if(event.target.checked){
				elt.setAttribute('value',true);
			}else{
				elt.setAttribute('value',false);
			}
		};
		/*! *** Get recupere un objet *** */
		/*! *** */
		
		$scope.getObjet=function($event){
			$event.preventDefault();
			getSrv($event.target.getAttribute('href'))
			.success(function(response){
				$scope.showform='edit';
				$scope.form_title='Modifier '+$scope.safename;
				$scope.id=response.id;
				$("#id").val(response.id);
				$("#csrf_token").val(response.csrf_token);
				$scope.objet=response;
			});
		};
		/*! *** fonction de filtre sur les entetes de tableau
		 * */
		$scope.order=function(field){
			$scope.sort=field;
			if($scope.reverse){
				$scope.sort="-"+$scope.sort;
				$scope.reverse=false;
				$(".fleche-down").removeClass("fleche-down").addClass("fleche-up");
			}else{
				$scope.reverse=true;
				$(".fleche-up").removeClass("fleche-up").addClass("fleche-down");
			}
		}
		/*! *** fonction de confirmation avant supression
		 * */
		$scope.confirmObjet=function($event,id){
			$event.preventDefault();
			var params = "ids="+id;
			postSrv($event.target.getAttribute('href'),params)
			.success(function(response){
				$("html").empty().html(response);
			});
		}
	}])//fin mainCtl
	.controller('GeneralitesCtl',['$scope','postSrv',function($scope,postSrv){
		var objet="general";
		$scope.msg='';
		$scope.messageshow=false;
		$scope.confirmshow=false;
		$scope.generaliteUpd=function(event,key){
			event.preventDefault();
			var params  =   "id="+event.target.id.substr(4,event.target.id.length)+
							"&field="+key+
							"&value="+event.target.value;
			$scope.resp="";
			var post=postSrv('/admin/generalite/update/',params,'general');
			post.success(function(response){
					$scope.resp=response;
				})
				.error(function(error){
					$scope.resp='erreur';
					console.log(error);
				});
		};
		$scope.generaliteConfirm=function(event){
			event.preventDefault();
			var id=event.target.getAttribute('data-id');
			$scope.confirmshow=true;
			$scope.confirm_id=id;
			$scope.confirm_key='cle';
		};
		$scope.generaliteConfAbort=function(){
			$scope.confirmshow=false;
		};
		$scope.generaliteDelete=function(event){
			var id=event.target.getAttribute("data-id");
			var params= "id="+id;
			var post=postSrv('/admin/generalite/delete/',params,'general');
			$scope.messageshow=true;
			$scope.confirmshow=false;
			post.success(function(response){
					try{
						var elt=document.getElementById("general-"+id);
						elt.parentNode.removeChild(elt);
						
					}catch(error){
						console.log('environnement de test ou erreur DOM');
					}
					$scope.msg=response;
				})
				.error(function(error){
					$scope.msg=error;
				});
		};
	}])
	.controller('GaleriesCtl',['$scope','postSrv',function($scope,postSrv){
		/*!*** deletephoto ***/
		$scope.deletePhoto=function($event){
			/*$event.preventDefault();*/
			var id_photo=$event.target.getAttribute('data-id');
			var order_num=$event.target.getAttribute('data-order');
			var id_galerie=$event.target.getAttribute("data-galerie");
			var name=$event.target.getAttribute('data-name');
			postSrv('/admin/galerie/photo/delete/','id_photo='+id_photo+'&order_num='+order_num+'&galerie='+id_galerie)
			.success(function(response){
				$scope.isloading=false;
				$scope.msg="La photo a été correctement supprimée."
				$scope.objet.photos=response;
			})
			.error(function(error){
				console.log(error);
			});
		};//fin deletePhoto
		/*! *** update legend *** */
		$scope.updatePhoto=function($event){
			$event.preventDefault();
			var id=$event.target.getAttribute('data-id');
			var value=$event.target.value;
			var field=$event.target.getAttribute('data-field');
			postSrv('/admin/galerie/photo/update/','id='+id+'&field='+field+'&value='+value)
			.success(function(response){
				$scope.msg="La photo a été mise à jour."
			})
			.error(function(error){
				console.log(error);
			});
		};//fin updatePhoto
	}])
	.controller('AddFormCtl',['$scope',function($scope){
		var objet="actualite";
		/*document.querySelector("#objet").value;*/
		/*addform(parametres,objet).success(function(jdatas){
						$scope.form=$sce.trustAsHtml(jdatas.form);
		});*/
		$scope.test='ADDFORM';
	}])//fin AddFormCtl
	.controller('PutObjetCtl',['$scope',function($scope){
		$scope.test='PUTOBJET';
		
	}])//fin PutObjetCtl
	.controller('GetObjetCtl',['$scope',function($scope){
		$scope.test='GETOBJET';
	}])//fin getObjetClt
	.controller('PostObjetCtl',['$scope',function($scope){
		/*! initialisation du formulaire de la fenetre */
		$scope.test='POSTOBJET';
	}])//fin PostObjetCtl
	.controller('DeleteObjetCtl',['$scope',function($scope){
		/*! initialisation du formulaire de la fenetre */
		$scope.test='DELETEOBJET';

	}]);//fin DeleteObjetCtl
