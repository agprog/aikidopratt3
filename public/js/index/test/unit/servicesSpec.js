'use strict';

/* jasmine specs for services go here */

describe('test des differents services index', function(){
  
  beforeEach(module('index.services'));
  var $httpBackend;
  describe('version', function(){
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });//fin version
  
});
