'use strict';

describe('Service: View', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var View;
  beforeEach(inject(function (_View_) {
    View = _View_;
  }));

  it('should do something', function () {
    expect(!!View).to.be.true;
  });

});
