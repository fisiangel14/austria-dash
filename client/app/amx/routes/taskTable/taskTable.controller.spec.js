'use strict';

describe('Component: TaskTableComponent', function () {

  // load the controller's module
  beforeEach(module('amxApp'));

  var TaskTableComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    TaskTableComponent = $componentController('taskTable', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
