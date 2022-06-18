'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var changeCtrlStub = {
  index: 'changeCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var changeIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './change.controller': changeCtrlStub
});

describe('Change API Router:', function() {

  it('should return an express router instance', function() {
    expect(changeIndex).to.equal(routerStub);
  });

  describe('GET /api/changes', function() {

    it('should route to change.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'changeCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

});
