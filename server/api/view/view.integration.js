'use strict';

var app = require('../..');
import request from 'supertest';

describe('View API:', function() {

  describe('GET /api/view', function() {
    var views;

    beforeEach(function(done) {
      request(app)
        .get('/api/view')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          views = res.body;
          done();
        });
    });

    it('should respond with JSON object', function() {
      expect(views).to.be.instanceOf(Object);
    });

  });

});
