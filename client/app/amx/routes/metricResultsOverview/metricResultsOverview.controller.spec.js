'use strict';

describe('Component: MetricResultsOverviewComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var MetricResultsOverviewComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    MetricResultsOverviewComponent = $componentController('metricResultsOverview', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
