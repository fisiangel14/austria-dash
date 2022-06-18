'use strict';

describe('Component: AlarmExportReportComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var AlarmExportReportComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    AlarmExportReportComponent = $componentController('alarmExportReport', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
