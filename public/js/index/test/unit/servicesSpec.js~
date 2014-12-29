'use strict';

/* jasmine specs for services go here */

describe('test des differents services admin', function(){
  
  beforeEach(module('admin.services'));
  var postSrv,getSrv,templateCreateSrv,selectIdSrv,$httpBackend;
  describe('version', function(){
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });//fin version
  
	describe('test de la factory postSrv',function(){
		beforeEach(inject(function(_postSrv_,_$httpBackend_){
			postSrv=_postSrv_;
			$httpBackend=_$httpBackend_;
		}));
		it('fait un appel ajax vers le service postSrv', function(){
			$httpBackend.expectPOST('/admin/actualite/add/','').respond(200,{success:true,id:'123'});
			postSrv('/admin/actualite/add/','').success(function(response){
													expect(response.success).toBeTruthy();
				});
			$httpBackend.flush();
		});
			
	});
	describe('test de la factory getSrv',function(){
		beforeEach(inject(function(_getSrv_,_$httpBackend_){
			getSrv=_getSrv_;
			$httpBackend=_$httpBackend_;
		}));
		it('fait un appel vers getSrv',function(){
			$httpBackend.expectGET('/admin/actualite/1').respond(200,{success:true});
			getSrv('/admin/actualite/1').success(function(reponse){
												expect(reponse.success).toBeTruthy();
											});
			$httpBackend.flush();
		});
	});
	describe('test du service selectId',function(){
		beforeEach(inject(function(_selectIdSrv_){
			selectIdSrv=_selectIdSrv_;
		}));
		it('selectIdSrv',function(){
			var nb_ids=0;
			var ids='1,2,3,6';
			var result;
			/*---- ajoute un element a la chaine scope.ids ---*/
			/*---- puis le supprime si l'element existe deja.* */
			for(var i=0; i<2;i++){
				result=selectIdSrv.tab_ids('5',ids);
				ids=result.join(',');
				(i==0)?expect(result.join(',')).toEqual('1,2,3,6,5'):expect(result.join(',')).toEqual('1,2,3,6');
				(i==0)?expect(result.length).toEqual(5):expect(result.length).toEqual(4);
			}
			/* --- teste les effets de bord ---*/
			ids='';
			result=selectIdSrv.tab_ids('2',ids);
			expect(result.join(',')).toEqual('2');
			expect(result.length).toEqual(1);
		});//end it
		
	});
	describe('test de la factory templateCreate',function(){
		it('compile un template de test avec un scope local pour envoyer le resultat dans une div',function(){
			
			
		});
	});//fin describe templateCreate
});
