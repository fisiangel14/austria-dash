'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var incidentCtrlStub = {
  index: 'incidentCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var incidentIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './incident.controller': incidentCtrlStub
});

describe('Incident API Router:', function() {

  it('should return an express router instance', function() {
    expect(incidentIndex).to.equal(routerStub);
  });

  describe('GET /api/incidents', function() {

    it('should route to incident.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'incidentCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

});
