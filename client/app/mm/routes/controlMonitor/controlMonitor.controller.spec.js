'use strict';

describe('Component: ControlMonitorComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var ControlMonitorComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    ControlMonitorComponent = $componentController('controlMonitor', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
