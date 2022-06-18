'use strict';

describe('Component: HarvestSummaryComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var HarvestSummaryComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    HarvestSummaryComponent = $componentController('harvestSummary', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
