'use strict';

angular.module('amxApp')
  .factory('View', function ($http, $q) {
    // Service logic
    // ...
    return {

      getMetricResultsSummary: function(fromDate, toDate, opcoId){
        return $http({
          url: '/api/view/getMetricResultsSummary', 
          method: 'GET',
          params: {fromDate: fromDate, toDate: toDate, opcoId: opcoId}
        })
        .then(function(response) {      
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },

      // Returns list of datos with traffic light counters per area/dato/opco
      // params: {fromDate: fromDate, toDate: toDate}
      getDatoFiles: function(fromDate, toDate){
        return $http({
          url: '/api/view/getDatoFiles', 
          method: 'GET',
          params: {fromDate: fromDate, toDate: toDate}
        })
        .then(function(response) {
            for (var i=0; i<response.data.length; i++) {
              response.data[i].FILE_MODIFY_DATE = moment(response.data[i].FILE_MODIFY_DATE).toDate(); 
              response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
              response.data[i].FILE_HEADER_DATE = moment(response.data[i].FILE_HEADER_DATE).toDate(); 
            }               
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },    

      getDatoResultsSummary: function(fromDate, toDate, opcoId){
        return $http({
          url: '/api/view/getDatoResultsSummary', 
          method: 'GET',
          params: {fromDate: fromDate, toDate: toDate, opcoId: opcoId}
        })
        .then(function(response) {      
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },

      getMetricsForPeriod: function(frequency, opcoId, metricId, fromDate, toDate){
        return $http({
          url: '/api/view/getMetricsForPeriod', 
          method: 'GET',
          params: {frequency: frequency, opcoId: opcoId, metricId: metricId, fromDate: fromDate, toDate: toDate}
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

      getAllMetricsForPeriod: function(frequency, opcoId, fromDate, toDate, finetuned){
        return $http({
          url: '/api/view/getAllMetricsForPeriod', 
          method: 'GET',
          params: {frequency: frequency, opcoId: opcoId, finetuned: finetuned, fromDate: fromDate, toDate: toDate}
        })
        .then(function(response) {  
            for (var i=0; i<response.data.length; i++) {
              response.data[i].DATE = moment(response.data[i].DATE).toDate(); 
              response.data[i].START_DATE = moment(response.data[i].START_DATE).toDate(); 
            }
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },

      getMissingDatos: function(opcoId,  metricId, billCycle, date){
        return $http({
          url: '/api/view/getMissingDatos', 
          method: 'GET',
          params: { opcoId: opcoId, metricId: metricId, billCycle: billCycle, date: date}
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },

      getDatosForPeriod: function(frequency, opcoId, datoId, fromDate, toDate){
        return $http({
          url: '/api/view/getDatosForPeriod', 
          method: 'GET',
          params: {frequency: frequency, opcoId: opcoId, datoId: datoId, fromDate: fromDate, toDate: toDate}
        })
        .then(function(response) {
            for (var i=0; i<response.data.length; i++) {
              response.data[i].DATE = moment(response.data[i].DATE).toDate(); 
              response.data[i].FILE_DATE = moment(response.data[i].FILE_DATE).toDate(); 
              response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
            }
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },  

      // Returns number of datos per day
      // params: {opcoId: opcoId}
      getDatoSummaryDaily: function(opcoId){
        return $http({
          url: '/api/view/getDatoSummaryDaily', 
          method: 'GET',
          params: {opcoId: opcoId}
        })
        .then(function(response) {
            var tmp = {};
            for (var i=0; i<response.data.length; i++) {
              tmp[moment(response.data[i].DATE).unix()] = response.data[i].CNT;
              //console.log(response.data[i]);
            } 
            return tmp;
          }, function(response) {
            return $q.reject(response.data);
          });
      },

      // Returns the Reglas file for OPCO
      // params: {opcoId: opcoId}
      getReglasFile: function(opcoId){
        return $http({
          url: '/api/view/getReglasFile', 
          method: 'GET',
          params: {opcoId: opcoId}
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      
      getFinetuneStatusFile: function(opcoId){
        return $http({
          url: '/api/view/getFinetuneStatusFile', 
          method: 'GET',
          params: {opcoId: opcoId}
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
    };

  });
