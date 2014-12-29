'use strict';

/* jasmine specs for directives go here */

describe('directives', function() {
  beforeEach(module('admin.directives'));

  describe('app-version', function() {
    it('should print current version', function() {
      module(function($provide) {
        $provide.value('version', 'TEST_VER');
      });
      inject(function($compile, $rootScope) {
        var element = $compile('<span app-version></span>')($rootScope);
        expect(element.text()).toEqual('TEST_VER');
      });
    });//fin it
  });
  describe('addGenInput',function(){
		var $compile;
		var $rootScope;
		var element;
		beforeEach(module('admin/templates/input_general.html'));
		beforeEach(inject(function(_$compile_,_$rootScope_){
			$compile=_$compile_;
			$rootScope=_$rootScope_;
		}));
		it('Generate Input',function(){
			element=$compile("<add-gen-input></app-gen-input>")($rootScope.$new());
			$rootScope.$digest();
			expect(element.html()).toContain('label');
		});  
	});//end of describe
  describe('addGenText',function(){
	  var $compile,$rootScope,element;
	  beforeEach(module('admin/templates/text_general.html'));
	  
	});
});
