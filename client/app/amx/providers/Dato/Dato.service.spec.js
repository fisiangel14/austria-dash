'use strict';

describe('Service: Dato', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var Dato;
  beforeEach(inject(function (_Dato_) {
    Dato = _Dato_;
  }));

  it('should do something', function () {
    expect(!!Dato).to.be.true;
  });

});
