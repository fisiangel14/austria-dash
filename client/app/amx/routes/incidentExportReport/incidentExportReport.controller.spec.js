'use strict';

describe('Component: IncidentExportReportComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var IncidentExportReportComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    IncidentExportReportComponent = $componentController('incidentExportReport', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
