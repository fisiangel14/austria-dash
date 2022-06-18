'use strict';

(function () {

  class ControlResultsOverviewComponent {
    constructor($scope, Entry, Socket, Control, Alarm, ConfirmModal, $state, $stateParams, $cookies, $timeout, $filter, $sce, $sanitize) {
      $scope.entry = Entry;
      $scope.Math = window.Math;
      $scope.loadFinished = false;
      $scope._und = _;
      $scope.header = [];
      $scope.controlsData = [];
      $scope.moment = moment;
      $scope.controlsDataFilteredInf = [];
      $scope.clickedProcessID = null;
      $scope.email = null;

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

      // Infinite scroll data reload
      $scope.infiniteScrollGetData = function() {
        var last = _.size($scope.controlsDataFilteredInf);
        var total = _.size($scope.controlsDataFilteredArr);
        var loadNumRows = 15;
        var i;

        if (total-last > loadNumRows) {
          for (i=0; i<=loadNumRows; i++) {
            $scope.controlsDataFilteredInf.push($scope.controlsDataFilteredArr[last+i]);
          }
        }
        else if (total-last <= loadNumRows) {
          for (i=0; i<total-last; i++) {
            $scope.controlsDataFilteredInf.push($scope.controlsDataFilteredArr[last+i]);
          }
        }
      };

      // Call this function always when data changes
      var prepareFilteredData = function() {
        $scope.controlsDataFilteredInf = [];
        var initPageCountItems = 30;

        // Get KPI_COUNT from the attributes based on the last avaliable control
        _.each($scope.controlsData, function (el) {
          var lastControlId = _.findLastIndex(el, function(e){
            return e.PROCESSID !== null;
          });
          var kpi = el[lastControlId];
          el.KPI_COUNT = kpi.KPI_COUNT;
          el.RULE_TYPE = kpi.RULE_TYPE;
          el.KPI_TYPE_DESC = '';
          _.each(kpi.KPI_JSON, function (k) {
            el.KPI_TYPE_DESC = el.KPI_TYPE_DESC + (el.KPI_TYPE_DESC ? ', ' : '') + k.KPI_TYPE_DESC;
          });
        });

        $scope.controlsDataHeader = _.sample($scope.controlsData, 1)[0];
        $scope.controlsDataFiltered = $filter('controlTableResultsFilter')($scope.controlsData, $scope.entry.searchControlResultTable);
        $scope.controlsDataFilteredArr = _.toArray($scope.controlsDataFiltered);

        if ($scope.controlsDataFilteredArr.length < initPageCountItems) {
          $scope.controlsDataFilteredInf = $scope.controlsDataFilteredArr;
        }
        else {
          for (var i=0; i<initPageCountItems; i++) {
            $scope.controlsDataFilteredInf.push($scope.controlsDataFilteredArr[i]);
          }
        }
        $scope.loadFinished = true;
      };

      Control.getOverview($stateParams.opcoId, $scope.fromDate, $scope.toDate)
        .then(function (data) {
          $scope.loadFinished = false;
          $scope.controlsData = _.groupBy(data, 'PROCESSNAME');
          prepareFilteredData();
        });


      $scope.$watch('entry.OPCO_ID', function (newValue, oldValue) {
        if (newValue !== oldValue) {
		  Socket.off('control:new:' + oldValue);
        }
        if ($scope.entry.OPCO_ID) {
          $state.go('controlResultsOverview', {
            opcoId: $scope.entry.OPCO_ID,
            toDate: $stateParams.toDate,
            month: $stateParams.month
          });
        }
      });

      $scope.normalizeText = function(txt) {
        if (txt) {
          var returnTxt = txt.replace('&', 'and');
          returnTxt = returnTxt.replace(/["|`|–|\t|<|>]/g, ' ');
          returnTxt = returnTxt.replace(/(?:\r\n|\r|\n)/g, ' ');
          returnTxt = $sanitize(returnTxt);
          return returnTxt;
        }
        else {
          return '';
        }
      };

      var findEmailAddresses = function(StrObj) {
        var emails = StrObj.match(/\S+[a-z0-9]@[a-z0-9\.]+/img);
        return emails?emails.join(';'):null;
      };       

      $scope.getEmails = function(ctrl) {
        if ($scope.clickedProcessID != ctrl.PROCESSID) {   
          Control.getControlEscalationNotes($stateParams.opcoId, ctrl.PROCESSNAME)
          .then(function (data) {
            $scope.email = findEmailAddresses(data.ESCALATION_NOTES);
          });
          $scope.clickedProcessID = ctrl.PROCESSID;
        }
      };

      var timerFilterChanged = false;
      $scope.filterChanged = function () {
        $scope.loadFinished = false;

        if (timerFilterChanged) {
          var timerlimitDays = false;
          $timeout.cancel(timerFilterChanged);
        }

        timerFilterChanged = $timeout(function () {
          prepareFilteredData();

          // $scope.controlsDataFiltered = $filter('controlTableResultsFilter')($scope.controlsData, $scope.entry.searchControlResultTable);
          // $scope.loadFinished = true;
        }, 800);
      };

      var timerlimitDays = false;
      $scope.limitDaysChanged = function () {
        if (timerlimitDays) {
          $timeout.cancel(timerlimitDays);
        }

        timerlimitDays = $timeout(function () {
          if ($scope.entry.searchControlResultTable.limitDays < 7) {
            $scope.entry.searchControlResultTable.limitDays = 7;
          } else if ($scope.entry.searchControlResultTable.limitDays > 61) {
            $scope.entry.searchControlResultTable.limitDays = 61;
          }
          $cookies.put('limitDays', $scope.entry.searchControlResultTable.limitDays, {
            expires: $scope.entry.getExpiryDateNever()
          });
          $state.go('controlResultsOverview', {
            opcoId: $scope.entry.OPCO_ID,
            toDate: $stateParams.toDate,
            month: $stateParams.month
          }, {
            reload: true
          });
        }, 800);
      };

      $scope.rerun = function (control, confirmDialog) {

        if (confirmDialog) {
          ConfirmModal('Run control "' + control.PROCESSNAME + '" for ' + moment(control.RUN_FOR_DATE).format('DD.MM.YYYY') + '?')
            .then(function (confirmResult) {
              if (confirmResult) {
                control.ACTION = 'R';                
                Control.sendMoneyMapRequest(control)
                  .then(function (data) {
                    if (data.success) {
                      // Entry.showToast('Control queued for re-run');
                      control.RECALCULATE = 'Y';
                    }
                  });
              }
            });
        } else {
          control.ACTION = 'R';          
          Control.sendMoneyMapRequest(control)
            .then(function (data) {
              if (data.success) {
                // Entry.showToast('Control queued for re-run');
                control.RECALCULATE = 'Y';
              }
            });
        }
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

      $scope.searchTextClear = function () {
        $scope.loadFinished = false;
        $scope.entry.searchControlResultTable.text = '';
        $scope.filterChanged();
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

      $scope.assignAlarmToMe = function (control) {
        var alarm = {};
        alarm.SOURCE = 'CONTROL';
        alarm.OPCO_ID = control.OPCO_ID;
        alarm.ALARM_ID = control.ALARM_ID;
        alarm.OBJECT_ID = control.PROCESSNAME;
        alarm.STATUS = 'In progress';
        alarm.ASSIGNED_TO = $scope.entry.currentUser.userName;

        Alarm.assignAlarm(alarm)
          .then(function (data) {
            control.STATUS = 'In progress';
            control.ASSIGNED_TO = $scope.entry.currentUser.userName;
          });
      };

      var timerReloadOnNewControlRun = false;
      var controlNewOpcoId = function (message) {
        // Do only one data refresh in case multiple control result in preset timer
        if (timerReloadOnNewControlRun) {
          $timeout.cancel(timerReloadOnNewControlRun);
        }
        timerReloadOnNewControlRun = $timeout(function () {
          Control.getOverview($stateParams.opcoId, $scope.fromDate, $scope.toDate)
            .then(function (data) {

              if (message.processid) {
                var lastControl = _.find(data, function (control) {
                  return control.PROCESSID === message.processid;
                });
                
                if (typeof lastControl != 'undefined') {
                  lastControl.HIGHLIGHT = true;
                  $timeout(function () {
                    lastControl.HIGHLIGHT = false;
                  }, 60000);
                }
              }

              $scope.controlsData = _.groupBy(data, 'PROCESSNAME');
              prepareFilteredData();

              if (message) {
                Entry.showToast(message.toast);
              }
            });
        }, 3000);
      };

      Socket.on(('control:new:' + $scope.entry.OPCO_ID), controlNewOpcoId);

      $scope.$on('$destroy', function () {
        Socket.off('control:new:' + $scope.entry.OPCO_ID);
      });

    }
  }

  angular.module('amxApp')
    .component('controlResultsOverview', {
      templateUrl: 'app/mm/routes/controlResultsOverview/controlResultsOverview.html',
      controller: ControlResultsOverviewComponent,
      controllerAs: 'controlResultsOverviewCtrl'
    });

})();
