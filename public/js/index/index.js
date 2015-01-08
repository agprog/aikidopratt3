'use strict';

// Declare app level module which depends on filters, and services
angular.module('index',[
  'ngRoute',
  'admin.services',
  'admin.directives',
  'index.filters',
  'index.services',
  'index.controllers',
  'index.directives'
 
 
])
.config(function($httpProvider){
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post={'X-Requested-With': 'xmlhttprequest',
										'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'};
  $httpProvider.defaults.headers.get={'X-Requested-With': 'xmlhttprequest',
										'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'};
})
.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{{'); 
    $interpolateProvider.endSymbol('}}');
    })
/*!------------ ROUTAGE INTERNE ------------------*/
.config(function($routeProvider){
$routeProvider
.when('/galeries-photos',{
      templateUrl:'/templates/galeries.html',
      controller:'GalerieCtl'
    })
.when('/actualites',{
	templateUrl:'/templates/actualites.html',
	controller:'ActualitesCtl'
	})
.when('/cours',{
	templateUrl:'/templates/cours.html',
	controller:'CoursCtl'
	})
.otherwise({redirect_to:'/'});
});
