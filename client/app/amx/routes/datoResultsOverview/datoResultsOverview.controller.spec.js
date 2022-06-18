'use strict';

describe('Component: DatoResultsOverviewComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var DatoResultsOverviewComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    DatoResultsOverviewComponent = $componentController('datoResultsOverview', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
