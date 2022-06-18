'use strict';

describe('Component: MetricTableComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var MetricTableComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    MetricTableComponent = $componentController('metricTable', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
