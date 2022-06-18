'use strict';

angular.module('amxApp')
  .factory('Alarm', function (Entry, $http, $q, $uibModal) {
    // Service logic
    // ...
    return {
      getAlarms: function(opcoId, fromDate, toDate){
        return $http({
          url: '/api/alarms/getAlarms', 
          method: 'GET',
          params: {opcoId : opcoId, fromDate : fromDate, toDate: toDate}
        })
        .then(function(response) {
            for (var i=0; i<response.data.length; i++) {
              response.data[i].MODIFIED = moment(response.data[i].MODIFIED).toDate(); 
              response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
              response.data[i].BUSINESS_ASSURANCE_DOMAIN = JSON.parse(response.data[i].BUSINESS_ASSURANCE_DOMAIN);
            }
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      getLinkedAlarms: function(incidentId){
        return $http({
          url: '/api/alarms/getLinkedAlarms', 
          method: 'GET',
          params: {incidentId: incidentId}
        })
        .then(function(response) {
            for (var i=0; i<response.data.length; i++) {
              response.data[i].MODIFIED = moment(response.data[i].MODIFIED).toDate(); 
              response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
            }
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      updateAlarm: function(alarm){
        return $http({
          url: '/api/alarms/updateAlarm', 
          method: 'POST',
          data: alarm
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },  
      assignAlarm: function(alarm){
        return $http({
          url: '/api/alarms/assignAlarm', 
          method: 'POST',
          data: alarm
        })
        .then(function(response) {
            return response.data;
          }, function(response) {
            return $q.reject(response.data);
          });
      },
      assignAlarmToSomeoneElse: (function () {

            function alarmAssignAlarmToSomeoneElse($scope, $uibModalInstance, alarm) {

              $scope.entry = Entry;
              $scope.alarm = angular.copy(alarm);
              $scope.users = [];

              // Get users - ASSIGN_TO
              $http({
                url: '/api/tasks/getUsers',
                method: 'GET',
                params: {
                  opcoId: $scope.alarm.OPCO_ID
                }
              }).then(function (response) {
                $scope.users = response.data;
              }, function (err) {
                console.log(err);
              });

              $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
              };

              $scope.submit = function () {
                $scope.alarm.STATUS = 'In progress';

                $scope.alarm.sendEmailNotificationTo = [];

                var assignedTo = _.find($scope.users, function (el)  {
                  return el.EMAIL === $scope.alarm.ASSIGNED_TO;
                });
                if (assignedTo) {
                  $scope.alarm.sendEmailNotificationTo.push(assignedTo.MESSAGE_EMAIL);
                }
                
                var prevAssignTo = _.find($scope.users, function (el)  {
                  return el.EMAIL === alarm.ASSIGNED_TO;
                });
                if (prevAssignTo) {
                  $scope.alarm.sendEmailNotificationTo.push(prevAssignTo.MESSAGE_EMAIL);
                }

                var changedBy = _.find($scope.users, function (el)  {
                  return el.EMAIL === $scope.entry.currentUser.userName;
                });

                if (changedBy) {
                  $scope.alarm.sendEmailNotificationTo.push(changedBy.MESSAGE_EMAIL);
                  $scope.alarm.sendEmailNotificationChangeBy = changedBy.USERNAME;
                }

                $scope.alarm.sendEmailNotification = true;

                if ($scope.alarm.ASSIGNED_TO !== $scope.entry.currentUser.userName || $scope.alarm.ASSIGNED_TO !== alarm.ASSIGNED_TO) {
                }
                
                return $http({
                    url: '/api/alarms/assignAlarm',
                    method: 'POST',
                    data: $scope.alarm
                  })
                  .then(function (response) {
                    if (response.data.success) {
                      $uibModalInstance.close($scope.alarm);
                    }
                    else {
                      return $q.reject(response.data);
                    }
                  }, function (response) {
                    return $q.reject(response.data);
                  });
              };
        }

        return function(alarm) {
          var instance = $uibModal.open({
            templateUrl: 'app/amx/providers/Alarm/alarm-assign-to-someone-else.html', 
            controller: alarmAssignAlarmToSomeoneElse,
            size: 'md',
            resolve: {
                alarm : function() {return alarm;}
            },            
          });
          return instance.result.then(function (data){return data;});
        };

      })()    
    }; 
  });
