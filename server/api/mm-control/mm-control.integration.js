'use strict';

var app = require('../..');
import request from 'supertest';

describe('MmControl API:', function() {

  describe('GET /api/mm-controls', function() {
    var mmControls;

    beforeEach(function(done) {
      request(app)
        .get('/api/mm-controls')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          mmControls = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(mmControls).to.be.instanceOf(Object);
    });

  });

});
