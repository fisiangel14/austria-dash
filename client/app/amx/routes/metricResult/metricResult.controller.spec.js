'use strict';

describe('Component: MetricResultComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var MetricResultComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    MetricResultComponent = $componentController('metricResult', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
