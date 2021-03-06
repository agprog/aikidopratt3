'use strict';
/*!*******************************************************
* ****************   CONTROLLERS index                ****
 
**********************************************************/

angular.module('index.controllers',[])
	.controller('TestCtl',['$scope',function($scope){
		$scope.test="INDEXTESTDATAS";
	}])//fin TestCtl

	.controller('IndexCtl',['$scope','$sce','getSrv',function($scope,$sce,getSrv){
		var generalites;
		$scope.test='index';
		/*! *** raz scope *** */
		getSrv('/init/').success(function(response){
				
				/*!--- initialisation slides actualites ---*/
				$scope.actualites=response.actualites;
				var last_actu=$scope.actualites.pop();
				$scope.actualites=[last_actu].concat($scope.actualites),
				/*! --- initialisation variables ---*/
				generalites=response.generalites;
				/*!--- initialisation scope ---*/
				for(var key in generalites){
					$scope[key]=$sce.trustAsHtml(generalites[key]);
				}
				/*!--- initialisation onglets cours ---*/
				$scope.cours=response.cours;
				$scope.galeries=response.galeries;
				/*console.log($scope.actualites);*/
		});
		
	}])//fin IndexCtl
	.controller('ActualiteCtl',['$scope','getSrv',function($scope,getSrv){
		var height=$('.liste-actus')[0].offsetHeight;
		$('.nav-plugins')[0].style.height=height+"px";
		getSrv('/init/actualite/').success(function(response){
			$scope.actualites=response;
		});
	}])//fin ActualiteCtl
	.controller('GalerieCtl',['$scope','getSrv',function($scope,getSrv){
		getSrv('/init/galerie/').success(function(response){
			$scope.galeries=response;
		});
	}]);//fin GalerieCtl

