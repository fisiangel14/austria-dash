'use strict';

describe('Component: StakeholderReportPublicComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var StakeholderReportPublicComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    StakeholderReportPublicComponent = $componentController('stakeholderReportPublic', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
