'use strict';

var app = require('../..');
import request from 'supertest';

describe('Change API:', function() {

  describe('GET /api/changes', function() {
    var changes;

    beforeEach(function(done) {
      request(app)
        .get('/api/changes/getChangeRequests')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          changes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(changes).to.be.instanceOf(Object);
    });

  });

});
