'use strict';

/* jasmine specs for controllers go here */
/*var listejson=JSON.parse(Array());*/

describe('Admin Controllers',function(){
	beforeEach(module('admin.controllers'));
	beforeEach(module('admin.services'));
	describe('TestCtl',function(){
		var $scope,controller;
		beforeEach(inject(function($controller,$rootScope){
			$scope=$rootScope.$new();
			controller=$controller('TestCtl',{$scope:$scope});
		}));//end before TestCtl
		it('scope.test',function(){
			expect($scope.test).toEqual('TESTDATAS');
		});//end it
	});//end describe TestCtl
	
	describe('MainCtl',function(){
		var $scope,$httpBackend,postSrv,MainCtl;
		beforeEach(inject(function($controller,$rootScope,_$httpBackend_,postSrv){
			$scope=$rootScope.$new();
			$httpBackend=_$httpBackend_;
			postSrv=postSrv;
			MainCtl=$controller('MainCtl',{$scope:$scope,postSrv:postSrv});
		}));//end Before MainCtl
		it('exists Main',function(){
			expect($scope.test).toEqual('main');
		});//end it
		it('select_elt',function(){
			$scope.nb_ids=0;
			$scope.ids='1,2,3,6';
			/*---- ajoute un element a la chaine scope.ids ---*/
			/*---- puis le supprime si l'element existe deja.* */
			for(var i=0; i<2;i++){
				$scope.select_elt('5');
				(i==0)?expect($scope.ids).toEqual('1,2,3,6,5'):expect($scope.ids).toEqual('1,2,3,6');
				(i==0)?expect($scope.nb_ids).toEqual(5):expect($scope.nb_ids).toEqual(4);
			}
			/* --- teste les effets de bord ---*/
			$scope.ids='';
			$scope.select_elt('2');
			expect($scope.ids).toEqual('2');
			expect($scope.nb_ids).toEqual(1);
		});//end it
	});//end describe MainCtl
	
	describe('GeneralitesCtl',function(){
		var $scope,$httpBackend,postSrv,GeneralitesCtl;
		beforeEach(inject(function($controller,$rootScope,_$httpBackend_,postSrv){
								$scope=$rootScope.$new();
								$httpBackend=_$httpBackend_;
								postSrv=postSrv;
								GeneralitesCtl=$controller('GeneralitesCtl',{$scope:$scope,postSrv:postSrv});
				}));
		it('initialisation des variables messageshow et confirmshow',function(){
			expect($scope.messageshow).toEqual(false);
			expect($scope.confirmshow).toEqual(false);
			console.log($scope.confirmshow);
			/*! *** test de generalUpd ****/
		});
		it('test de generaliteUpd',inject(function($httpBackend){
			var params='id=1&field=cle&value=value';
			$httpBackend.expectPOST('/admin/generalite/update/',params).respond("message");
			var event={'preventDefault':function(){return true;},'target':{'id':'00001','value':'value'}};
			$scope.generaliteUpd(event,'cle');
			$httpBackend.flush();
			expect($scope.resp).toEqual('message');
		}));
		it('test de generaliteConfirm',function(){
			var event={'preventDefault':function(){return true;},'target':{getAttribute:function(val){return val}}};
			$scope.generaliteConfirm(event);
			expect($scope.confirm_key).toEqual('cle');
			expect($scope.confirmshow).toEqual(true);
		});
		it('test de generaliteDelete',inject(function($httpBackend){
			var event={'preventDefault':function(){return true;},'target':{getAttribute:function(val){return 1}}};
			$httpBackend.expectPOST('/admin/generalite/delete/','id=1').respond("object 1 deleted");
			$scope.generaliteDelete(event);
			$httpBackend.flush();
			expect($scope.msg).toEqual("object 1 deleted");
		}));
	});//end describe GeneralCtl
	describe('GaleriesCtl',function(){
		var $scope,postSrv,getSrv,defaultsSrv,$httpBackend,GaleriesCtl;
		beforeEach(inject(function($controller,$rootScope,_$httpBackend_,getSrv,postSrv,defaultsSrv,fillFormSrv){
			$scope=$rootScope.$new();
			getSrv=getSrv;
			postSrv=postSrv;
			defaultsSrv=defaultsSrv;
			fillFormSrv=fillFormSrv;
			$httpBackend=_$httpBackend_;
			GaleriesCtl=$controller('GaleriesCtl',{$scope:$scope,getSrv:getSrv,postSrv:postSrv,defaultsSrv:defaultsSrv,fillFormSrv:fillFormSrv});
		}));
		it('test de delete_photo',inject(function($httpBackend){
			var event={'preventDefault':function(){return true;},'target':{getAttribute:function(val){return 1}}};
			expect($scope.msg).toEqual('');
			$httpBackend.expectPOST('/admin/galerie/photo/delete/','id=1').respond("La photo a été correctement supprimée.");
			$scope.deletePhoto(event);
			$httpBackend.flush();
			expect($scope.msg).toEqual("La photo a été correctement supprimée.");
		}));
		it('test de inline legend update',inject(function($httpBackend){
			var event={'preventDefault':function(){return true;},'target':{value:1,getAttribute:function(val){return 1}}};
			$httpBackend.expectPOST('/admin/galerie/photo/update/','id=1&field=legend&value=1').respond("La photo a été mise à jour.");
			$scope.updatePhoto(event);
			$httpBackend.flush();
			expect($scope.msg).toEqual("La photo a été mise à jour.");
		}));
	});
});
