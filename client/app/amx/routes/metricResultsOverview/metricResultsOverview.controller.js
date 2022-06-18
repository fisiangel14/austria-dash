'use strict';
(function(){

class MetricResultsOverviewComponent {
  constructor($scope, Entry, View, $state, $stateParams, $cookies, Lookup) {
  
	  $scope.entry = Entry;
		$scope.localEntry = { 'lookup': {} };

		// Areas lookup
		Lookup.lookup('getAreas').then(function (data) {
			$scope.localEntry.lookup.areas = data;
			$scope.localEntry.lookup.getAreaById = function (id) {
				return _.find($scope.localEntry.lookup.areas, function (num) { return num.AREA_ID == id; });
			};
		});
		
	  if ($stateParams.month === undefined) {
	  	if ($cookies.get('searchMDmonth')) {
	    	$state.go('metricResultsOverview', {month: $cookies.get('searchMDmonth'), opcoId: $scope.entry.OPCO_ID}, {reload: true} );
	  	} 
	  	else {
	    	$state.go('metricResultsOverview', {month: moment().format('YYYY-MM'), opcoId: $scope.entry.OPCO_ID}, {reload: true} );
	  	}
	  }  
	  else if ($stateParams.opcoId === undefined) {
	    $state.go('metricResultsOverview', {month: $stateParams.month, opcoId: $scope.entry.OPCO_ID}, {reload: true} );
	  }
	  else if (Number($stateParams.opcoId) !== $scope.entry.OPCO_ID) {
	    $scope.entry.OPCO_ID = Number($stateParams.opcoId);
	  }

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

	  $scope.workMonth = moment($stateParams.month, 'YYYY-MM').format('MMMM, YYYY');

	  $scope.prevMonth = moment($stateParams.month, 'YYYY-MM').subtract(1, 'months').format('YYYY-MM');
	  $scope.prevMonthText = moment($stateParams.month, 'YYYY-MM').subtract(1, 'months').format('MMMM, YYYY');
	  
	  $scope.nextMonth = moment($stateParams.month, 'YYYY-MM').add(1, 'months').format('YYYY-MM');
	  $scope.nextMonthText = moment($stateParams.month, 'YYYY-MM').add(1, 'months').format('MMMM, YYYY');
	  
	  $scope.currMonth = moment().format('YYYY-MM');
	  $scope.currMonthText = moment().format('MMMM, YYYY');
	  
	  $scope.rangeFromDate = moment($stateParams.month, 'YYYY-MM').format('YYYY-MM-DD');
	  $scope.rangeToDate = moment($stateParams.month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

	  $scope.markDate = {};
	  $scope.markDate[moment($stateParams.month, 'YYYY-MM').unix()] = 4;

	  $scope.metricResults = [];
	  $scope.metricResultsSummary = [];

	  $scope.searchMetricOverviewClear = function () {
	    //console.log('Clear');
	    $scope.entry.searchMetricOverview.text = '';
	    $scope.entry.searchMetricOverview.GREEN = true;
	    $scope.entry.searchMetricOverview.YELLOW = true;
	    $scope.entry.searchMetricOverview.RED = true;
	    $scope.entry.searchMetricOverview.ORANGE = true;
	    $scope.entry.searchMetricOverview.NO_RESULT = true;
	    $scope.entry.searchMetricOverview.D = true;
	    $scope.entry.searchMetricOverview.M = true;
	    $scope.entry.searchMetricOverview.C = true;     
	  };

	  // Button values
	  $scope.searchMetricOverviewToggle = function (color) {
	    switch (color) {
	      case 'GREEN':
	        $scope.entry.searchMetricOverview.GREEN = !$scope.entry.searchMetricOverview.GREEN;
	        return;
	      case 'YELLOW':
	        $scope.entry.searchMetricOverview.YELLOW = !$scope.entry.searchMetricOverview.YELLOW;
	        return;	        
	     case 'ORANGE':
	        $scope.entry.searchMetricOverview.ORANGE = !$scope.entry.searchMetricOverview.ORANGE;
	        return;
	     case 'RED':
	        $scope.entry.searchMetricOverview.RED = !$scope.entry.searchMetricOverview.RED;
	        return; 
	     case 'NO_RESULT':
	        $scope.entry.searchMetricOverview.NO_RESULT = !$scope.entry.searchMetricOverview.NO_RESULT;
	        return; 
	     case 'D':
	        $scope.entry.searchMetricOverview.D = !$scope.entry.searchMetricOverview.D;
	        return; 
	     case 'M':
	        $scope.entry.searchMetricOverview.M = !$scope.entry.searchMetricOverview.M;
	        return; 
	     case 'C':
	        $scope.entry.searchMetricOverview.C = !$scope.entry.searchMetricOverview.C;
	        return;         
	    }
	  };  

	View.getMetricResultsSummary($scope.rangeFromDate, $scope.rangeToDate, $scope.entry.OPCO_ID)
	.then(function (data) {
	  for (var i=0; i<data.length; i++){
	    data[i].METRIC_OPCO_KEY = data[i].METRIC_ID + data[i].OPCO_ID;
	  }
	      
	  //var groupsAll = _.groupBy(data, 'METRIC_ID');
	  var groupsOpco = _.groupBy(data, 'METRIC_OPCO_KEY');

	  //Calculate the sum per DATO_ID
	  var sumsOpco = _.map(groupsOpco, function(g) {
	    return { 
	        DATE: _.reduce(g, function(m,x) { return x.DATE; }, 0),
	        METRIC_ID: _.reduce(g, function(m,x) { return x.METRIC_ID; }, 0),
	        NAME: _.reduce(g, function(m,x) { return x.NAME; }, 0),
	        IMPLEMENTED: _.reduce(g, function(m,x) { return x.IMPLEMENTED; }, 0),
	        AREA_ID: _.reduce(g, function(m,x) { return x.AREA_ID; }, 0),
	        OPCO_ID: _.reduce(g, function(m,x) { return x.OPCO_ID; }, 0),
	        FREQUENCY: _.reduce(g, function(m,x) { return x.FREQUENCY; }, 0),
	        GREEN: _.reduce(g, function(m,x) { return m + x.GREEN; }, 0),
	        YELLOW: _.reduce(g, function(m,x) { return m + x.YELLOW; }, 0),
	        ORANGE: _.reduce(g, function(m,x) { return m + x.ORANGE; }, 0),
	        RED: _.reduce(g, function(m,x) { return m + x.RED; }, 0),
	        NO_RESULT: _.reduce(g, function(m,x) { return m + x.NO_RESULT; }, 0),
	      };
	  });

	  // //Calculate the sum per DATO_ID
	  // var sumsAll = _.map(groupsAll, function(g, key) {
	  //   return { 
	  //       DATE: _.reduce(g, function(m,x) { return x.DATE; }, 0),
	  //       METRIC_ID: _.reduce(g, function(m,x) { return x.METRIC_ID; }, 0),
	  //       NAME: _.reduce(g, function(m,x) { return x.NAME; }, 0),
	  //       AREA_ID: _.reduce(g, function(m,x) { return x.AREA_ID; }, 0),
	  //       OPCO_ID: _.reduce(g, function(m,x) { return 0; }, 0),
	  //       FREQUENCY: _.reduce(g, function(m,x) { return x.FREQUENCY; }, 0),
	  //       GREEN: _.reduce(g, function(m,x) { return m + x.GREEN; }, 0),
	  //       ORANGE: _.reduce(g, function(m,x) { return m + x.ORANGE; }, 0),
	  //       RED: _.reduce(g, function(m,x) { return m + x.RED; }, 0),
	  //       NO_RESULT: _.reduce(g, function(m,x) { return m + x.NO_RESULT; }, 0),
	  //     };
	  // });

	  $scope.metricResultsSummary = _.groupBy(sumsOpco, 'AREA_ID');
	  $scope.metricResults = sumsOpco;

	});


	// On OPCO_ID change
	$scope.$watch('entry.OPCO_ID', function(){
	  
	  $scope.metricResults = [];
	  $scope.metricResultsSummary = [];

	  setTimeout (function () {
	    $state.go('metricResultsOverview', {month: $stateParams.month, opcoId: $scope.entry.OPCO_ID} );
	  }, 100); 
	          
	});  
  }
}

angular.module('amxApp')
  .component('metricResultsOverview', {
    templateUrl: 'app/amx/routes/metricResultsOverview/metricResultsOverview.html',
    controller: MetricResultsOverviewComponent
  });

})();
