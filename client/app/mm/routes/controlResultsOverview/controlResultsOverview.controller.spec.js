'use strict';

describe('Component: ControlResultsOverviewComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var ControlResultsOverviewComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    ControlResultsOverviewComponent = $componentController('controlResultsOverview', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
