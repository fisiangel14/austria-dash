'use strict';

describe('Component: OverviewComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var OverviewComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    OverviewComponent = $componentController('overview', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
