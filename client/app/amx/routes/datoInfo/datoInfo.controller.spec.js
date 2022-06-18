'use strict';

describe('Component: DatoInfoComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var DatoInfoComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    DatoInfoComponent = $componentController('datoInfo', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
