'use strict';

describe('Component: IncidentInfoComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var IncidentInfoComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    IncidentInfoComponent = $componentController('incidentInfo', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
