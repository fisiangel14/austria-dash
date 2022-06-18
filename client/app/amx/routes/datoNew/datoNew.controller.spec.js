'use strict';

describe('Component: DatoNewComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var DatoNewComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    DatoNewComponent = $componentController('datoNew', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
