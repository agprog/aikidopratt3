'use strict';

/* jasmine specs for controllers go here */
/*var listejson=JSON.parse(Array());*/

describe('controllers',function(){
	beforeEach(module('index.controllers'));
	beforeEach(module('admin.services'));
	beforeEach(module('index.services'));
	describe('TestCtl',function(){
		var $scope,controller;
		beforeEach(inject(function($controller,$rootScope){
			$scope=$rootScope.$new();
			controller=$controller('TestCtl',{$scope:$scope});
		}));//end before TestCtl
		it('scope.test',function(){
			expect($scope.test).toEqual('INDEXTESTDATAS');
		});//end it
	});//end describe TestCtl
	describe('IndexCtl',function(){
		var $scope,IndexCtl;
		beforeEach(inject(function($controller,$rootScope){
			$scope=$rootScope.$new();
			IndexCtl=$controller('IndexCtl',{$scope:$scope});
		}));
		it('scope.test',function(){
			expect($scope.test).toEqual('index');
		});
	});//end describe IndexCtl
});
