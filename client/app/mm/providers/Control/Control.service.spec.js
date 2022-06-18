'use strict';

describe('Service: Control', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var Control;
  beforeEach(inject(function (_Control_) {
    Control = _Control_;
  }));

  it('should do something', function () {
    expect(!!Control).to.be.true;
  });

});
