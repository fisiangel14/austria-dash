'use strict';

angular.module('amxApp')
  .factory('Incident', function ($http, $q) {
    // Service logic
    // ...
    return {
      getIncidents: function(opcoId, archive){
        return $http({
          url: '/api/incidents/getIncidents', 
          method: 'GET',
          params: {opcoId : opcoId, archive : archive}
        })
        .then(function(response) {
            for (var i=0; i<response.data.length; i++) {
              response.data[i].NAME = response.data[i].METRIC_ID; 
              response.data[i].OPENING_DATE = moment(response.data[i].OPENING_DATE).toDate(); 
              response.data[i].OPENING_DATE_SEARCH = moment(response.data[i].OPENING_DATE).format('DD.MM.YYYY'); 

              if (response.data[i].END_DATE) {
                response.data[i].END_DATE = moment(response.data[i].END_DATE).toDate();
              }
              if (response.data[i].CLOSING_DATE) {
                response.data[i].CLOSING_DATE = moment(response.data[i].CLOSING_DATE).toDate();
              }
              response.data[i].STATUS_DATE = moment(response.data[i].STATUS_DATE).toDate(); 
              response.data[i].STATUS_DATE_SEARCH = moment(response.data[i].STATUS_DATE).format('DD.MM.YYYY'); 
              response.data[i].DUE_DATE = moment(response.data[i].DUE_DATE).toDate(); 
              response.data[i].MODIFIED = moment(response.data[i].MODIFIED).toDate(); 
              response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
              //console.log(response.data[i]);
            }
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      getAreaIncidents: function(opcoId, area, fromDate, toDate, showAll){
        return $http({
          url: '/api/incidents/getAreaIncidents', 
          method: 'GET',
          params: {opcoId : opcoId, area : area, fromDate : fromDate, toDate : toDate, showAll : showAll}
        })
        .then(function(response) {
            for (var i=0; i<response.data.length; i++) {
              response.data[i].OPENING_DATE = moment(response.data[i].OPENING_DATE).toDate(); 

              if (response.data[i].END_DATE) {
                response.data[i].END_DATE = moment(response.data[i].END_DATE).toDate();
              }
              if (response.data[i].CLOSING_DATE) {
                response.data[i].CLOSING_DATE = moment(response.data[i].CLOSING_DATE).toDate();
              }
              response.data[i].STATUS_DATE = moment(response.data[i].STATUS_DATE).toDate(); 
              response.data[i].DUE_DATE = moment(response.data[i].DUE_DATE).toDate(); 
              response.data[i].MODIFIED = moment(response.data[i].MODIFIED).toDate(); 
              response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
              //console.log(response.data[i]);
            }
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      getBAIncidents: function(opcoId, area, fromDate, toDate, showAll){
        return $http({
          url: '/api/incidents/getBAIncidents', 
          method: 'GET',
          params: {opcoId : opcoId, area : area, fromDate : fromDate, toDate : toDate, showAll : showAll}
        })
        .then(function(response) {
            for (var i=0; i<response.data.length; i++) {
              response.data[i].OPENING_DATE = moment(response.data[i].OPENING_DATE).toDate(); 

              if (response.data[i].END_DATE) {
                response.data[i].END_DATE = moment(response.data[i].END_DATE).toDate();
              }
              if (response.data[i].CLOSING_DATE) {
                response.data[i].CLOSING_DATE = moment(response.data[i].CLOSING_DATE).toDate();
              }
              response.data[i].STATUS_DATE = moment(response.data[i].STATUS_DATE).toDate(); 
              response.data[i].DUE_DATE = moment(response.data[i].DUE_DATE).toDate(); 
              response.data[i].MODIFIED = moment(response.data[i].MODIFIED).toDate(); 
              response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
              //console.log(response.data[i]);
            }
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      getIncidentReport: function(opcoId, fromDate, toDate, includeOpen){
        return $http({
          url: '/api/incidents/getIncidentReport', 
          method: 'GET',
          params: {opcoId: opcoId, fromDate: fromDate, toDate: toDate, includeOpen: includeOpen}
        })
        .then(function(response) {
            for (var i=0; i<response.data.length; i++) {
              response.data[i]['Start Date'] = moment(response.data[i]['Start Date']).format('MMM-YYYY'); 
              
              // Remove last character - newline
              if (response.data[i]['Type of Impact']) {
                response.data[i]['Type of Impact'] = response.data[i]['Type of Impact'].substring(0, response.data[i]['Type of Impact'].length - 2);
              }
              
              if (response.data[i].Impact) {
                response.data[i].Impact = response.data[i].Impact.substring(0, response.data[i].Impact.length - 2);
              }

              if (response.data[i]['Closing Date']) {
                response.data[i]['Closing Date'] = moment(response.data[i]['Closing Date']).format('DD. MMM YYYY');
              }
              //console.log(response.data[i]);
            }
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },    
      getIncidentInfo: function(incidentId){
        return $http({
          url: '/api/incidents/getIncidentInfo', 
          method: 'GET',
          params: {incidentId: incidentId}
        })
        .then(function(response) {
            response.data.OPENING_DATE = moment(response.data.OPENING_DATE).toDate();
            if (response.data.END_DATE) {
              response.data.END_DATE = moment(response.data.END_DATE).toDate();
            }
            if (response.data.CLOSING_DATE) {
              response.data.CLOSING_DATE = moment(response.data.CLOSING_DATE).toDate();
            }
            response.data.STATUS_DATE = moment(response.data.STATUS_DATE).toDate();
            response.data.DUE_DATE = moment(response.data.DUE_DATE).toDate(); 
            response.data.MODIFIED = moment(response.data.MODIFIED).toDate(); 
            response.data.CREATED = moment(response.data.CREATED).toDate();           
            response.data.BUSINESS_ASSURANCE_DOMAIN = JSON.parse(response.data.BUSINESS_ASSURANCE_DOMAIN);
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },     
      getBalancedScorecard: function(opcoId, year, fromDate, toDate, balancedScorecardShowAllIncidents){
        return $http({
          url: '/api/incidents/getBalancedScorecard', 
          method: 'GET',
          params: {opcoId: opcoId, year: year, fromDate: fromDate, toDate: toDate, balancedScorecardShowAllIncidents:balancedScorecardShowAllIncidents}
        })
        .then(function(response) {    
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },       
      getAmxProcedures: function(){
        return $http({
          url: '/api/incidents/getAmxProcedures', 
          method: 'GET'
        })
        .then(function(response) {    
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },  
      postIncident: function(incident){
        return $http({
          url: '/api/incidents/postIncident', 
          method: 'POST',
          data: function() {
            incident.OPENING_DATE = incident.OPENING_DATE?moment(incident.OPENING_DATE).format('YYYY-MM-DD'):null;
            incident.END_DATE = incident.END_DATE?moment(incident.END_DATE).format('YYYY-MM-DD'):null;
            incident.CLOSING_DATE = incident.CLOSING_DATE?moment(incident.CLOSING_DATE).format('YYYY-MM-DD'):null;
            incident.DUE_DATE = incident.DUE_DATE?moment(incident.DUE_DATE).format('YYYY-MM-DD'):null;
            return incident;
          }()
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },  
      archiveIncident: function(incident){
        return $http({
          url: '/api/incidents/archiveIncident', 
          method: 'POST',
          data: incident
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      deleteIncident: function (incidentId) {
        return $http({
          url: '/api/incidents', 
          method: 'DELETE',
          params: {id: incidentId}
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });     
      },    
    }; 
  });
