'use strict';

describe('Component: ChangeRequestsComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var ChangeRequestsComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    ChangeRequestsComponent = $componentController('changeRequests', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
