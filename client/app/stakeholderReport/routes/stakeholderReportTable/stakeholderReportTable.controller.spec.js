'use strict';

describe('Component: StakeholderReportTableComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var StakeholderReportTableComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    StakeholderReportTableComponent = $componentController('stakeholderReportTable', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
