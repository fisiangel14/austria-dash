'use strict';

describe('Component: BalancedScorecardComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var BalancedScorecardComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    BalancedScorecardComponent = $componentController('balancedScorecard', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
