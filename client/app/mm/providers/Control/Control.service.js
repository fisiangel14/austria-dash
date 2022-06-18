'use strict';

function ControlService($http, $q) {
  // Service logic
  // Public API here
  return {
    getOverview: function(opcoId, fromDate, toDate){
      return $http({
        url: '/api/mm-controls/overview', 
        method: 'GET',
        params: {opcoId: opcoId, fromDate: fromDate, toDate: toDate}
      })
      .then(function(response) {
          for (var i=0; i<response.data.length; i++) {
            response.data[i].RUN_FOR_DATE = moment(response.data[i].RUN_FOR_DATE).toDate(); 
            response.data[i].STARTRUNDATE = moment(response.data[i].STARTRUNDATE).toDate(); 
            response.data[i].KPI_JSON = JSON.parse(response.data[i].KPI_JSON); 
          }
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },
    getControlEscalationNotes: function(opcoId, processname){
      return $http({
        url: '/api/mm-controls/control-escalation-notes', 
        method: 'GET',
        params: {opcoId: opcoId, processname: processname}
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },
    getRunhistory: function(opcoId, processname, fromDate, toDate){
      return $http({
        url: '/api/mm-controls/runhistory', 
        method: 'GET',
        params: {opcoId: opcoId, processname: processname, fromDate: fromDate, toDate: toDate}
      })
      .then(function(response) {
          for (var i=0; i<response.data.length; i++) {
            response.data[i].RUN_FOR_DATE = moment(response.data[i].RUN_FOR_DATE).toDate(); 
            response.data[i].STARTRUNDATE = moment(response.data[i].STARTRUNDATE).toDate(); 
            response.data[i].KPI_JSON = JSON.parse(response.data[i].KPI_JSON); 
          }
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },
    getControlResultsForDay: function(opcoId, processname, runForDate){
      return $http({
        url: '/api/mm-controls/results-for-day', 
        method: 'GET',
        params: {opcoId: opcoId, processname: processname, runForDate: runForDate}
      })
      .then(function(response) {
          for (var i=0; i<response.data.length; i++) {
            response.data[i].RUN_FOR_DATE = moment(response.data[i].RUN_FOR_DATE).toDate(); 
            response.data[i].STARTRUNDATE = moment(response.data[i].STARTRUNDATE).toDate(); 
            response.data[i].KPI_JSON = JSON.parse(response.data[i].KPI_JSON); 
          }
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },
    getControlMonitor: function(opcoId, fromDate, toDate){
      return $http({
        url: '/api/mm-controls/monitor', 
        method: 'GET',
        params: {opcoId: opcoId, fromDate: fromDate, toDate: toDate}
      })
      .then(function(response) {
          for (var i=0; i<response.data.length; i++) {
            response.data[i].RUN_FOR_DATE = moment(response.data[i].RUN_FOR_DATE).toDate(); 
            response.data[i].STARTRUNDATE = moment(response.data[i].STARTRUNDATE).toDate(); 
            response.data[i].KPI_JSON = JSON.parse(response.data[i].KPI_JSON); 
          }
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
      },
      getMoneyMapStatus: function(opcoId){
        return $http({
          url: '/api/mm-controls/mm-status', 
          method: 'GET',
          params: {opcoId: opcoId}
        })
        .then(function(response) {
          for (var i=0; i<response.data.length; i++) {
            // response.data[i].RUN_FOR_DATE = moment(response.data[i].RUN_FOR_DATE).toDate(); 
            response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
          }
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    }, 
    audit: function(data){
      return $http({
        url: '/api/mm-controls/audit', 
        method: 'POST',
        data: data
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    }, 
    auditAll: function(data){
      return $http({
        url: '/api/mm-controls/audit-all', 
        method: 'POST',
        data: data
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },
    sendMoneyMapRequest: function(data){
      return $http({
        url: '/api/mm-controls/mm-send-request', 
        method: 'POST',
        data: data
      })
      .then(function(response) {
        return response.data;
      }, function(response) {
        return $q.reject(response.data);
      });
    },
    // deleteControlResult: function(control) {
    //   return $http({
    //     url: '/api/mm-controls/' + control.OPCO_ID + '/' + control.PROCESSID + '/' + control.PROCESSNAME,
    //     method: 'DELETE'
    //   })
    //     .then(function (response) {
    //       return response.data;
    //     }, function (response) {
    //       return $q.reject(response.data);
    //     });
    // },
    // stopReRun: function(control) {
    //   return $http({
    //     url: '/api/mm-controls/rerun/' + control.OPCO_ID + '/' + control.PROCESSNAME + '/' + moment(control.RUN_FOR_DATE).format('YYYY-MM-DD'),
    //     method: 'DELETE'
    //   })
    //     .then(function (response) {
    //       return response.data;
    //     }, function (response) {
    //       return $q.reject(response.data);
    //     });
    // },
  };
}


angular.module('amxApp')
  .factory('Control', ControlService);
