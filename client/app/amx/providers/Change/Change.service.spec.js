'use strict';

describe('Service: Change', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var Change;
  beforeEach(inject(function (_Change_) {
    Change = _Change_;
  }));

  it('should do something', function () {
    expect(!!Change).to.be.true;
  });

});
