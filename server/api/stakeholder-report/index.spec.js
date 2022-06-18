'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var stakeholderReportCtrlStub = {
  index: 'stakeholderReportCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var stakeholderReportIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './stakeholder-report.controller': stakeholderReportCtrlStub
});

describe('StakeholderReport API Router:', function() {

  it('should return an express router instance', function() {
    expect(stakeholderReportIndex).to.equal(routerStub);
  });

  describe('GET /api/stakeholder-reports', function() {

    it('should route to stakeholderReport.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'stakeholderReportCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

});
