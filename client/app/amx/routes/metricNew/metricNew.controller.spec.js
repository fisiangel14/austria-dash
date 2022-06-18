'use strict';

describe('Component: MetricNewComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var MetricNewComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    MetricNewComponent = $componentController('metricNew', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
