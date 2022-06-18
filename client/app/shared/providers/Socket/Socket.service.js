'use strict';

angular.module('amxApp')
  .factory('Socket', function () {
    
  	var socket = window.io.connect();

  return {
    on: function (eventName, callback) {
      socket.on(eventName, callback);
    },
    off: function (eventName) {
      socket.off(eventName);
    },
    removeAllListeners: function () {
      socket.removeAllListeners();
    },
    removeListener: function (eventName, callback) {
      socket.removeListener(eventName, callback);
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, callback);
    }
  };

});