'use strict';

describe('Service: Incident', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var Incident;
  beforeEach(inject(function (_Incident_) {
    Incident = _Incident_;
  }));

  it('should do something', function () {
    expect(!!Incident).to.be.true;
  });

});
