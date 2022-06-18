'use strict';

var app = require('../..');
import request from 'supertest';

describe('Alarm API:', function() {

  describe('GET /api/alarms/getAlarms', function() {
    var alarms;

    beforeEach(function(done) {
      request(app)
        .get('/api/alarms/getAlarms')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          alarms = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(alarms).to.be.instanceOf(Object);
    });

  });

});
