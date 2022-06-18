'use strict';
(function(){

class DatoResultComponent {
  constructor($scope, $rootScope, Entry, Dato, View, $state, $stateParams, $cookies, Lookup) {
	  $scope.entry = Entry;
	  $scope.Math = window.Math;
		$scope.localEntry = { 'lookup': {} };

		// Areas lookup
		Lookup.lookup('getAreas').then(function (data) {
			$scope.localEntry.lookup.areas = data;
			$scope.localEntry.lookup.getAreaById = function (id) {
				return _.find($scope.localEntry.lookup.areas, function (num) { return num.AREA_ID == id; });
			};
		});
		//LOBs lookup
		Lookup.lookup('getLobs').then(function (data) {
			$scope.localEntry.lookup.lobs = data;
			$scope.localEntry.lookup.getLobById = function (id) {
				if (typeof id === 'undefined' || isNaN(id)) { id = 0; }
				return _.find($scope.localEntry.lookup.lobs, function (num) { return num.LOB_ID == id; });
			};
		});	
		//Technology lookup
		Lookup.lookup('getTechnologies').then(function (data) {
			$scope.localEntry.lookup.technologies = data;
			$scope.localEntry.lookup.getTechnologyById = function (id) {
				if (typeof id === 'undefined' || isNaN(id)) { id = 0; }
				return _.find($scope.localEntry.lookup.technologies, function (num) { return num.TECHNOLOGY_ID == id; });
			};
		});
		//Service lookup
		Lookup.lookup('getServices').then(function (data) {
			$scope.localEntry.lookup.services = data;
			$scope.localEntry.lookup.getServiceById = function (id) {
				if (typeof id === 'undefined' || isNaN(id)) { id = 0; }
				return _.find($scope.localEntry.lookup.services, function (num) { return num.SERVICE_ID == id; });
			};
		});	
						
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

	  $scope.dato = {};
	  $scope.datoLayout = {};

	  $scope.datoResults = {};
	  $scope.datoResultsByDate = {};
	  $scope.datoResultsAggByDate = {};
	  $scope.datoResultsChart = {};

	  $scope.showLayout = false;
	  $scope.showDatoInfo = false;

	  //Load data
	  $scope.loadData = function(callback) {
	    Dato.getDatoInfo($stateParams.opcoId, $stateParams.datoId)
	    .then(function (datoInfo) {
	      $scope.dato = datoInfo;

	      Dato.getDatoLayout($stateParams.opcoId, $stateParams.datoId).then(function (data) {
	        $scope.datoLayout = data;
	      });

	      // if ($scope.dato.FREQUENCY == 'D'){
	      //   View.getDatosForPeriodD($stateParams.opcoId, $stateParams.datoId, $scope.rangeFromDate, $scope.rangeToDate)
	      //   .then(function(data) {
	      //     $scope.datoResults = data;

	      //     // Group by date
	          
	      //     $scope.datoResultsByDate = _.groupBy(data, 'DATE');
	      //     // console.log($scope.datoResultsByDate);
	      //     // Aggregate
	          
	      //     $scope.datoResultsAggByDate = _.map($scope.datoResultsByDate, function(g, key) {
	      //       return { 
	      //           DATE: _.reduce(g, function(m,x) { return x.DATE; }, 0),
	      //           DATO_ID: _.reduce(g, function(m,x) { return x.DATO_ID; }, 0),
	      //           EXPECTED: _.reduce(g, function(m,x) { return x.CNT; }, 0),
	      //           RECEIVED: _.reduce(g, function(m,x) { return m + (x.FILE_ID > 0?1:0); }, 0),
	      //         };
	      //     });

	      //     // Prepare the data object for the chart 
	      //     // FORMAT:
	      //     // [x,     label1, label2, label3, ....]
	      //     // [date1,      #,      #,      #, ....]
	      //     // [date2,      #,      #,      #, ....]

	      //     var rows = [];
	      //     var labels = [];
	      //     _.each($scope.datoResultsByDate, function(datos, date) {
	      //         var datoValue = null;
	      //         labels = ['x'];
	      //         labels.push('Dato ' + $stateParams.datoId);
	      //         var row = [];
	      //         //row.push(moment(new Date(date)).format('YYYY-MM-DD'));
	      //         _.each(datos, function(dato, ord) {
	      //             labels.push(dato.LOB_NAME + "/" + dato.TECHNOLOGY_NAME + "/" + dato.SERVICE_NAME);
	      //             row.push(dato.VALUE);
	      //             if (dato.VALUE != null) datoValue += dato.VALUE;
	      //         });

	      //         row = [moment(new Date(date)).format('YYYY-MM-DD')].concat([datoValue].concat(row));
	      //         rows.push(row);
	      //     })
	      //     $scope.datoResultsChart = [labels].concat(rows);

	      //     //console.log($scope.datoResults);

	      //     setTimeout (function () {
	      //       $rootScope.$broadcast('c3ChartUpdate',{}); 
	      //     }, 300); 
	      //     callback();
	      //   });
	      // }
	      // else if ($scope.dato.FREQUENCY == 'M' || $scope.dato.FREQUENCY == 'C'){
	        
	        if ($scope.dato.FREQUENCY == 'M') {
	          $scope.rangeFromDate = moment($stateParams.month, 'YYYY-MM').startOf('year').format('YYYY-MM-DD');
	          $scope.rangeToDate = moment($stateParams.month, 'YYYY-MM').endOf('year').format('YYYY-MM-DD');

	          $scope.prevMonth = moment($stateParams.month, 'YYYY-MM').startOf('year').subtract(1, 'day').format('YYYY-MM');
	          $scope.prevMonthText = moment($stateParams.month, 'YYYY-MM').startOf('year').subtract(1, 'day').format('YYYY');
	          
	          $scope.nextMonth = moment($stateParams.month, 'YYYY-MM').endOf('year').add(1, 'day').format('YYYY-MM');
	          $scope.nextMonthText = moment($stateParams.month, 'YYYY-MM').endOf('year').add(1, 'day').format('YYYY');

	          $scope.workMonthText = moment($stateParams.month, 'YYYY-MM').format('YYYY');

	          $scope.currMonth = moment().format('YYYY-MM');    
	        }

	        View.getDatosForPeriod($scope.dato.FREQUENCY, $stateParams.opcoId, $stateParams.datoId, $scope.rangeFromDate, $scope.rangeToDate)
	        .then(function(data) {

	          $scope.datoResults = data;

	          //Group by date
	          
	          $scope.datoResultsByDate = _.groupBy(data, 'DATE');
	          //console.log($scope.datoResultsByDate);

	          //Aggregate
	          
	          // $scope.datoResultsAggByDate = _.map($scope.datoResultsByDate, function(g, key) {
	          //   return { 
	          //       DATE: _.reduce(g, function(m,x) { return x.DATE; }, 0),
	          //       DATO_ID: _.reduce(g, function(m,x) { return x.DATO_ID; }, 0),
	          //       EXPECTED: _.reduce(g, function(m,x) { return m + x.CNT; }, 0),
	          //       RECEIVED: _.reduce(g, function(m,x) { return m + (x.FILE_ID > 0?1:0); }, 0),
	          //     };
	          // });
	        
	          //$rootScope.$digest();  
	          // Prepare the data object for the chart 
	          // FORMAT:
	          // [x,     label1, label2, label3, ....]
	          // [date1,      #,      #,      #, ....]
	          // [date2,      #,      #,      #, ....]

	          var rows = [];
	          var labels = [];
	          _.each($scope.datoResultsByDate, function(datos, date) {
	              var datoValue = null;
	              labels = ['x'];
	              labels.push('Dato ' + $stateParams.datoId);
	              var row = [];
	              //row.push(moment(new Date(date)).format('YYYY-MM-DD'));
	              _.each(datos, function(dato, ord) {
	                  labels.push(dato.LOB_NAME + ' | ' + dato.TECHNOLOGY_NAME + ' | ' + dato.SERVICE_NAME);
	                  row.push(dato.VALUE);
	                  if (dato.VALUE !== null) {
	                  	datoValue += dato.VALUE;
	                  }
	              });

	              row = [moment(new Date(date)).format('YYYY-MM-DD')].concat([datoValue].concat(row));
	              rows.push(row);
	          });

	          $scope.datoResultsChart = [labels].concat(rows);

	          //console.log($scope.datoResults);

	          setTimeout (function () {
	            $rootScope.$broadcast('c3ChartUpdate',{}); 
	          }, 300); 

	          callback();
	        });      
	//      } // Frequency
	    });
	  };

	  $scope.loadData(function(){
	    
	    // Chart config / options

	    $scope.datoResultsChartOptions = {
	      padding: {
	          top: 0,
	          right: 20,
	          bottom: 0,
	          left: 60,
	      },    
	      size: {height: 250},
	      legend: {show: true },
	      data: {
	        x : 'x',
	        rows: $scope.datoResultsChart,
	        type: 'line',
	        types: {},
	        groups: []
	      },
	      axis: {
	            x: {
	                type: 'timeseries',
	                tick: {
	                  format: function(d) { return ($scope.dato.FREQUENCY=='D')?(moment(d).format('DD.MM.YYYY')):(moment(d).format('MMM YYYY')); },
	                }
	              },      
	            y: {
	                tick: {
	                  fit: true
	                }        
	              }
	      },
	      tooltip: {
	          show: true,
	          grouped: true // Default true
	      },
	      grid: {
	        y: {
	          show: true
	        }
	      }    
	    };  
	    $scope.datoResultsChartOptions.data.types['Dato ' + $stateParams.datoId] = 'area';    
	    // Chart options - end  

	  });

	  $scope.toggleLayout = function () {
	    $scope.showLayout = ! $scope.showLayout;    
	  };

	  $scope.toggleShowDatoInfo = function () {
	    $scope.showDatoInfo = ! $scope.showDatoInfo;    
	  };

	  $scope.predicate = 'DATE';
	  
	  $scope.order = function(predicate) {
	    $scope.entry.reverse = ($scope.predicate === predicate) ? !$scope.entry.reverse : false;
	    $scope.predicate = predicate;
	  };

	  $scope.$watch('entry.OPCO_ID', function(){
	      if ($scope.entry.OPCO_ID) {
	        $state.go('datoResult', {opcoId:$scope.entry.OPCO_ID, datoId:$stateParams.datoId, month: $stateParams.month});
	      }
	  }); 
  }
}

angular.module('amxApp')
  .component('datoResult', {
    templateUrl: 'app/amx/routes/datoResult/datoResult.html',
    controller: DatoResultComponent
  });

})();
