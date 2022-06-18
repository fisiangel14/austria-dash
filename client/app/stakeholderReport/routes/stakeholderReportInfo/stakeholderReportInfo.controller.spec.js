'use strict';

describe('Component: StakeholderReportInfoComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var StakeholderReportInfoComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    StakeholderReportInfoComponent = $componentController('stakeholderReportInfo', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
