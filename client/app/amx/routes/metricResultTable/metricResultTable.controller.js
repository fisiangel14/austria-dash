'use strict';
(function(){

class MetricResultTableComponent {
  constructor($scope, Entry, View, $state, $stateParams, $cookies) {
	  $scope.entry = Entry;
	  $scope.Math = window.Math;
	  //$scope.moment = moment;

		if (moment($stateParams.month, 'YYYY-MM', true).isValid()) {
		  if ($cookies.get('searchMDmonth') !== $stateParams.month) {
		  	$cookies.put('searchMDmonth', $stateParams.month);
		  	$scope.entry.searchMDmonth = $stateParams.month;
		  }
	  }
	  else {
	  	if ($cookies.get('searchMDmonth')){
	  		$stateParams.month = $cookies.get('searchMDmonth');
	  	}
	  	else {
	  		$stateParams.month = moment().format('YYYY-MM');
	  	}
	  }
	  
	  $scope.metricData = [];
	  $scope.metricDataHeader = [];
	  
	  $scope.frequency = $stateParams.frequency;
	  $scope.finetuned = $stateParams.finetuned;

	  $scope.workMonth = $stateParams.month;
	  $scope.workMonthText = moment($stateParams.month, 'YYYY-MM').format('MMMM, YYYY');

	  $scope.prevMonth = moment($stateParams.month, 'YYYY-MM').subtract(1, 'months').format('YYYY-MM');
	  $scope.prevMonthText = moment($stateParams.month, 'YYYY-MM').subtract(1, 'months').format('MMMM, YYYY');
	  
	  $scope.nextMonth = moment($stateParams.month, 'YYYY-MM').add(1, 'months').format('YYYY-MM');
	  $scope.nextMonthText = moment($stateParams.month, 'YYYY-MM').add(1, 'months').format('MMMM, YYYY');
	  
	  $scope.currMonth = moment().format('YYYY-MM');
	  $scope.currMonthText = moment().format('MMMM, YYYY');
	  
	  $scope.rangeFromDate = moment($stateParams.month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
	  $scope.rangeToDate = moment($stateParams.month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

	  if ($scope.frequency === 'M') {
	    $scope.rangeFromDate = moment($stateParams.month, 'YYYY-MM').startOf('year').format('YYYY-MM-DD');
	    $scope.rangeToDate = moment($stateParams.month, 'YYYY-MM').endOf('year').format('YYYY-MM-DD');

	    $scope.prevMonth = moment($stateParams.month, 'YYYY-MM').startOf('year').subtract(1, 'day').format('YYYY-MM');
	    $scope.prevMonthText = moment($stateParams.month, 'YYYY-MM').startOf('year').subtract(1, 'day').format('YYYY');
	    
	    $scope.nextMonth = moment($stateParams.month, 'YYYY-MM').endOf('year').add(1, 'day').format('YYYY-MM');
	    $scope.nextMonthText = moment($stateParams.month, 'YYYY-MM').endOf('year').add(1, 'day').format('YYYY');

	    $scope.workMonthText = moment($stateParams.month, 'YYYY-MM').format('YYYY');

	    $scope.currMonth = moment().format('YYYY-MM');
	  }

	  $scope.searchResultTableClear = function () {
	    //console.log('Clear');
	    $scope.entry.searchResultTable.text = '';
	    $scope.entry.searchResultTable.GREEN = true;
	    $scope.entry.searchResultTable.YELLOW = true;
	    $scope.entry.searchResultTable.RED = true;
	    $scope.entry.searchResultTable.ORANGE = true;
	    $scope.entry.searchResultTable.NO_RESULT = true;
	  };

	  // Button values
	  $scope.searchResultTableToggle = function (color) {
	    switch (color) {
	      case 'GREEN':
	        $scope.entry.searchResultTable.GREEN = !$scope.entry.searchResultTable.GREEN;
	        return;
	      case 'YELLOW':
	        $scope.entry.searchResultTable.YELLOW = !$scope.entry.searchResultTable.YELLOW;
	        return;	        
	     case 'ORANGE':
	        $scope.entry.searchResultTable.ORANGE = !$scope.entry.searchResultTable.ORANGE;
	        return;
	     case 'RED':
	        $scope.entry.searchResultTable.RED = !$scope.entry.searchResultTable.RED;
	        return; 
	     case 'NO_RESULT':
	        $scope.entry.searchResultTable.NO_RESULT = !$scope.entry.searchResultTable.NO_RESULT;
	        return;        
	    }
	  };  

	  $scope.getMaxMetricDate = function (metricResults) {
	    var date = metricResults[0].DATE;
	    for (var i=0; i<metricResults.length; i++) {
	      if (metricResults[i].VALUE !== null) {
	        date = metricResults[i].DATE;
	      }
	    }  
	    return date;
	  };


	  // opcoId?fromDate?toDate?frequency
	  var metricDataGroup, obj;
	  View.getAllMetricsForPeriod($stateParams.frequency, $stateParams.opcoId, $scope.rangeFromDate, $scope.rangeToDate, $stateParams.finetuned)
	  .then(function(data) {
	    if ($scope.frequency === 'M') {
	      metricDataGroup = _.groupBy(data, 'MC_KEY');

	      for (obj in metricDataGroup) {
	        $scope.metricData.push(metricDataGroup[obj]);
	      }
	    }
	    else {
	      metricDataGroup = _.groupBy(data, 'METRIC_ID');
	    
	      for (obj in metricDataGroup) {
	        $scope.metricData.push(metricDataGroup[obj]);
	      }      
	    }

	    $scope.metricDataHeader = _.sample($scope.metricData, 1)[0]; 

	    //console.log($scope.metricData);
	  });

	  $scope.$watch('entry.OPCO_ID', function(){
	      if ($scope.entry.OPCO_ID) {
	        $state.go('metricResultTable', {opcoId:$scope.entry.OPCO_ID, month: $stateParams.month});
	      }
	  });

	  $scope.$watch('entry.overviewShowFineTunedOnly', function(){
	      if ($scope.entry.OPCO_ID) {
	        $state.go('metricResultTable', {finetuned: $scope.entry.overviewShowFineTunedOnly});
	      }
	  });
  }
}

angular.module('amxApp')
  .component('metricResultTable', {
    templateUrl: 'app/amx/routes/metricResultTable/metricResultTable.html',
    controller: MetricResultTableComponent
  });

})();
