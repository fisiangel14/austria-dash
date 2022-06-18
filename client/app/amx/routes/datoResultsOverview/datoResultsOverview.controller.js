'use strict';
(function(){

class DatoResultsOverviewComponent {
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
	    	$state.go('datoResultsOverview', {month: $cookies.get('searchMDmonth'), opcoId: $scope.entry.OPCO_ID}, {reload: true} );
	  	}
	  	else {
	    	$state.go('datoResultsOverview', {month: moment().format('YYYY-MM'), opcoId: $scope.entry.OPCO_ID}, {reload: true} );
	  	}
	  }  
	  else if ($stateParams.opcoId === undefined) {
	    $state.go('datoResultsOverview', {month: $stateParams.month, opcoId: $scope.entry.OPCO_ID}, {reload: true} );
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
	  
	  $scope.workMonth = $stateParams.month;
	  $scope.workMonthText = moment($stateParams.month, 'YYYY-MM').format('MMMM, YYYY');

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

	  $scope.datoResults = [];
	  $scope.datoResultsSummary = [];

	  $scope.monthSelectorOptions = {
	    itemName: ['', ''],
	    cellSize: 25,
	    cellRadius: 0,
	    domain: 'year',
	    data: $scope.markDate,
	    domainLabelFormat: function(date) {   return moment(date).format('YYYY');   },
	    subDomain: 'month',
	    subDomainTextFormat: function(date) {   return moment(date).format('MM');   },
	    highlight: [],  
	    start: moment().subtract(5, 'months').toDate(),
	    onClick: function (date, value) { 
	                //$scope.goToDate(date); 
	                return $state.go('datoResultsOverview', {month: moment(date).format('YYYY-MM')}, { reload: true });
	              },
	    range: Number($scope.entry.windowWidth)/500,
	    domainGutter: 10,
	    legend: [0, 1, 2, 3],
	    displayLegend: false,
	    nextSelector: '#cal-next',
	    previousSelector: '#cal-prev'
	  };  

	  // setTimeout (function () {
	  //   $rootScope.$broadcast('calHeatmapUpdate',{});  
	  // });  

	  $scope.goToDate = function (date) {
	    //console.log(date);
	    //$scope.entry.searchDatoOverview.date = moment(date).format('YYYY-MM-DD');
	    return $state.go('datoResultsOverview', {month: moment(date).format('YYYY-MM')}, { reload: true });
	  };

	  $scope.searchDatoOverviewClear = function () {
	    //console.log('Clear');
	    $scope.entry.searchDatoOverview.text = '';
	    $scope.entry.searchDatoOverview.GREEN = true;
	    $scope.entry.searchDatoOverview.RED = true;
	    $scope.entry.searchDatoOverview.ORANGE = true;
	    $scope.entry.searchDatoOverview.NO_RESULT = true;
	    $scope.entry.searchDatoOverview.D = true;
	    $scope.entry.searchDatoOverview.M = true;
	    $scope.entry.searchDatoOverview.C = true;    
	  };

	  $scope.searchDatoOverviewToggle = function (color) {
	    switch (color) {
	      case 'GREEN':
	        $scope.entry.searchDatoOverview.GREEN = !$scope.entry.searchDatoOverview.GREEN;
	        return;
	     case 'ORANGE':
	        $scope.entry.searchDatoOverview.ORANGE = !$scope.entry.searchDatoOverview.ORANGE;
	        return;
	     case 'RED':
	        $scope.entry.searchDatoOverview.RED = !$scope.entry.searchDatoOverview.RED;
	        return; 
	     case 'NO_RESULT':
	        $scope.entry.searchDatoOverview.NO_RESULT = !$scope.entry.searchDatoOverview.NO_RESULT;
	        return;
	     case 'D':
	        $scope.entry.searchDatoOverview.D = !$scope.entry.searchDatoOverview.D;
	        return; 
	     case 'M':
	        $scope.entry.searchDatoOverview.M = !$scope.entry.searchDatoOverview.M;
	        return; 
	     case 'C':
	        $scope.entry.searchDatoOverview.C = !$scope.entry.searchDatoOverview.C;
	        return;              
	    }
	  };

	  View.getDatoResultsSummary($scope.rangeFromDate, $scope.rangeToDate, $scope.entry.OPCO_ID)
	  .then(function (data) {
	    //console.log($scope.datoResultsSummary);
	    for (var i=0; i<data.length; i++){
	      data[i].DATO_OPCO_KEY = data[i].AREA_ID + data[i].DATO_ID + data[i].OPCO_ID;
	      data[i].DATO_ALL_KEY = data[i].AREA_ID + data[i].DATO_ID;
	    }

	    var groupsAll = _.groupBy(data, 'DATO_ALL_KEY');
	    var groupsOpco = _.groupBy(data, 'DATO_OPCO_KEY');

	//    console.log(groupsOpco);

	    //Calculate the sum per DATO_ID
	    var sumsOpco = _.map(groupsOpco, function(g, key) {
	      return { 
	          DATE: _.reduce(g, function(m,x) { return x.DATE; }, 0),
	          DATO_ID: _.reduce(g, function(m,x) { return x.DATO_ID; }, 0),
	          NAME: _.reduce(g, function(m,x) { return x.NAME; }, 0),
	          AREA_ID: _.reduce(g, function(m,x) { return x.AREA_ID; }, 0),
	          OPCO_ID: _.reduce(g, function(m,x) { return x.OPCO_ID; }, 0),
	          FREQUENCY: _.reduce(g, function(m,x) { return x.FREQUENCY; }, 0),
	          GREEN: _.reduce(g, function(m,x) { return m + x.GREEN; }, 0),
	          ORANGE: _.reduce(g, function(m,x) { return m + x.ORANGE; }, 0),
	          RED: _.reduce(g, function(m,x) { return m + x.RED; }, 0),
	          // NO_RESULT: _.reduce(g, function(m,x) { return m + x.NO_RESULT; }, 0),
	        };
	    });

	    //Calculate the sum per DATO_ID
	    // var sumsAll = _.map(groupsAll, function(g, key) {
	    //   return { 
	    //       DATE: _.reduce(g, function(m,x) { return x.DATE; }, 0),
	    //       DATO_ID: _.reduce(g, function(m,x) { return x.DATO_ID; }, 0),
	    //       NAME: _.reduce(g, function(m,x) { return x.NAME; }, 0),
	    //       AREA_ID: _.reduce(g, function(m,x) { return x.AREA_ID; }, 0),
	    //       OPCO_ID: _.reduce(g, function(m,x) { return 0; }, 0),
	    //       FREQUENCY: _.reduce(g, function(m,x) { return x.FREQUENCY; }, 0),
	    //       GREEN: _.reduce(g, function(m,x) { return m + x.GREEN; }, 0),
	    //       ORANGE: _.reduce(g, function(m,x) { return m + x.ORANGE; }, 0),
	    //       RED: _.reduce(g, function(m,x) { return m + x.RED; }, 0),
	    //       // NO_RESULT: _.reduce(g, function(m,x) { return m + x.NO_RESULT; }, 0),
	    //     };
	    // });

	    // $scope.$watch('entry.OPCO_ID', function(){
	    //     if ($scope.entry.OPCO_ID) {
	    //       $scope.datoResultsSummary = _.groupBy(sumsOpco, 'AREA_ID');
	    //       $scope.datoResults = sumsOpco;
	    //     }
	    //     else {
	    //       $scope.datoResultsSummary = _.groupBy(sumsAll, 'AREA_ID');
	    //       $scope.datoResults = sumsAll;
	    //     }
	    // });

	    $scope.datoResultsSummary = _.groupBy(sumsOpco, 'AREA_ID');
	    $scope.datoResults = sumsOpco;
	  });


	  // On OPCO_ID change
	  $scope.$watch('entry.OPCO_ID', function(){
	    
	    $scope.datoResults = [];
	    $scope.datoResultsSummary = [];

	    setTimeout (function () {
	      $state.go('datoResultsOverview', {month: $stateParams.month, opcoId: $scope.entry.OPCO_ID} );
	    }, 100); 
	            
	  });  
  }
}

angular.module('amxApp')
  .component('datoResultsOverview', {
    templateUrl: 'app/amx/routes/datoResultsOverview/datoResultsOverview.html',
    controller: DatoResultsOverviewComponent
  });

})();
