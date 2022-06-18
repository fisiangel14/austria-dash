'use strict';

angular.module('amxApp')
  .factory('ExportIncidentReportModal', function ($rootScope, $uibModal) {
    // Service logic
    // ...

    function exportIncidentReportModalCtrl ($scope, $uibModalInstance, Incident, Entry) {
      $scope.entry = Entry;
      $scope.q = {};

      $scope.q.FROM = moment().subtract(1, 'months').startOf('month').toDate();
      $scope.q.TO = moment().subtract(1, 'months').endOf('month').toDate();
      $scope.q.INCLUDE_OPEN = '%';
      $scope.incidents = {};

      var footer = [];
      footer.push({'RA. Ref. no.': '+/- effect on EBITDA in EUR:'});
      footer.push({'RA. Ref. no.': '1) Revenue lost: revenue lost and not billed to the customer or business partners'});
      footer.push({'RA. Ref. no.': '2) Revenue loss recovered: revenues recovered due to RA activities'});
      footer.push({'RA. Ref. no.': '3) Revenue loss prevented: future revenue loss avoided due to RA activities'});
      footer.push({'RA. Ref. no.': '4) Unjustified gain: overcharging & excessive costs underpayment of customers and partners'});
      footer.push({'RA. Ref. no.': '5) Unjustified gain corrected: overcharging & excessive costs underpayment of customers and partners corrected due to RA activities'});
      footer.push({'RA. Ref. no.': '6) Unjustified gain prevented: future overcharging & excessive costs underpayment of customers and partners avoided due to RA activities'});
      footer.push({'RA. Ref. no.': '7) Excessive costs: overcharging of Telekom Austria by business partners'});
      footer.push({'RA. Ref. no.': '8) Excessive costs corrected: overcharging of Telekom Austria by business partners corrected avoided due to RA activities'});
      footer.push({'RA. Ref. no.': '9) Excessive costs prevented: future overcharging of Telekom Austria by business partners avoided due to RA activities avoided due to RA activities'});
      footer.push({'RA. Ref. no.': '10) Financial Reporting misstatement: inaccurate presentation of financial statements'});
      footer.push({'RA. Ref. no.': '11) Financial Reporting misstatement corrected: inaccurate presentation of financial statements corrected avoided due to RA activities'});
      footer.push({'RA. Ref. no.': '12) Financial Reporting misstatement prevented: inaccurate presentation of financial statements avoided due to RA activities'});
      footer.push({'RA. Ref. no.': '13) Usage loss of event CDRs: loss measured in number of events/CDRs'});
      footer.push({'RA. Ref. no.': '14) Usage loss of event CDRs recovered:  loss measured in number of events/CDRs recovered due to RA activities'});
      footer.push({'RA. Ref. no.': '15) Usage loss of event CDRs prevented: loss measured in number of events/CDRs avoided due to RA activities'});
      footer.push({'RA. Ref. no.': '16) Usage loss of minutes MoU:  loss measured in number of Minutes of Use'});
      footer.push({'RA. Ref. no.': '17) Usage loss of minutes MoU recovered:   loss measured in number of Minutes of Use recovered due to RA activities'});
      footer.push({'RA. Ref. no.': '18) Usage loss of minutes MoU prevented:  loss measured in number of Minutes of Use avoided due to RA activities'});
      footer.push({'RA. Ref. no.': '19) Usage loss of data traffic GB:  loss measured in amount of GB'});
      footer.push({'RA. Ref. no.': '20) Usage loss data traffic GB recovered:  loss measured in amount of GB recovered due to RA activities'});
      footer.push({'RA. Ref. no.': '21) Usage loss data traffic GB prevented:  loss measured in amount of GB avoided due to RA activities'});
      footer.push({'RA. Ref. no.': '22) Customer Data Inconsistency: any loss or deviation measured in number of affected lines/subscribers or products/services'});
      footer.push({'RA. Ref. no.': '23) Customer Data Inconsistency corrected: any loss or deviation measured in number of affected lines/subscribers or products/services corrected avoided due to RA activities'});
      footer.push({'RA. Ref. no.': '24) Customer Data Inconsistency prevented: any loss or deviation measured in number of affected lines/subscribers or products/services avoided due to RA activities`;'});

      //Datepicker OPEN_DATE
      $scope.dp1 = {};
      $scope.dp1.status = {opened: false};

      $scope.dp1.open = function($event) {
        $scope.dp1.status.opened = true;
      };

      $scope.dp1.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1
      };

      //Datepicker CLOSING_DATE
      $scope.dp3 = {};
      $scope.dp3.status = {opened: false};

      $scope.dp3.open = function($event) {
        $scope.dp3.status.opened = true;
      };

      $scope.dp3.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1
      };

      $scope.fromDateChanged = function() {
        $scope.q.FROM = moment($scope.q.FROM).startOf('month').toDate();
        $scope.q.TO = moment($scope.q.FROM).endOf('month').toDate();
        $scope.getObject();
      };

      $scope.getCsvObject = function () {
        Incident.getIncidentReport($scope.entry.OPCO_ID, moment($scope.q.FROM).format('YYYY-MM-DD'), moment($scope.q.TO).format('YYYY-MM-DD'), $scope.q.INCLUDE_OPEN).then(function(data) {
          if (data.length > 0) {
            $scope.incidents.header = Object.keys(data[0]);
          }
          $scope.incidents.lines = data;
          $scope.incidents.lines.push({});
          // $scope.incidents.lines = $scope.incidents.lines.concat(footer);
          // console.log($scope.incidents);
        });
      };

      $scope.getCsvObject(); // populates $scope.incidents

      $scope.modalCancel = function () {
        $uibModalInstance.dismiss('User cancel');
      };

      $scope.modalSubmit = function () {
        $uibModalInstance.close($scope.form);
      };

    }

    return function() {
      var instance = $uibModal.open({
        templateUrl: 'app/amx/providers/ExportIncidentReportModal/export-incident-report-modal.html',
        controller: exportIncidentReportModalCtrl
      });
      return instance.result.then(function (data){return data;});
    };
  });
