'use strict';

angular.module('amxApp')
  .factory('Metric', function ($http, $q) {
    // Service logic
    // ...
    return {
        getAllMetrics: function(opcoId){
          return $http({
            url: '/api/metrics/getAllMetrics', 
            method: 'GET',
            params: {opcoId : opcoId}
          })
          .then(function(response) {
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        },
        getMetricInfo: function(opcoId, metricId){
          return $http({
            url: '/api/metrics/getMetricInfo', 
            method: 'GET',
            params: {opcoId: opcoId, metricId: metricId}
          })
          .then(function(response) {
              response.data.START_DATE = moment(response.data.START_DATE).toDate();
              response.data.BUSINESS_ASSURANCE_DOMAIN = JSON.parse(response.data.BUSINESS_ASSURANCE_DOMAIN);
              
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        },
        getMetricResult: function(opcoId, metricId, billCycle, date){
          return $http({
            url: '/api/metrics/getMetricResult', 
            method: 'GET',
            params: {opcoId: opcoId, metricId: metricId, billCycle: billCycle, date: date}
          })
          .then(function(response) {  
              response.data.DATE = moment(response.data.DATE).toDate(); 
              response.data.MODIFIED = moment(response.data.MODIFIED).toDate(); 
              response.data.JSON_DATO_SUMS = JSON.parse(response.data.JSON_DATO_SUMS);  
              response.data.JSON_DATO = JSON.parse(response.data.JSON_DATO);  
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        },    
        getMetricResultHistory: function(opcoId, metricId, billCycle, date){
          return $http({
            url: '/api/metrics/getMetricResultHistory', 
            method: 'GET',
            params: {opcoId: opcoId, metricId: metricId, billCycle: billCycle, date: date}
          })
          .then(function(response) { 
         for (var i=0; i<response.data.length; i++) {
              response.data[i].DATE = moment(response.data[i].DATE).toDate(); 
              response.data[i].MODIFIED = moment(response.data[i].MODIFIED).toDate(); 
              response.data[i].JSON_DATO_SUMS = JSON.parse(response.data[i].JSON_DATO_SUMS);  
              response.data[i].JSON_DATO = JSON.parse(response.data[i].JSON_DATO);  
            }
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        },    
        getLastMetricResult: function(opcoId, metricId){
          return $http({
            url: '/api/metrics/getLastMetricResult', 
            method: 'GET',
            params: {opcoId: opcoId, metricId: metricId}
          })
          .then(function(response) {
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        },
        updateRelatedDatos: function(opcoId, metricId){
          return $http({
            url: '/api/metrics/updateRelatedDatos', 
            method: 'GET',
            params: {opcoId: opcoId, metricId: metricId}
          })
          .then(function(response) {
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        },
        postMetricChangeRequest: function(metric){
          return $http({
            url: '/api/metrics/postMetricChangeRequest', 
            method: 'POST',
            data: metric
          })
          .then(function(response) {
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        },
        postMetricFlashUpdate: function(metric){
          return $http({
            url: '/api/metrics/postMetricFlashUpdate', 
            method: 'POST',
            data: metric
          })
          .then(function(response) {
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        }, 
        getRelatedDatos: function(opcoId, metricId){
          return $http({
            url: '/api/metrics/getRelatedDatos', 
            method: 'GET',
            params: {opcoId: opcoId, metricId: metricId}
          })
          .then(function(response) {
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        }, 
        getRelatedMetrics: function(opcoId, metricId){
          return $http({
            url: '/api/metrics/getRelatedMetrics', 
            method: 'GET',
            params: {opcoId: opcoId, metricId: metricId}
          })
          .then(function(response) {
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        }, 
        recalculateMetric: function(metric){
          return $http({
            url: '/api/metrics/recalculateMetric', 
            method: 'POST',
            data: metric
          })
          .then(function(response) {
              return response.data;
            }, function(response) {
              return $q.reject(response.data);
            });
        },
        calculateMetric: function(metricId, opcoId, periodicityId, period, date){
          console.log('Service called!');
          console.log(metricId, opcoId, periodicityId, period, date);

          return $http({
            url: '/api/metrics/calculateMetric', 
            method: 'GET',
            params: {metricId : metricId, opcoId: opcoId, periodicityId: periodicityId, period: period, date: date}
          })
          .then(function(response) {
              console.log(response);
              return response.data;
            }, function(response) {
              console.log(response);
              return $q.reject(response.data);
            });
        },
      }; 
  });
