'use strict';

describe('Component: DatoFileTableComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var DatoFileTableComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    DatoFileTableComponent = $componentController('datoFileTable', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
