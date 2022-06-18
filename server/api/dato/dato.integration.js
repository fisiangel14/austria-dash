'use strict';

var app = require('../..');
import request from 'supertest';

describe('Dato API:', function() {

  describe('GET /api/datos', function() {
    var datos;

    beforeEach(function(done) {
      request(app)
        .get('/api/datos/getAllDatos')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          datos = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(datos).to.be.instanceOf(Object);
    });

  });

});
