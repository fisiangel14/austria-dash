'use strict';
(function(){

class MetricNewComponent {
  constructor($scope, Metric, Entry, Change, $state, Lookup) {
	  $scope.init = function (){
	    $scope.entry = Entry;
	    $scope.changeRequest = false;
	    $scope.newMetric = true;
	    $scope.metricAdd = {};
			$scope.localEntry = { 'lookup': {} };

			// Areas lookup
			Lookup.lookup('getAreas').then(function (data) {
				$scope.localEntry.lookup.areas = data;
				$scope.localEntry.lookup.getAreaById = function (id) {
					return _.find($scope.localEntry.lookup.areas, function (num) { return num.AREA_ID == id; });
				};
			});

	    $scope.metric = {
	      'METRIC_ID':null,
	      'AREA_ID':null,
	      'NAME':null,
	      'DESCRIPTION':null,
	      'FORMULA':null,
	      'OBJECTIVE':0.02,
	      'TOLERANCE':0.005,
	      'FREQUENCY':null,
	      'OPCO_ID': (Number($scope.entry.currentUser.userOpcoId)===0?$scope.entry.OPCO_ID:$scope.entry.currentUser.userOpcoId),
	      'RELEVANT':null,
	      'START_DATE': moment().toDate(),
	      'TREND':'N',
	      'IMPLEMENTED':'N',
	      'NOTES':null,
	      'CREATED': moment().format('YYYY-MM-DD HH:mm:ss'),
	      'MODIFIED': moment().format('YYYY-MM-DD HH:mm:ss')
	    };

	    //Datepicker
	    $scope.dp = {};
	    $scope.dp.status = {opened: false};

	    $scope.dp.open = function() {
	      $scope.dp.status.opened = true;
	    };
	    
	    $scope.dp.dateOptions = {
	      formatYear: 'yyyy',
	      formatMonth: 'MM',
	      formatDay: 'dd',
	      startingDay: 1
	    };
	    //Datepicker
	  };

	  $scope.submitNewMetric = function () {
	      //everything ok?
	      if ($scope.metricForm.$valid){

	        var changeRequest = {};
	        changeRequest.OPCO_ID = $scope.metric.OPCO_ID;
	        changeRequest.CHANGE_TYPE = 'New metric';
	        changeRequest.OBJECT_ID = $scope.metric.METRIC_ID;
	        changeRequest.OLD_OBJECT = null;
	        changeRequest.NEW_OBJECT = JSON.stringify($scope.metric);
	        changeRequest.CHANGES = JSON.stringify([{field: 'AREA', newValue: $scope.metric.AREA_ID}, {field: 'FORMULA', newValue: $scope.metric.FORMULA}, {field: 'OBJECTIVE', newValue: $scope.metric.OBJECTIVE}, {field: 'TOLERANCE', newValue: $scope.metric.TOLERANCE}]);
	        changeRequest.REQUESTOR = angular.copy($scope.entry.currentUser.userName);
	        changeRequest.REQUESTOR_COMMENT = $scope.metricAdd.CHANGE_REQUEST_COMMENT;
	        changeRequest.APPROVER = null;
	        changeRequest.STATUS = 'Requested';

	        Change.postChangeRequest(changeRequest).then(function (data) {
	          if (data.success){
	            Entry.showToast('New metric request successfully submited');
	            // $scope.entry.getCounters();
	            return $state.go('changeRequests');
	          }
	          else {
	            switch (data.error.errno){
	              case 19: Entry.showToast('Change request failed. Open request for this dato already exists'); break;
	              default: Entry.showToast('Change request failed. Error ' + data.error.code); break;
	            }
	          }
	        });
	      }
	      else {
	        Entry.showToast('Error. Please fill out all required fields!');
	        return;
	      }
	  };

	  $scope.cancelNewMetric = function () {
	      $scope.newMetric = false;
	      return $state.go('metricTable');
	  };

	  $scope.init();
  }
}

angular.module('amxApp')
  .component('metricNew', {
    templateUrl: 'app/amx/routes/metricInfo/metricInfo.html',
    controller: MetricNewComponent
  });

})();
