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
				/*! --- initialisation variables ---*/
				generalites=response.generalites;
				/*!--- initialisation scope ---*/
				for(var key in generalites){
					$scope[key]=$sce.trustAsHtml(generalites[key]);
				}
				/*!--- initialisation slides actualites ---*/
				$scope.actualites=response.actualites;
				/*!--- initialisation onglets cours ---*/
				$scope.cours=response.cours;
				$scope.galeries=response.galeries;
		});
		
	}])//fin mainCtl

