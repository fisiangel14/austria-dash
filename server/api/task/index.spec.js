'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var taskCtrlStub = {
  index: 'taskCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var taskIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './task.controller': taskCtrlStub
});

describe('Task API Router:', function() {

  it('should return an express router instance', function() {
    expect(taskIndex).to.equal(routerStub);
  });

  describe('GET /api/tasks', function() {

    it('should route to task.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'taskCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

});
