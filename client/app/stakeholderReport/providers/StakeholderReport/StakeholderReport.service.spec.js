'use strict';

describe('Service: StakeholderReport', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var StakeholderReport;
  beforeEach(inject(function (_StakeholderReport_) {
    StakeholderReport = _StakeholderReport_;
  }));

  it('should do something', function () {
    expect(!!StakeholderReport).to.be.true;
  });

});
