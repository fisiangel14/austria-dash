'use strict';

(function () {

  class ControlMonitorComponent {

    constructor($scope, Entry, Socket, ConfirmModal, Control, $state, $stateParams, $cookies, $timeout, $filter) {
      $scope.entry = Entry;
      $scope.Math = window.Math;
      $scope.loadFinished = false;
      $scope._und = _;
      $scope.header = [];
      $scope.controlsData = [];
      $scope.colspan = 12;

      $scope.totalNumberOfControls = 0;
      $scope.totalNumberOfAlarms = 0;


      if (moment($stateParams.toDate, 'YYYY-MM-DD', true).isValid()) {
        $scope.toDate = moment($stateParams.toDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
      } else {
        $scope.toDate = moment().format('YYYY-MM-DD');
      }

      $scope.currDate = moment().format('YYYY-MM-DD');
      $scope.fromDate = moment($scope.toDate, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD');

      $scope.goBack = moment($scope.toDate, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD');
      $scope.goForward = moment($scope.toDate, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');

      $scope.goBackText = moment($scope.toDate, 'YYYY-MM-DD').subtract(1, 'days').format('DD.MM.YYYY');
      $scope.goForwardText = moment($scope.toDate, 'YYYY-MM-DD').add(1, 'days').format('DD.MM.YYYY');
      $scope.fromDateText = moment($scope.fromDate, 'YYYY-MM-DD').format('DD.MM.YYYY');
      $scope.toDateText = moment($scope.toDate, 'YYYY-MM-DD').format('DD.MM.YYYY');

      Control.getControlMonitor($stateParams.opcoId, moment($scope.fromDate).toDate(), moment($scope.toDate).toDate())
        .then(function (data) {
          // $scope.loadFinished = false;
          $scope.controlsData = data;

          $scope.totalNumberOfControls = $scope.controlsData.length;
          $scope.totalNumberOfAlarms = _.filter($scope.controlsData, function (el) {
            return el.KPI_ALARM_LEVEL > 0;
          }).length;

          $scope.controlsDataFiltered = $filter('controlMonitorResultsFilter')($scope.controlsData, $scope.entry.searchControlResultTable);
          $scope.loadFinished = true;
        });

      Control.getMoneyMapStatus($stateParams.opcoId)
        .then(function (data) {
          $scope.moneyMapStatusData = data;
        });

      var timerFilterChanged = false;
      $scope.filterChanged = function () {
        $scope.loadFinished = false;

        if (timerFilterChanged) {
          $timeout.cancel(timerFilterChanged);
        }

        timerFilterChanged = $timeout(function () {
          $scope.controlsDataFiltered = $filter('controlMonitorResultsFilter')($scope.controlsData, $scope.entry.searchControlResultTable);
          $scope.loadFinished = true;
        }, 800);
      };

      $scope.auditChanged = function () {
        $cookies.put('showAuditing', $scope.entry.showAuditing, {
          expires: $scope.entry.getExpiryDateNever()
        });
      };

      $scope.searchTextClear = function () {
        $scope.entry.searchControlResultTable.text = '';
        $scope.filterChanged();
      };

      $scope.audit = function (control, action) {
        $scope.loadFinished = false;

        control.AUDIT_TYPE = action;

        if (action === '+E') {
          control.EXECUTOR = $scope.entry.currentUser.userAlias;
        } else if (action === '-E') {
          control.EXECUTOR = null;
        } else if (action === '+A') {
          control.APPROVER = $scope.entry.currentUser.userAlias;
        } else if (action === '-A') {
          control.APPROVER = null;
        }

        Control.audit(control)
          .then(function (data) {
            if (!data.success) {
              Entry.showToast('Error: ' + data.error);
            }
          });

      };

      $scope.auditAll = function (action) {
        $scope.loadFinished = false;

        var auditAllRequest = {
          'action': action,
          'opcoId': $stateParams.opcoId,
          'toDate': $scope.toDate,
          'alarmsOnly': $scope.entry.searchControlResultTable.alarmsOnly,
          'processnameFilter': $scope.entry.searchControlResultTable.text,
          'requestor': $scope.entry.currentUser.userAlias
        };

        Control.auditAll(auditAllRequest)
          .then(function (data) {
            if (!data.success) {
              Entry.showToast('Error: ' + data.error);
            }
          });

      };

      $scope.stop = function (control) {
        ConfirmModal('Do you really want to cancel the process pending ?')
          .then(function (confirmResult) {
            if (confirmResult) {
              control.ACTION = 'S';
              control.OPCO_ID = control.OPCO_ID?control.OPCO_ID:$stateParams.opcoId;
              Control.sendMoneyMapRequest(control)
                .then(function (data) {
                  if (data.success) {

                  }
                });
            }
          });
      };

      $scope.delete = function (control) {
        ConfirmModal('Do you really want to delete result with PID: "' + control.PROCESSID + '" ?')
          .then(function (confirmResult) {
            if (confirmResult) {
              control.ACTION = 'D';
              control.OPCO_ID = control.OPCO_ID?control.OPCO_ID:$stateParams.opcoId;
              Control.sendMoneyMapRequest(control)
                .then(function (data) {
                  if (data.success) {

                  }
                });
            }
          });
      };

      $scope.$watch('entry.OPCO_ID', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          Socket.off('control:new:' + oldValue);
          Socket.off('audit:update:' + oldValue + ':' + $scope.toDate);
        }
        if ($scope.entry.OPCO_ID) {
          $state.go('controlMonitor', {
            opcoId: $scope.entry.OPCO_ID
          });
        }
      });

      var timerReloadOnNewControlRun = false;
      var controlNewOpcoId = function (message) {
        // Do only one data refresh in case multiple control result in preset timeer
        if (timerReloadOnNewControlRun) {
          $timeout.cancel(timerReloadOnNewControlRun);
        }
        timerReloadOnNewControlRun = $timeout(function () {
          Control.getMoneyMapStatus($stateParams.opcoId)
          .then(function (data) {
            $scope.moneyMapStatusData = data;
          });
  
          Control.getControlMonitor($stateParams.opcoId, $scope.fromDate, $scope.toDate)
            .then(function (data) {
              // $scope.loadFinished = false;
              $scope.controlsData = data;
              $scope.totalNumberOfControls = $scope.controlsData.length;
              $scope.totalNumberOfAlarms = _.filter($scope.controlsData, function (el) {
                return el.KPI_ALARM_LEVEL > 0;
              }).length;              
              $scope.controlsDataFiltered = $filter('controlMonitorResultsFilter')($scope.controlsData, $scope.entry.searchControlResultTable);
              $scope.loadFinished = true;
              if (message) {
                Entry.showToast(message.toast);
              }
            });
        }, 1000);

      };
      Socket.on(('control:new:' + $scope.entry.OPCO_ID), controlNewOpcoId);
      Socket.on(('control:monitor:' + $scope.entry.OPCO_ID), controlNewOpcoId);

      var auditUpdateOpcoIdDate = function (message) {
        Control.getMoneyMapStatus($stateParams.opcoId)
        .then(function (data) {
          $scope.moneyMapStatusData = data;
        });

        Control.getControlMonitor($stateParams.opcoId, $scope.fromDate, $scope.toDate)
          .then(function (data) {
            // $scope.loadFinished = false;
            $scope.controlsData = data;
            $scope.totalNumberOfControls = $scope.controlsData.length;
            $scope.totalNumberOfAlarms = _.filter($scope.controlsData, function (el) {
              return el.KPI_ALARM_LEVEL > 0;
            }).length;            
            $scope.controlsDataFiltered = $filter('controlMonitorResultsFilter')($scope.controlsData, $scope.entry.searchControlResultTable);
            $scope.loadFinished = true;
            if (message) {
              Entry.showToast(message.toast);
            }
          });
      };
      Socket.on(('audit:update:' + $scope.entry.OPCO_ID + ':' + $scope.toDate), auditUpdateOpcoIdDate);

      $scope.$on('$destroy', function () {
        Socket.off('control:new:' + $scope.entry.OPCO_ID);
        Socket.off('control:monitor:' + $scope.entry.OPCO_ID);
        Socket.off('audit:update:' + $scope.entry.OPCO_ID + ':' + $scope.toDate);
      });

    }

  }

  angular.module('amxApp')
    .component('controlMonitor', {
      templateUrl: 'app/mm/routes/controlMonitor/controlMonitor.html',
      controller: ControlMonitorComponent,
      controllerAs: 'controlMonitorCtrl'
    });

})();
