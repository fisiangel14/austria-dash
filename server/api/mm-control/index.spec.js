'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var mmControlCtrlStub = {
  index: 'mmControlCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var mmControlIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './mm-control.controller': mmControlCtrlStub
});

describe('MmControl API Router:', function() {

  it('should return an express router instance', function() {
    expect(mmControlIndex).to.equal(routerStub);
  });

  describe('GET /api/mm-controls', function() {

    it('should route to mmControl.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'mmControlCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

});
