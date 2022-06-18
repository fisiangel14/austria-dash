'use strict';

describe('Component: ControlResultComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var ControlResultComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    ControlResultComponent = $componentController('controlResult', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
