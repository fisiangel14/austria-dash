'use strict';

var app = require('../..');
import request from 'supertest';

describe('StakeholderReport API:', function() {

  describe('GET /api/stakeholder-reports', function() {
    var stakeholderReports;

    beforeEach(function(done) {
      request(app)
        .get('/api/stakeholder-reports')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          stakeholderReports = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(stakeholderReports).to.be.instanceOf(Object);
    });

  });

});
