'use strict';

var app = require('../..');
import request from 'supertest';

describe('Task API:', function() {

  describe('GET /api/tasks/getAllTasks', function() {
    var tasks;

    beforeEach(function(done) {
      request(app)
        .get('/api/tasks/getAllTasks')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          tasks = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(tasks).to.be.instanceOf(Object);
    });

  });

});
