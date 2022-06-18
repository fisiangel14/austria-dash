'use strict';

describe('Service: Socket', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var Socket;
  beforeEach(inject(function (_Socket_) {
    Socket = _Socket_;
  }));

  it('should do something', function () {
    expect(!!Socket).to.be.true;
  });

});
