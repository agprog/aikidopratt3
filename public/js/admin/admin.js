'use strict';

// Declare app level module which depends on filters, and services
angular.module('admin',[
  'ngRoute',
  'admin.filters',
  'admin.services',
  'admin.controllers',
  'admin.directives'
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
.when('/admin/application/test',{
      templateUrl:'/templates/partials/test.html',
      controller:'TestCtrl'
    })
.otherwise({redirect_to:'/'});
});
