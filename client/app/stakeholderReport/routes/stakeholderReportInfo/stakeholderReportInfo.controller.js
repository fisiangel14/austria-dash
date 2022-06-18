'use strict';

(function(){

class StakeholderReportInfoComponent {

  constructor($scope, Entry, StakeholderReport, $state, $stateParams, ConfirmModal) {
    $scope.entry = Entry;
		$scope.stakeholderReport = {};
		$scope.stakeholderReportControls = [];
  	$scope.countSelectedControls = 0;

    $scope.isDisabled = $scope.entry.isDisabled();
		$scope.loadFinished = false;

		if ($stateParams.reportId === undefined || $stateParams.reportId === 'newStakeholderReport') {
			$scope.stakeholderReport = {
				OPCO_ID: $scope.entry.OPCO_ID,
				REPORT_CONTROL_RUNS: 'Y',
				REPORT_CONTROL_DESC: 'Y',
				REPORT_INCIDENTS: 'Y'
			};
	  }
	  else {
			StakeholderReport.getStakeholderReport($stateParams.reportId).then(function(data) {
				$scope.stakeholderReport = data;

		  	// linked controls
				StakeholderReport.getStakeholderReportLinkedControls($stateParams.reportId)
				.then(function(data) {
					$scope.stakeholderReportControls = data;
					$scope.loadFinished = true;
		  	});

	  	});

	  }

		$scope.getColor = function(str) {
			var colorHash = new window.ColorHash();
			return colorHash.hex(str + 10);
		};

		$scope.save = function() {
			if (!$scope.stakeholderReportForm.$valid) {
	       Entry.showToast('Please enter all required fields!');
			}
			else if (!$scope.stakeholderReportForm.$dirty) {
	      Entry.showToast('No unsaved changes. Nothing to save.');
				$state.go('stakeholderReportTable', { opcoId: $scope.entry.OPCO_ID});
			}
			else {
				console.log($scope.stakeholderReport);
				StakeholderReport.postStakeholderReport($scope.stakeholderReport)
				.then(function(response) {
					if (response.success) {	
						Entry.showToast('All changes saved!');
						$state.go('stakeholderReportTable', { opcoId: $scope.entry.OPCO_ID});
					}
					else {
						Entry.showToast('Save failed! Error ' + JSON.stringify(response.error));
					}
				});
			}
		};

		$scope.cancel = function() {
			$state.go('stakeholderReportTable', { opcoId: $scope.entry.OPCO_ID});			
		};

		$scope.clickControlCheckbox = function() {
			$scope.countSelectedControls = _.size(_.filter($scope.stakeholderReportControls, function(r) {return r.SELECTED === 'Y';}));
			// console.log($scope.countSelectedControls);
		};

		$scope.linkControl = function(){
			StakeholderReport.linkControl($scope.stakeholderReport)
			.then(function(selectedControls){
				$state.go('stakeholderReportInfo', {reportId: $stateParams.reportId}, {reload: true});
			});
		};

		$scope.unlinkControls = function() {
			var selectedControlList = _.filter($scope.stakeholderReportControls, function(r) {return r.SELECTED === 'Y';});

			StakeholderReport.unlinkControls($stateParams.reportId, selectedControlList)
			.then(function(response) {
					if (response.success) {	
						Entry.showToast($scope.countSelectedControls + ' controls removed. All changes saved!');
						$scope.stakeholderReportControls = _.reject($scope.stakeholderReportControls, function(r) {return r.SELECTED === 'Y';});
						$scope.countSelectedControls = 0;
						$state.go('stakeholderReportInfo', { reportId: $stateParams.reportId }, { reload: true });
					}
					else {
						Entry.showToast('Unlink failed! Error ' + JSON.stringify(response.error));
					}				
			});
		};

		$scope.deleteStakeholderReport = function(reportId) {
      ConfirmModal('Are you sure you want to delete this report ?')
      .then(function(confirmResult) {
        if (confirmResult) {
					StakeholderReport.deleteStakeholderReport(reportId).then(function(response){
						if (response.success) {	
		          Entry.showToast('Stakeholder report deleted.. All changes saved!');
							$state.go('stakeholderReportTable', { opcoId: $scope.entry.OPCO_ID });
						}
						else {
            	Entry.showToast('Delete action failed. Error ' + response.err);
						}        		
        	});
				}
      })
      .catch(function(err) {
      	console.log(err);
        Entry.showToast('Delete action canceled');
      });   
		};

		// update elastic fields
    setTimeout (function () {
      $scope.$broadcast('elastic:adjust');
    }, 500);

  }
}

angular.module('amxApp')
  .component('stakeholderReportInfo', {
		templateUrl: 'app/stakeholderReport/routes/stakeholderReportInfo/stakeholderReportInfo.html',
    controller: StakeholderReportInfoComponent,
    controllerAs: 'stakeholderReportInfoCtrl'
  });

})();
