/**
 * Main application file
 */

'use strict';

import express from 'express';
import config from './config/environment';
import http from 'http';

var scheduler = require('./components/scheduler');
var filemon = require('./components/filemon');

// Setup server
var app = express();
var server = http.createServer(app);
require('./config/express').default(app);
require('./routes').default(app);

var io = require('socket.io')(server);
app.set('socketio', io);

// io.on('connection', function(client) {
//     console.log("connected");
//     client.on('disconnect', function() {
//     	console.log("disconnected")
//     });
// });

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
