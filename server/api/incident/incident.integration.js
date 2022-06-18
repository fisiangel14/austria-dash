'use strict';

var app = require('../..');
import request from 'supertest';

describe('Incident API:', function() {

  describe('GET /api/incidents', function() {
    var incidents;

    beforeEach(function(done) {
      request(app)
        .get('/api/incidents/getIncidents')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          incidents = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(incidents).to.be.instanceOf(Object);
    });

  });

});
