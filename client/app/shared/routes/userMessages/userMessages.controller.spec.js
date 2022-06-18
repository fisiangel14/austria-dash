'use strict';

describe('Component: UserMessagesComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var UserMessagesComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    UserMessagesComponent = $componentController('userMessages', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
