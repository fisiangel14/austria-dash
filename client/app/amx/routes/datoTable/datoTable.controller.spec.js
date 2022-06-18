'use strict';

describe('Component: DatoTableComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var DatoTableComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    DatoTableComponent = $componentController('datoTable', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
