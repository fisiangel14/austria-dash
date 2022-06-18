'use strict';

describe('Component: IncidentTableComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var IncidentTableComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    IncidentTableComponent = $componentController('incidentTable', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
