'use strict';

describe('Component: MetricResultTableComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var MetricResultTableComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    MetricResultTableComponent = $componentController('metricResultTable', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
