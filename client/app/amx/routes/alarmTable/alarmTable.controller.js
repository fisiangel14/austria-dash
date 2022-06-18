'use strict';
(function () {

  class AlarmTableComponent {
    constructor($scope, Entry, Incident, Metric, Alarm, CommentModal, LinkIncidentModal, $state, $stateParams, Socket, $timeout, Lookup, $filter) {

      $scope.loadFinished = false;
      $scope._und = _;
      $scope.moment = moment;
      $scope.entry = Entry;
      $scope.localEntry = {
        'lookup': {}
      };
      $scope.alarmsFilteredInf = [];
      // Areas lookup
      Lookup.lookup('getAreas').then(function (data) {
        $scope.localEntry.lookup.areas = data;
        $scope.localEntry.lookup.getAreaById = function (id) {
          return _.find($scope.localEntry.lookup.areas, function (num) {
            return num.AREA_ID == id;
          });
        };
      });

      $scope.workMonth = moment($stateParams.month, 'YYYY-MM').format('MMMM, YYYY');

      $scope.prevMonth = moment($stateParams.month, 'YYYY-MM').subtract(1, 'months').format('YYYY-MM');
      $scope.prevMonthText = moment($stateParams.month, 'YYYY-MM').subtract(1, 'months').format('MMMM, YYYY');

      $scope.nextMonth = moment($stateParams.month, 'YYYY-MM').add(1, 'months').format('YYYY-MM');
      $scope.nextMonthText = moment($stateParams.month, 'YYYY-MM').add(1, 'months').format('MMMM, YYYY');

      $scope.currMonth = moment().format('YYYY-MM');
      $scope.currMonthText = moment().format('MMMM, YYYY');

      $scope.rangeFromDate = moment($stateParams.month, 'YYYY-MM').format('YYYY-MM-DD');
      $scope.rangeToDate = moment($stateParams.month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD HH:mm:ss');

      $scope.markDate = {};
      $scope.markDate[moment($stateParams.month, 'YYYY-MM').unix()] = 4;

      $scope.metricResultsSummary = [];

      $scope.infiniteScrollGetData = function() {
        var last = _.size($scope.alarmsFilteredInf);
        var total = _.size($scope.alarmsFiltered);
        var loadNumRows = 20;
        var i;

        if (total-last > loadNumRows) {
          for (i=0; i<=loadNumRows; i++) {
            $scope.alarmsFilteredInf.push($scope.alarmsFiltered[last+i]);
          }
        }
        else if (total-last <= loadNumRows) {
          for (i=0; i<total-last; i++) {
            $scope.alarmsFilteredInf.push($scope.alarmsFiltered[last+i]);
          }
        }
      };

      Alarm.getAlarms($stateParams.opcoId, $scope.rangeFromDate, $scope.rangeToDate)
        .then(function (data) {
          $scope.alarms = data;
          $scope.filterChanged();
        });

      $scope.assignToMe = function (alarmId) {
        var alarm = _.find($scope.alarms, function (obj) {
          return obj.ALARM_ID == alarmId;
        });
        alarm.STATUS = 'In progress';
        alarm.MODIFIED = moment().toDate();
        alarm.ASSIGNED_TO = $scope.entry.currentUser.userName;

        Alarm.updateAlarm(alarm)
          .then(function (data) {
          });
      };

      $scope.assignToSomeoneElse = function(alarm) {
        Alarm.assignAlarmToSomeoneElse(alarm)
          .then(function (data) {
              alarm.ASSIGNED_TO = data.ASSIGNED_TO;
          });        
      };

      $scope.newIncidentMetric = function (alarmId) {
        var alarm = _.find($scope.alarms, function (obj) {
          return obj.ALARM_ID == alarmId;
        });

        Metric.getMetricInfo(alarm.OPCO_ID, alarm.OBJECT_ID)
          .then(function (data) {

            var incident = {
              'OPCO_ID': $scope.entry.currentUser.userOpcoId,
              'METRIC_ID': alarm.OBJECT_ID,
              'METRIC_DESCRIPTION': data.NAME + ' / ' + data.DESCRIPTION,
              'OPENING_DATE': moment(alarm.OBJECT_DATE).toDate(),
              'AREA': $scope.localEntry.lookup.getAreaById(data.AREA_ID).NAME,
              'CREATED': moment().toDate(),
              'MODIFIED': moment().toDate(),
              'DUE_DATE': moment().add(7, 'days').toDate(),
              'PROBLEM_DESCRIPTION': '!!! Please update this field !!! Unknown issue (incident info populated automatically from alarm: A_' + alarm.OPCO_ID + '_' + $scope.Lpad(alarm.ALARM_ID, 4, '0') + ')',
              'IMPACT_TYPE': 'Unknown',
              'CLASIFICATION': 'Unknown',
              'STATUS': 'Pending',
              'BUSINESS_ASSURANCE_DOMAIN': alarm.BUSINESS_ASSURANCE_DOMAIN,
              'NOTES': null,
              'PROCEDURE_AMX_ID': 'N/A',
              'MODIFIED_BY': $scope.entry.currentUser.userName,
              'CREATED_BY': $scope.entry.currentUser.userName,
              'STATUS_BY': $scope.entry.currentUser.userName,
              'STATUS_DATE': moment().toDate(),
            };

            Incident.postIncident(incident)
              .then(function (data) {
                if (data.success) {

                  alarm.INCIDENT_ID = data.incidentId;
                  alarm.STATUS = 'In progress';
                  alarm.MODIFIED = moment().toDate();
                  alarm.ASSIGNED_TO = $scope.entry.currentUser.userName;
                  alarm.NOTE = null;

                  Alarm.updateAlarm(alarm)
                    .then(function (data) {
                      if (data.success) {
                        Entry.showToast('Incident I_' + alarm.OPCO_ID + '_' + $scope.Lpad(alarm.INCIDENT_ID, 3, '0') + ' created. Alarm updated.');
                      }
                    });

                } else {
                  switch (data.error.errno) {
                    default:
                      Entry.showToast('Update failed. Error ' + data.error.code);
                      break;
                  }
                }
              });

          });
      };

      $scope.newIncidentControl = function (alarm) {

        var incident = {
          'OPCO_ID': $scope.entry.currentUser.userOpcoId,
          'METRIC_ID': alarm.OBJECT_ID,
          'METRIC_DESCRIPTION': alarm.OBJECT_ID + ' / ' + alarm.OBJECT_DESCRIPTION,
          'OPENING_DATE': moment(alarm.OBJECT_DATE).toDate(),
          'CREATED': moment().toDate(),
          'MODIFIED': moment().toDate(),
          'DUE_DATE': moment().add(7, 'days').toDate(),
          'PROBLEM_DESCRIPTION': '!!! Please update this field !!! Unknown issue (incident info populated automatically from alarm: A_' + alarm.OPCO_ID + '_' + $scope.Lpad(alarm.ALARM_ID, 4, '0') + ')',
          'IMPACT_TYPE': 'Unknown',
          'CLASIFICATION': 'Unknown',
          'STATUS': 'Pending',
          'BUSINESS_ASSURANCE_DOMAIN': alarm.BUSINESS_ASSURANCE_DOMAIN,
          'NOTES': null,
          'PROCEDURE_AMX_ID': 'N/A',
          'MODIFIED_BY': $scope.entry.currentUser.userName,
          'CREATED_BY': $scope.entry.currentUser.userName,
          'STATUS_BY': $scope.entry.currentUser.userName,
          'STATUS_DATE': moment().toDate(),
        };

        Incident.postIncident(incident)
          .then(function (data) {
            if (data.success) {
              // $scope.entry.getCounters();

              alarm.INCIDENT_ID = data.incidentId;
              alarm.STATUS = 'In progress';
              alarm.MODIFIED = moment().toDate();
              alarm.ASSIGNED_TO = $scope.entry.currentUser.userName;
              // alarm.NOTE = null;

              Alarm.updateAlarm(alarm)
                .then(function (data) {
                  if (data.success) {
                    Entry.showToast('Incident I_' + alarm.OPCO_ID + '_' + $scope.Lpad(alarm.INCIDENT_ID, 3, '0') + ' created. Alarm updated.');
                  }
                });

            } else {
              switch (data.error.errno) {
                default:
                  Entry.showToast('Update failed. Error ' + data.error.code);
                  break;
              }
            }
          });

      };

      $scope.linkIncident = function (alarmId) {
        var alarm = _.find($scope.alarms, function (obj) {
          return obj.ALARM_ID == alarmId;
        });

        LinkIncidentModal().then(function (incident) {

          if (incident.STATUS === 'Closed') {
            alarm.STATUS = 'Closed';
          } else {
            alarm.STATUS = 'In progress';
          }

          alarm.MODIFIED = moment().toDate();
          alarm.ASSIGNED_TO = $scope.entry.currentUser.userName;
          alarm.NOTE = null;
          if (typeof incident !== 'undefined' && incident.INCIDENT_ID) {
            alarm.INCIDENT_ID = incident.INCIDENT_ID;
          }

          Alarm.updateAlarm(alarm)
            .then(function (data) {
              if (data.success) {
                Entry.showToast('Alarm closed. Incident I_' + alarm.OPCO_ID + '_' + $scope.Lpad(alarm.INCIDENT_ID, 3, '0') + ' linked');
              }
            });

        }).catch(function (err) {
          Entry.showToast('Link incident action canceled. Error ' + err);
          // return $state.go('changeRequests', {}, { reload: true });
        });

      };

      $scope.closeAlarm = function (alarmId) {
        var alarm = _.find($scope.alarms, function (obj) {
          return obj.ALARM_ID == alarmId;
        });

        CommentModal().then(function (modalData) {

          alarm.STATUS = 'Closed';
          alarm.MODIFIED = moment().toDate();
          alarm.ASSIGNED_TO = $scope.entry.currentUser.userName;
          if (typeof modalData !== 'undefined') {
            alarm.NOTE = modalData.COMMENT;
          }

          Alarm.updateAlarm(alarm)
            .then(function (data) {
              if (data.success) {
                Entry.showToast('Alarm closed');
              }
            });
        }).catch(function (err) {
          Entry.showToast('Alarm close action canceled. Error: ' + err);
          // return $state.go('changeRequests', {}, { reload: true });
        });

      };

      $scope.closeMinorAlarm = function (alarmId) {
        var alarm = _.find($scope.alarms, function (obj) {
          return obj.ALARM_ID == alarmId;
        });

        alarm.STATUS = 'Closed';
        alarm.MODIFIED = moment().toDate();
        alarm.ASSIGNED_TO = $scope.entry.currentUser.userName;
        alarm.NOTE = 'Minor alarm acknowledged';

        Alarm.updateAlarm(alarm)
          .then(function (data) {
            if (data.success) {
              Entry.showToast('Minor alarm acknowledged');
            }
          });
      };

      $scope.unAssign = function (alarmId) {
        var alarm = _.find($scope.alarms, function (obj) {
          return obj.ALARM_ID == alarmId;
        });
        alarm.STATUS = 'Pending';
        alarm.MODIFIED = moment().toDate();
        alarm.ASSIGNED_TO = null;

        Alarm.updateAlarm(alarm)
          .then(function (data) {
            if (data.success) {
              Entry.showToast('Alarm unassigned');
            }
          });
      };

      $scope.reopenAlarm = function (alarmId) {
        var alarm = _.find($scope.alarms, function (obj) {
          return obj.ALARM_ID == alarmId;
        });
        alarm.STATUS = 'Pending';
        alarm.ASSIGNED_TO = null;
        alarm.MODIFIED = moment().toDate();
        alarm.NOTE = null;
        alarm.INCIDENT_ID = null;

        Alarm.updateAlarm(alarm)
          .then(function (data) {
            if (data.success) {
              Entry.showToast('Alarm re-opened');
            }
          });
      };

      var timerReloadOnAlarmUpdate = false;
      var alarmUpdateOpcoId = function (message) {
        // Do only one data refresh in case multiple alarm updates
        if (timerReloadOnAlarmUpdate) {
          $timeout.cancel(timerReloadOnAlarmUpdate);
        }

        timerReloadOnAlarmUpdate = $timeout(function () {
          Alarm.getAlarms($stateParams.opcoId, $scope.rangeFromDate, $scope.rangeToDate)
          .then(function (data) {
            $scope.alarms = data;
            $scope.filterChanged();
            $scope.loadFinished = true;
            
            if (message) {
              Entry.showToast(message);
            }
          });
        }, 3000);
      };

      Socket.on(('alarm:update:' + $scope.entry.OPCO_ID), alarmUpdateOpcoId);

      $scope.$on('$destroy', function () {
        Socket.off('alarm:update:' + $scope.entry.OPCO_ID);
      });

      var timerFilterChanged = false;
      $scope.filterChanged = function () {

        // Remove empty values
        $scope.entry.searchAlarm = _.pick($scope.entry.searchAlarm, function(value, key, object) {
          return value !== '' && value !== null;
        });
  
        if (_.size($scope.entry.searchAlarm) === 0) {
          delete $scope.entry.searchAlarm;
        }	

        $scope.loadFinished = false;

        if (timerFilterChanged) {
          $timeout.cancel(timerFilterChanged);
        }

        timerFilterChanged = $timeout(function () {
          $scope.alarmsFilteredInf = [];
          var initPageCountItems = 30;
          $scope.alarmsFiltered = $filter('alarmFilter')($scope.alarms, $scope.entry.searchAlarm);

          if ($scope.alarmsFiltered.length < initPageCountItems) {
            $scope.alarmsFilteredInf = $scope.alarmsFiltered;
          }
          else {
            for (var i=0; i<initPageCountItems; i++) {
              $scope.alarmsFilteredInf.push($scope.alarmsFiltered[i]);
            }
          }

          $scope.loadFinished = true;
        }, 800);
      };

      $scope.removeAllFilters = function () {
        $scope.entry.searchAlarm.searchText = '';
        $scope.entry.searchAlarm.alarmLevel = '%';
        $scope.entry.searchAlarm.alarmSource = '%';
        $scope.entry.searchAlarm.alarmStatus = '%';
        if (typeof $scope.entry.searchAlarm.isIncident !== 'undefined') {
          delete $scope.entry.searchAlarm.isIncident;
        }
        $scope.filterChanged();
      };  

      $scope.removeFilter = function (element) {
        switch (element) {
          case 'alarmLevel': 
            $scope.entry.searchAlarm.alarmLevel = '%';
            $scope.filterChanged();
            break;
          case 'alarmSource': 
            $scope.entry.searchAlarm.alarmSource = '%';
            $scope.filterChanged();
            break;
          case 'alarmStatus': 
            $scope.entry.searchAlarm.alarmStatus = '%';
            $scope.filterChanged();
            break;
          case 'isIncident':
            delete $scope.entry.searchAlarm[element];
            //$scope.entry.searchAlarm.isIncident = false;
            $scope.filterChanged();
            break;
          case 'searchText': 
            delete $scope.entry.searchAlarm[element];
            $scope.filterChanged();
            break;
        }
      };      

      if ($stateParams.month === undefined) {
        $state.go('alarmTable', {
          month: moment().format('YYYY-MM'),
          opcoId: $scope.entry.OPCO_ID
        }, {
          reload: true
        });
      }

      if ($stateParams.opcoId === undefined) {
        $state.go('alarmTable', {
          month: $stateParams.month,
          opcoId: $scope.entry.OPCO_ID
        }, {
          reload: true
        });
      }

      if ($stateParams.filterText) {
        $scope.removeAllFilters();
        $scope.entry.searchAlarm.searchText = $stateParams.filterText;
      }
      else {
        // $scope.entry.searchAlarm.alarmStatus = 'Not closed';
      }
            
      // Reload OPCO_ID change
      $scope.$watch('entry.OPCO_ID', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          Socket.off('alarm:update:' + oldValue);
        }
        setTimeout(function () {
          $state.go('alarmTable', {
            month: $stateParams.month,
            opcoId: $scope.entry.OPCO_ID
          });
        }, 100);
      });

      $scope.Lpad = function (str, length, padString) {
        str = str.toString();
        while (str.length < length) {
          str = padString + str;
        }
        return str;
      };
    }
  }

  angular.module('amxApp')
    .component('alarmTable', {
      templateUrl: 'app/amx/routes/alarmTable/alarmTable.html',
      controller: AlarmTableComponent
    });

})();
