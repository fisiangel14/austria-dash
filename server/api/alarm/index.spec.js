'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var alarmCtrlStub = {
  index: 'alarmCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var alarmIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './alarm.controller': alarmCtrlStub
});

describe('Alarm API Router:', function() {

  it('should return an express router instance', function() {
    expect(alarmIndex).to.equal(routerStub);
  });

  describe('GET /api/alarms', function() {

    it('should route to alarm.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'alarmCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

});
