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
		//initialisation de l'objet vide
		$scope.showform='add';
		$scope.schema=document.getElementById("schema").value;
		$scope.safename=defaultsSrv[$scope.schema].safename;
		$scope.pluralize=defaultsSrv[$scope.schema].pluralize;
		$scope.form_title='Ajouter '+$scope.safename;
		$scope.objet=defaultsSrv[$scope.schema];
		/*!*** */
		/*! *** Retour après selection d'un élément pour une action ***/
		/*! *** en lot. *** */
		/*!*** */
		$scope.select_elt=function(id){
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
			fillFormSrv.addForm($event,objet);
			
		};// fin remplissage formulaire
		/*!** */
		/* *** */
		/*! *** CheckVal change la valeur d'un input type checkbox car angular a du mal a gerer'
		 *! *** */
		$scope.check_val=function($event){
			var elt=document.getElementById('visible');
			if($event.target.checked){
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
	.controller('GaleriesCtl',['$scope','getSrv','postSrv','defaultsSrv','fillFormSrv',function($scope,getSrv,postSrv,defaultsSrv,fillFormSrv){
		$scope.msg="";
		$scope.nb_ids="0";
		$scope.ids="";
		//initialisation de l'objet vide
		$scope.objet=defaultsSrv['galerie'];
		$scope.isloading=false;
		$scope.showform='add';
		$scope.safename=defaultsSrv['galerie'].safename;
		$scope.pluralize=defaultsSrv['galerie'].pluralize;
		$scope.form_title='Ajouter '+$scope.safename;
		/*!*** */
		/*! *** Retour après selection d'un élément pour une action ***/
		/*! *** en lot. *** */
		/*!*** */
		$scope.select_elt=function(id){
			var tab_ids=selectIdSrv.tab_ids(id,$scope.ids);
			$scope.ids=tab_ids.join(',');
			$scope.nb_ids=tab_ids.length;
		};// fin select_elt
		
		/*!*** */
		/*! *** Remplit formulaire avec données  ***  */
		/*!*** */
		$scope.add=function($event,objet){
			$scope.id=objet._id;
			$scope.objet=defaultsSrv[$scope.schema];
			$scope.showform='add';
			$scope.safename=defaultsSrv['galerie'].safename;
			$scope.form_title='Ajouter '+$scope.safename;
			fillFormSrv.addForm($event,objet);
		};// fin remplissage formulaire
		
		$scope.check_val=function($event){
			var elt=document.getElementById('show');
			if($event.target.checked){
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
				$scope.id=response.id;
				$scope.addgalerie=false;
				$scope.showform='edit';
				$scope.form_title='Modifier '+$scope.safename;
				$("#id").val(response.id);
				$("#csrf_token").val(response.csrf_token);
				$("#confirm_csrf").val(response.csrf_token);
				$scope.objet=response;
			});
			
		};//fin get
		/*!*** deletephoto ***/
		$scope.deletePhoto=function($event){
			/*$event.preventDefault();*/
			var id=$event.target.getAttribute('data-id');
			var name=$event.target.getAttribute('data-name');
			postSrv('/admin/galerie/photo/delete/','id='+id)
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
			postSrv('/admin/galerie/photo/update/','id='+id+'&field=legend&value='+value)
			.success(function(response){
				$scope.msg="La photo a été mise à jour."
			})
			.error(function(error){
				console.log(error);
			});
		};
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
