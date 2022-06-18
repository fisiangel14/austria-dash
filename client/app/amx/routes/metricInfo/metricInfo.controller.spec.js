'use strict';

describe('Component: MetricInfoComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var MetricInfoComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    MetricInfoComponent = $componentController('metricInfo', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
