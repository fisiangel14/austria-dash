'use strict';

describe('Component: DatoResultComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var DatoResultComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    DatoResultComponent = $componentController('datoResult', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
