'use strict';

describe('Component: AlarmTableComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var AlarmTableComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    AlarmTableComponent = $componentController('alarmTable', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
