'use strict';

(function () {

  class ControlResultComponent {

    constructor($scope, Entry, Socket, ConfirmModal, Control, $state, $stateParams, $timeout) {
      $scope.entry = Entry;
      $scope.Math = window.Math;
      $scope.moment = moment;
      $scope.loadFinished = false;
      $scope.showControlInfo = true;
      $scope._und = _;
      $scope.header = [];
      $scope.controlsData = [];
      $scope.processname = $stateParams.processname;
      $scope.runForDate = $stateParams.runForDate;
      $scope.runForDateText = moment($stateParams.runForDate, 'YYYY-MM-DD').format('DD.MM.YYYY');
      $scope.colspan = 11;

      if (moment($stateParams.toDate, 'YYYY-MM-DD', true).isValid()) {
        $scope.toDate = moment($stateParams.toDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
      } else {
        $scope.toDate = moment().format('YYYY-MM-DD');
      }

      $scope.currDate = moment().format('YYYY-MM-DD');
      $scope.fromDate = moment($scope.toDate, 'YYYY-MM-DD').subtract(Number($scope.entry.searchControlResultTable.limitDays), 'days').format('YYYY-MM-DD');

      $scope.goBack = moment($scope.toDate, 'YYYY-MM-DD').subtract(Number($scope.entry.searchControlResultTable.limitDays), 'days').format('YYYY-MM-DD');
      $scope.goForward = moment($scope.toDate, 'YYYY-MM-DD').add(Number($scope.entry.searchControlResultTable.limitDays), 'days').format('YYYY-MM-DD');

      $scope.goBackText = moment($scope.toDate, 'YYYY-MM-DD').subtract((2 * Number($scope.entry.searchControlResultTable.limitDays)), 'days').format('DD.MM.YYYY');
      $scope.goForwardText = moment($scope.toDate, 'YYYY-MM-DD').add(Number($scope.entry.searchControlResultTable.limitDays), 'days').format('DD.MM.YYYY');
      $scope.fromDateText = moment($scope.fromDate, 'YYYY-MM-DD').format('DD.MM.YYYY');
      $scope.toDateText = moment($scope.toDate, 'YYYY-MM-DD').format('DD.MM.YYYY');


      Control.getControlResultsForDay($stateParams.opcoId, $stateParams.processname, $stateParams.runForDate)
        .then(function (data) {
          // $scope.loadFinished = false;
          $scope.controlsData = data;
          $scope.controlsDataHeader = _.find($scope.controlsData, function (el) {
            return el.PROCESSID != null;
          });
          $scope.loadFinished = true;

          if ($scope.controlsDataHeader && $scope.controlsDataHeader.KPI_JSON) {
            $scope.colspan = _.size($scope.controlsDataHeader.KPI_JSON) + 11;
          } else {
            $scope.colspan = 11;
          }

        });


      $scope.$watch('entry.OPCO_ID', function (newValue, oldValue) {
        if (newValue !== oldValue) {
		  Socket.off('control:new:' + oldValue + ':' + $stateParams.processname);
        }
        if ($scope.entry.OPCO_ID) {
          $state.go('controlResult', {
            opcoId: $scope.entry.OPCO_ID,
            processname: $stateParams.processname,
            toDate: $stateParams.runForDate
          });
        }
      });

      $scope.rerun = function (control) {
        control.ACTION = 'R';
        Control.sendMoneyMapRequest(control)
          .then(function (data) {
            if (data.success) {
              // Entry.showToast('Control queued for re-run');
              control.RECALCULATE = 'Y';
            }
          });
      };

      $scope.stop = function (control) {
        control.ACTION = 'S';
        Control.sendMoneyMapRequest(control)
          .then(function (data) {
            if (data.success) {
              // Entry.showToast('Control queued for re-run');
              control.RECALCULATE = 'N';
            }
          });
      };

      $scope.delete = function (control) {
        ConfirmModal('Do you really want to delete result with PID: "' + control.PROCESSID + '" ?')
          .then(function (confirmResult) {
            if (confirmResult) {
              control.ACTION = 'D';
              Control.sendMoneyMapRequest(control)
                .then(function (data) {
                  if (data.success) {

                  }
                });
            }
          });
      };

      $scope.copyToClipboard = function (control, side) {
        var copyText = '';
        if (control.RULE_TYPE === 'U') {
          copyText = 'select * from ZZUAG_' + control.PROCESSNAME + '_' + (side==='B'?'BNA':'ANB') + ' where "_PID" = ' + '\'' + control.PROCESSID + '\';';
          $scope.entry.copyToClipboard(copyText);
          $scope.entry.showToast('ZZUAG select statement copied to clipboard');
        }
        else if (control.RULE_TYPE === 'R') {
          copyText = 'select * from RAPO_REST_' + control.PROCESSNAME + ' where RAPO_PROCESS_ID = ' + control.PROCESSID + ';';
          $scope.entry.copyToClipboard(copyText);
          $scope.entry.showToast('RAPO results select statement copied to clipboard');
          
        }
        else if (control.RULE_TYPE === 'C') {
          var prefix = 'MM_MODEL.ZZAG_';
          if (control.OPCO_ID == 39) {
            prefix = 'A1_MODEL.ZZAG_';

          }
          copyText = 'select * from ' + prefix + control.PROCESSNAME.toUpperCase() + ' where ' + control.PROCESSNAME.toUpperCase() + '_STATUS = \'Open\';';
          $scope.entry.copyToClipboard(copyText);
          $scope.entry.showToast('Configuration rule ZZAG select statement copied to clipboard'); 
        }
        else {
          $scope.entry.showToast('Wrong RULE_TYPE! Generating the SQL statement failed');
        }
      };

      $scope.toggleShowControlInfo = function () {
        $scope.showControlInfo = !$scope.showControlInfo;
      };

      var timerReloadOnNewControlRun = false;
      var controlNewOpcoIdProcessname = function (message) {
        // Do only one data refresh in case multiple control result in preset timer
        if (timerReloadOnNewControlRun) {
          $timeout.cancel(timerReloadOnNewControlRun);
        }
        timerReloadOnNewControlRun = $timeout(function () {
          Control.getControlResultsForDay($stateParams.opcoId, $stateParams.processname, $stateParams.runForDate)
            .then(function (data) {
              $scope.controlsData = data;
              $scope.controlsDataHeader = _.find($scope.controlsData, function (el) {
                return el.PROCESSID != null;
              });

              if ($scope.controlsDataHeader && $scope.controlsDataHeader.KPI_JSON) {
                $scope.colspan = _.size($scope.controlsDataHeader.KPI_JSON) + 11;
              } else {
                $scope.colspan = 11;
              }

              if (message) {
                Entry.showToast(message.toast);
              }
            });
        }, 1000);
      };
      Socket.on(('control:new:' + $scope.entry.OPCO_ID + ':' + $stateParams.processname), controlNewOpcoIdProcessname);

      $scope.$on('$destroy', function () {
        Socket.off('control:new:' + $scope.entry.OPCO_ID + ':' + $stateParams.processname);
      });

    }
  }

  angular.module('amxApp')
    .component('controlResult', {
      templateUrl: 'app/mm/routes/controlResult/controlResult.html',
      controller: ControlResultComponent,
      controllerAs: 'controlResultCtrl'
    });

})();
