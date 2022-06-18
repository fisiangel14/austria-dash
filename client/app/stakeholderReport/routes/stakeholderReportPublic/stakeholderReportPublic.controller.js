'use strict';

(function () {

  class StakeholderReportPublicComponent {
    constructor($scope, $state, jwtHelper, $stateParams, StakeholderReport, Entry) {
      var async = window.async;
      $scope.entry = Entry;

      $scope._und = _;
      $scope.loadFinished = false;
      $scope.report = {};
      $scope.reportParams = {};
      $scope.reportParams.verify = {success: false};

      $scope.controlsDataOverview = [];
      $scope.controlsDataOverviewHeader = {};

      $scope.controlsData = [];

      var generateReport = function(reportData) {
        $scope.report = reportData;
        // *** Convert types
// convert types - controlResultOverview
        _.each($scope.report.results.controlResultsDays, function(el){
          el.RUN_FOR_DATE = moment(el.RUN_FOR_DATE).toDate();
          el.STARTRUNDATE = moment(el.STARTRUNDATE).toDate();
          el.KPI_JSON = JSON.parse(el.KPI_JSON);
        });
        // convert types - controlResultsDetailed
        _.each($scope.report.results.controlResultsCondensed, function(el){
          el.RUN_FOR_DATE = moment(el.RUN_FOR_DATE).toDate();
          el.STARTRUNDATE = moment(el.STARTRUNDATE).toDate();
          el.KPI_JSON = JSON.parse(el.KPI_JSON);
        });
// *** Convert types

      
// *** Prepare data for controlResultOverview
        $scope.controlsDataOverview = _.groupBy($scope.report.results.controlResultsDays, 'PROCESSNAME');
        
        // Get KPI_COUNT
        _.each($scope.controlsDataOverview, function (el) {
          var kpi = _.find(el, function (e) {
            return e.PROCESSID !== null;
          });
          if (kpi) {
            el.KPI_COUNT = kpi.KPI_COUNT;
            el.KPI_TYPE_DESC = '';
            _.each(kpi.KPI_JSON, function (k) {
              el.KPI_TYPE_DESC = el.KPI_TYPE_DESC + (el.KPI_TYPE_DESC ? ', ' : '') + k.KPI_TYPE_DESC;
            });
          }
          else {
            el.KPI_COUNT = 0;
            el.KPI_TYPE_DESC = 'No KPIs defined';
          }
        });
        $scope.controlsDataOverviewHeader = _.sample($scope.controlsDataOverview, 1)[0]; 
// *** Prepare data for controlResultOverview

// ***  Prepare data for controlResultsDetailed
        

        $scope.controlsData = _.groupBy($scope.report.results.controlResultsCondensed, 'PROCESSNAME');

        // for each control in the group
        _.each($scope.controlsData, function (controlGroup) {
          // add header 
          controlGroup.controlDataHeader = _.find(controlGroup, function (e) { return e.PROCESSID != null; });

          // add KPI header 
          var minimumPriority;
          if (controlGroup.controlDataHeader && _.size(controlGroup.controlDataHeader.KPI_JSON) > 0) {
            minimumPriority = Number(controlGroup.controlDataHeader.KPI_JSON[0].KPI_PRIORITY);
            _.each(controlGroup.controlDataHeader.KPI_JSON, function (k) {
              if (Number(k.KPI_PRIORITY) < minimumPriority) {
                minimumPriority = Number(k.KPI_PRIORITY);
              }
            });
            controlGroup.controlDataKpiHeader = _.find(controlGroup.controlDataHeader.KPI_JSON, function (k) {
              return Number(k.KPI_PRIORITY) == minimumPriority;
            });
          }
          else {
            controlGroup.controlDataKpiHeader = { KPI_TYPE_DESC: 'No KPI defined' };
          }          
          
        });


// *** Prepare data for controlResultsDetailed
        $scope.loadFinished = true;
      };


      // This seems like a double token validation but
      // is needed in order to avoid forcing user Log-in 
      // verifyToken is unprotected route
      StakeholderReport.verifyToken($stateParams.key)
        .then(function (verificationResponse) {
          $scope.reportParams.verify = verificationResponse;
          $scope.reportParams.fromDate = moment(verificationResponse.token.filterFromDate).format('DD.MM.YYYY');
          $scope.reportParams.toDate = moment(verificationResponse.token.filterToDate).format('DD.MM.YYYY');
          $scope.reportParams.expiryDate = moment(jwtHelper.getTokenExpirationDate($stateParams.key)).format('dddd, DD MMMM YYYY');

          // set session parameters
          $scope.entry.currentUser.stakeholderUserAuth = true;
          $scope.entry.currentUser.userAuth = false;
          $scope.entry.currentUser.stakeholderOpcoId = Number(verificationResponse.token.opcoId);
          $scope.entry.OPCO_ID = Number(verificationResponse.token.opcoId);
          $scope.entry.currentUser.userToken = $stateParams.key;
          $scope.entry.navBarLink = '/public-report/' + $stateParams.key;
          $scope.entry.searchControlResultTable.limitDays = moment(verificationResponse.token.filterToDate).daysInMonth()-1;

          console.log($scope.entry);
          
          StakeholderReport.getPublicReport($stateParams.key)
            .then(generateReport)
            .catch(function (err) {
              console.log(err);
            });            
        })
        .catch(function (err) {
          if (moment(jwtHelper.getTokenExpirationDate($stateParams.key)).isValid()) {
            $scope.reportParams.expiryDate = moment(jwtHelper.getTokenExpirationDate($stateParams.key)).format('dddd, DD MMMM YYYY');
          }
          $scope.reportParams.verify = err;
          return;
        });

        // Helper functions for showing the incidents
        $scope.getTypeOfImpactText = function (typeOfImpact, level) {
          // Revenue loss
          if (typeOfImpact == 'Revenue loss' && level == 1) { return 'Revenue lost'; }
          else if (typeOfImpact == 'Revenue loss' && level == 2) { return 'Revenue loss recovered'; }
          else if (typeOfImpact == 'Revenue loss' && level == 3) { return 'Revenue loss prevented'; }

          else if (typeOfImpact == 'Overcharging' && level == 1) { return 'Overcharging'; }
          else if (typeOfImpact == 'Overcharging' && level == 2) { return 'Overcharging corrected'; }
          else if (typeOfImpact == 'Overcharging' && level == 3) { return 'Overcharging prevented'; }

          else if (typeOfImpact == 'Excessive costs' && level == 1) { return 'Excessive costs'; }
          else if (typeOfImpact == 'Excessive costs' && level == 2) { return 'Excessive costs corrected'; }
          else if (typeOfImpact == 'Excessive costs' && level == 3) { return 'Excessive costs prevented'; }

          else if (typeOfImpact == 'Financial reporting misstatement' && level == 1) { return 'Financial reporting misstatement'; }
          else if (typeOfImpact == 'Financial reporting misstatement' && level == 2) { return 'Financial reporting misstatement corrected'; }
          else if (typeOfImpact == 'Financial reporting misstatement' && level == 3) { return 'Financial reporting misstatement prevented'; }

          else if (typeOfImpact == 'Usage loss of event CDRs' && level == 1) { return 'Usage loss of event CDRs'; }
          else if (typeOfImpact == 'Usage loss of event CDRs' && level == 2) { return 'Usage loss of event CDRs recovered'; }
          else if (typeOfImpact == 'Usage loss of event CDRs' && level == 3) { return 'Usage loss of event CDRs prevented'; }

          else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 1) { return 'Usage loss of minutes MoU'; }
          else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 2) { return 'Usage loss of minutes MoU recovered'; }
          else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 3) { return 'Usage loss of minutes MoU prevented'; }

          else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 1) { return 'Usage loss of data traffic GB'; }
          else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 2) { return 'Usage loss of data traffic GB recovered'; }
          else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 3) { return 'Usage loss of data traffic GB prevented'; }

          else if (typeOfImpact == 'Customer data inconsistency' && level == 1) { return 'Customer data inconsistency'; }
          else if (typeOfImpact == 'Customer data inconsistency' && level == 2) { return 'Customer data inconsistency corrected'; }
          else if (typeOfImpact == 'Customer data inconsistency' && level == 3) { return 'Customer data inconsistency prevented'; }

          else if (typeOfImpact == 'No loss') { return 'No loss'; }
          else if (typeOfImpact == 'Unknown') { return 'Unknown'; }

          else { return 'Unknown'; }

        };

        $scope.getTypeOfImpactNumber = function (typeOfImpact, level) {
          // Revenue loss
          if (typeOfImpact == 'Revenue loss' && level == 1) { return '1'; }
          else if (typeOfImpact == 'Revenue loss' && level == 2) { return '2'; }
          else if (typeOfImpact == 'Revenue loss' && level == 3) { return '3'; }

          else if (typeOfImpact == 'Overcharging' && level == 1) { return '4'; }
          else if (typeOfImpact == 'Overcharging' && level == 2) { return '5'; }
          else if (typeOfImpact == 'Overcharging' && level == 3) { return '6'; }

          else if (typeOfImpact == 'Excessive costs' && level == 1) { return '7'; }
          else if (typeOfImpact == 'Excessive costs' && level == 2) { return '8'; }
          else if (typeOfImpact == 'Excessive costs' && level == 3) { return '9'; }

          else if (typeOfImpact == 'Financial reporting misstatement' && level == 1) { return '10'; }
          else if (typeOfImpact == 'Financial reporting misstatement' && level == 2) { return '11'; }
          else if (typeOfImpact == 'Financial reporting misstatement' && level == 3) { return '12'; }

          else if (typeOfImpact == 'Usage loss of event CDRs' && level == 1) { return '13'; }
          else if (typeOfImpact == 'Usage loss of event CDRs' && level == 2) { return '14'; }
          else if (typeOfImpact == 'Usage loss of event CDRs' && level == 3) { return '15'; }

          else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 1) { return '16'; }
          else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 2) { return '17'; }
          else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 3) { return '18'; }

          else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 1) { return '19'; }
          else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 2) { return '20'; }
          else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 3) { return '21'; }

          else if (typeOfImpact == 'Customer data inconsistency' && level == 1) { return '22'; }
          else if (typeOfImpact == 'Customer data inconsistency' && level == 2) { return '23'; }
          else if (typeOfImpact == 'Customer data inconsistency' && level == 3) { return '24'; }

          else if (typeOfImpact == 'No loss') { return 'No loss'; }
          else if (typeOfImpact == 'Unknown') { return 'Unknown'; }

          else { return 'Unknown'; }

        };

        $scope.getColor = function (impactType) {
          //console.log(impactType);
          if (impactType == 'No loss' || impactType == 'Unknown') { return 'black'; }
          else if (impactType.indexOf('prevented') != -1) { return 'blue'; }
          else if (impactType.indexOf('recovered') != -1 || impactType.indexOf('corrected') != -1) { return 'green'; }
          else { return 'red'; }
        };

        $scope.Lpad = function (str, length, padString) {
          str = str.toString();
          while (str.length < length) {
            str = padString + str;
          }
          return str;
        };
        
        $scope.gotoControlResults = function(opcoId, processname, toDate) {
          $state.go('controlRunhistory', { opcoId: opcoId,  processname: processname, toDate: toDate});
        };
        
        $scope.gotoProcedure = function(procedureId) {
          $state.go('procedureInfo', { procedureId: procedureId});
        };
        
        $scope.gotoIncident = function(incidentId) {
          $state.go('incidentInfo', { incidentId: incidentId});
        };

    }
  }

  angular.module('amxApp')
    .component('stakeholderReportPublic', {
      templateUrl: 'app/stakeholderReport/routes/stakeholderReportPublic/stakeholderReportPublic.html',
      controller: StakeholderReportPublicComponent,
      controllerAs: 'stakeholderReportPublicCtrl'
    });

})();
