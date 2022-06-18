'use strict';

describe('Component: ControlRunhistoryComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var ControlRunhistoryComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    ControlRunhistoryComponent = $componentController('controlRunhistory', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
