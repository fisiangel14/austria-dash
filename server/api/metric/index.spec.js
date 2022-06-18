'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var metricCtrlStub = {
  index: 'metricCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var metricIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './metric.controller': metricCtrlStub
});

describe('Metric API Router:', function() {

  it('should return an express router instance', function() {
    expect(metricIndex).to.equal(routerStub);
  });

  describe('GET /api/metrics', function() {

    it('should route to metric.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'metricCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

});
