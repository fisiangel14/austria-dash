'use strict';

(function(){

class StakeholderReportTableComponent {
  constructor($scope, Entry, Socket, $state, $stateParams, StakeholderReport, $uibModal, $timeout) {
    $scope.entry = Entry;
    $scope.isDisabled = $scope.entry.isDisabled();
    $scope.stakeholderReports = [];
    $scope.loadFinished = false;
    $scope.urlCopiedToClipboard = false;

		StakeholderReport.getStakeholderReports($stateParams.opcoId)
    .then(function (response) {
			$scope.stakeholderReports = response;
			$scope.loadFinished = true;
		}, function (err) {

		});

	  $scope.stakeholderReportInfo = function (reportId) {
	  	$state.go('stakeholderReportInfo', {reportId: reportId} );
	  };

    $scope.removeFilter = function (element) {
      delete $scope.search[element];
      if (_.size($scope.search) === 0) {
        delete $scope.search;
      }
    };

    $scope.getToken = function (stakeholderReport){
      
      var getTokenCtrl = function ($scope, StakeholderReport, $uibModalInstance, report) {

        $scope.token = '';

        $scope.generatingToken = false;
        $scope.urlCopiedToClipboard = false;
        
        $scope.params = {
          issuedBy: $scope.entry.currentUser.userAlias,
          stakeholderReportId: report.STAKEHOLDER_REPORT_ID,
          stakoholderReport: report.STAKEHOLDER_REPORT,
          opcoId: report.OPCO_ID,
          filterFromDate: moment().subtract(1, 'months').startOf('month').toDate(),
          filterToDate: moment().subtract(1, 'months').endOf('month').toDate(),
          validToDate: moment().endOf('month').add(1, 'months').toDate()
        };

        //Datepicker OPEN_DATE
        $scope.dp1 = {};
        $scope.dp1.status = { opened: false };
        $scope.dp1.open = function ($event) {
          $scope.dp1.status.opened = true;
        };

        //Datepicker CLOSING_DATE
        $scope.dp2 = {};
        $scope.dp2.status = { opened: false };
        $scope.dp2.open = function ($event) {
          $scope.dp2.status.opened = true;
        };
        
        //Datepicker VALID_DATE
        $scope.dp3 = {};
        $scope.dp3.status = { opened: false };
        $scope.dp3.open = function ($event) {
          $scope.dp3.status.opened = true;
        };
        
        $scope.generateToken = function() {
          $scope.generatingToken = true;
          $scope.urlCopiedToClipboard = false;

          $timeout(function() {
            StakeholderReport.getToken($scope.params)
            .then(function (response) {
              if (response.success) {
                $scope.token = response;
              }
              $scope.generatingToken = false;
            }, function (err) {
              console.log(err);
              $scope.generatingToken = false;
            });
          }, 200);
        };
        
        $scope.modalCancel = function () {
          $uibModalInstance.dismiss('User cancel');
        };
        
      };

      var instance = $uibModal.open({
        templateUrl: '/app/stakeholderReport/routes/stakeholderReportTable/get-token.html',
        controller: getTokenCtrl,
        resolve: {
          report: function () { return stakeholderReport; }
        },
        size: 'lg'
      });
      
      instance.result.then(function (data) {
        return data;
      });
    };

    var stakeholderReportHitOpcoId = function (message) {
      $state.go('stakeholderReportTable', { opcoId: $scope.entry.OPCO_ID }, {reload: true});
      if (message) {
        Entry.showToast(message.toast);
      }
    };
    Socket.on(('stakeholderReport:hit:' + $scope.entry.OPCO_ID), stakeholderReportHitOpcoId);
    
    $scope.$on('$destroy', function () {
      Socket.off('stakeholderReport:hit:' + $scope.entry.OPCO_ID);
    });
    
    $scope.$watch('entry.OPCO_ID', function (newValue, oldValue) {
			if (newValue !== oldValue) {
			  Socket.off('stakeholderReport:hit:' + oldValue);
			}
      if ($scope.entry.OPCO_ID) {
        $state.go('stakeholderReportTable', { opcoId: $scope.entry.OPCO_ID });
      }
    });

  }
}

angular.module('amxApp')
  .component('stakeholderReportTable', {
    templateUrl: 'app/stakeholderReport/routes/stakeholderReportTable/stakeholderReportTable.html',
    controller: StakeholderReportTableComponent,
    controllerAs: 'stakeholderReportTableCtrl'
  });

})();
