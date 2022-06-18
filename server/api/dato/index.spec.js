'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var datoCtrlStub = {
  index: 'datoCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var datoIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './dato.controller': datoCtrlStub
});

describe('Dato API Router:', function() {

  it('should return an express router instance', function() {
    expect(datoIndex).to.equal(routerStub);
  });

  describe('GET /api/datos', function() {

    it('should route to dato.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'datoCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

});
