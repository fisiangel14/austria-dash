'use strict';

angular.module('amxApp')
  .factory('Change', function ($http, $q) {
    // Service logic
    // ...

    return {
      getChangeRequests: function(opcoId, archive){
        return $http({
          url: '/api/changes/getChangeRequests', 
          method: 'GET',
          params: {opcoId : opcoId, archive : archive}
        })
        .then(function(response) {
            for (var i=0; i<response.data.length; i++) {
              response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
              response.data[i].STATUS_DATE = moment(response.data[i].STATUS_DATE).toDate(); 
              response.data[i].CHANGES = JSON.parse(response.data[i].CHANGES);
              response.data[i].NEW_OBJECT = JSON.parse(response.data[i].NEW_OBJECT);
              response.data[i].OLD_OBJECT = JSON.parse(response.data[i].OLD_OBJECT);
              //console.log(response.data[i]);
            }       
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },  
      getChangeRequestsForObject: function(opcoId, objectId, objectType){
        return $http({
          url: '/api/changes/getChangeRequestsForObject', 
          method: 'GET',
          params: {opcoId : opcoId, objectId : objectId, objectType: objectType}
        })
        .then(function(response) {
            for (var i=0; i<response.data.length; i++) {
              response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
              response.data[i].STATUS_DATE = moment(response.data[i].STATUS_DATE).toDate(); 
              response.data[i].CHANGES = JSON.parse(response.data[i].CHANGES);
              response.data[i].NEW_OBJECT = JSON.parse(response.data[i].NEW_OBJECT);
              response.data[i].OLD_OBJECT = JSON.parse(response.data[i].OLD_OBJECT);
              //console.log(response.data[i]);
            }       
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },           
      postChangeRequest: function(data){
        return $http({
          url: '/api/changes/postChangeRequest', 
          method: 'POST',
          data: data
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      approveChangeRequest: function(data){
        return $http({
          url: '/api/changes/approveChangeRequest', 
          method: 'POST',
          data: data
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      rejectChangeRequest: function(data){
        return $http({
          url: '/api/changes/rejectChangeRequest', 
          method: 'POST',
          data: data
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      archiveChangeRequest: function(data){
        return $http({
          url: '/api/changes/archiveChangeRequest', 
          method: 'POST',
          data: data
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      } 
    }; 
  });
