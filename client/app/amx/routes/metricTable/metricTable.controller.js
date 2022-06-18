'use strict';
(function(){

class MetricTableComponent {
  constructor($scope, Entry, Metric, $stateParams, $state) {

	  $scope.entry = Entry;
    $scope.isDisabled = $scope.entry.isDisabled();
		$scope.loadFinished = false;

	  if ($stateParams.opcoId === undefined) {
	    $state.go('metricTable', {opcoId: $scope.entry.OPCO_ID}, {reload: true} );
	  }
	  else if (Number($stateParams.opcoId) !== $scope.entry.OPCO_ID) {
	    $scope.entry.OPCO_ID = Number($stateParams.opcoId);
	  }

	  $scope.search = {TASKLIST_DONE: 'N'};

	  Metric.getAllMetrics($stateParams.opcoId).then(function (data) {
	    $scope.metrics = data;
	    $scope.loadFinished = true;
	  });

	  $scope.filterChanged = function () {
	  	// remove filters with blank values
		  $scope.entry.searchMetric = _.pick($scope.entry.searchMetric, function(value, key, object) {
		  	return value !== '' && value !== null;
		  });

      if (_.size($scope.entry.searchMetric) === 0) {
        delete $scope.entry.searchMetric;
      }			  
	  };

	  $scope.removeAllFilters = function () {
	    delete $scope.entry.searchMetric;
	  };

	  $scope.removeFilter = function (element) {
	    delete $scope.entry.searchMetric[element];
	    if (_.size($scope.entry.searchMetric)  === 0) {
	    	delete $scope.entry.searchMetric;
	    }
	  };

	  // On OPCO_ID change
	  $scope.$watch('entry.OPCO_ID', function(){
	    setTimeout (function () {
	      $state.go('metricTable', {opcoId: $scope.entry.OPCO_ID});
	    }, 100);           
	  });  

  }
}

angular.module('amxApp')
  .component('metricTable', {
    templateUrl: 'app/amx/routes/metricTable/metricTable.html',
    controller: MetricTableComponent
  });

})();
