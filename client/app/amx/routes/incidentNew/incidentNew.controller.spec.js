'use strict';

describe('Component: IncidentNewComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var IncidentNewComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    IncidentNewComponent = $componentController('incidentNew', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
