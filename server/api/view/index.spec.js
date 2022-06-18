'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var viewCtrlStub = {
  index: 'viewCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var viewIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './view.controller': viewCtrlStub
});

describe('View API Router:', function() {

  it('should return an express router instance', function() {
    expect(viewIndex).to.equal(routerStub);
  });

  describe('GET /api/view', function() {

    it('should route to view.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'viewCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

});
