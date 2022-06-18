'use strict';

describe('Service: Alarm', function () {

  // load the service's module
  beforeEach(module('amxApp'));

  // instantiate service
  var Alarm;
  beforeEach(inject(function (_Alarm_) {
    Alarm = _Alarm_;
  }));

  it('should be defined', function () {
    expect(!!Alarm).to.be.true;
    expect(Alarm).to.be.defined;
  });

  it('should have function getAlarms', function () {
    expect(Alarm.getAlarms).to.be.a('function');
  });

});
