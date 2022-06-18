'use strict';

describe('Component: MetricCompositeResultComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var MetricCompositeResultComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    MetricCompositeResultComponent = $componentController('metricCompositeResult', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
