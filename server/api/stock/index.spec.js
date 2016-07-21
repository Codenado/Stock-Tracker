'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var stockCtrlStub = {
  index: 'stockCtrl.index',
  show: 'stockCtrl.show',
  create: 'stockCtrl.create',
  update: 'stockCtrl.update',
  destroy: 'stockCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var stockIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './stock.controller': stockCtrlStub
});

describe('Stock API Router:', function() {

  it('should return an express router instance', function() {
    expect(stockIndex).to.equal(routerStub);
  });

  describe('GET /api/stocks', function() {

    it('should route to stock.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'stockCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/stocks/:id', function() {

    it('should route to stock.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'stockCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/stocks', function() {

    it('should route to stock.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'stockCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/stocks/:id', function() {

    it('should route to stock.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'stockCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/stocks/:id', function() {

    it('should route to stock.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'stockCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/stocks/:id', function() {

    it('should route to stock.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'stockCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
