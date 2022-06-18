'use strict';

angular.module('amxApp')
  .factory('Dato', function ($http, $q) {
    // Service logic
    // ...
    return {
      
      getAllDatos: function(opcoId){
        return $http({
          url: '/api/datos/getAllDatos', 
          method: 'GET',
          params: {opcoId : opcoId}
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      getNotLinkedDatos: function(opcoId){
        return $http({
          url: '/api/datos/getNotLinkedDatos', 
          method: 'GET',
          params: {opcoId : opcoId}
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      getDatoInfo: function(opcoId, datoId){
        return $http({
          url: '/api/datos/getDatoInfo', 
          method: 'GET',
          params: {opcoId: opcoId, datoId: datoId}
        })
        .then(function(response) {
            response.data.START_DATE = moment(response.data.START_DATE).toDate();
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      getDatoLayout: function(opcoId, datoId){
        return $http({
          url: '/api/datos/getDatoLayout', 
          method: 'GET',
          params: {opcoId: opcoId, datoId: datoId}
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      postDatoChangeRequest: function(dato){
        return $http({
          url: '/api/datos/postDatoChangeRequest', 
          method: 'POST',
          data: dato
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      postDatoFlashUpdate: function(dato){
        return $http({
          url: '/api/datos/postDatoFlashUpdate', 
          method: 'POST',
          data: dato
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      }, 
      postLayoutFlashUpdate: function(layout){
        return $http({
          url: '/api/datos/postLayoutFlashUpdate', 
          method: 'POST',
          data: layout
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },    
      deleteLayout: function (layoutId) {
        return $http({
          url: '/api/datos/deleteLayout', 
          method: 'DELETE',
          params: {id: layoutId}
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });     
      },
    }; 
  });
