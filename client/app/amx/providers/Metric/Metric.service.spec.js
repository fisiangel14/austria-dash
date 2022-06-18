'use strict';

describe('Service: Metric', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var Metric;
  beforeEach(inject(function (_Metric_) {
    Metric = _Metric_;
  }));

  it('should do something', function () {
    expect(!!Metric).to.be.true;
  });

});
