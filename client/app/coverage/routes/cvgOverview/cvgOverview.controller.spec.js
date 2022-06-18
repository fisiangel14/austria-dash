'use strict';

describe('Component: CvgOverviewComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var CvgOverviewComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    CvgOverviewComponent = $componentController('cvgOverview', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
