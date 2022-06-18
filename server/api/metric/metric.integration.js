'use strict';

var app = require('../..');
import request from 'supertest';

describe('Metric API:', function() {

  describe('GET /api/metrics', function() {
    var metrics;

    beforeEach(function(done) {
      request(app)
        .get('/api/metrics/getAllMetrics')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          metrics = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(metrics).to.be.instanceOf(Object);
    });

  });

});
