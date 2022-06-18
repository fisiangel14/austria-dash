'use strict';
(function(){

class MetricCompositeResultComponent {
  constructor($scope, $rootScope, Entry, Metric, $state, $stateParams, Lookup) {
	  //$scope.composite = {};
	  $scope.entry = Entry;
	  $scope.modalData = {};
	  $scope.chartData = {};
	  $scope.chartData = {};
	  $scope.relatedDatos = {};
	  $scope.maxBarChartValue = 0;
	  $scope.Math = window.Math;
	  $scope.workMonth = moment($stateParams.date).format('YYYY-MM');

		var metricMax = 0;
		$scope.localEntry = { 'lookup': {} };

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
		//Periodicity lookup
		Lookup.lookup('getPeriodicity').then(function (data) {
			$scope.localEntry.lookup.periodicity = data;
			$scope.localEntry.lookup.getPeriodicityById = function (id) {
				if (typeof id === 'undefined' || isNaN(id)) { id = 0; }
				return _.find($scope.localEntry.lookup.periodicity, function (num) { return num.PERIODICITY_ID == id; });
			};
		});

	  if ($stateParams.billCycle === undefined) {
	    $stateParams.billCycle = '0';
	  } 

	  if ($stateParams.opcoId === undefined) {
	    $stateParams.opcoId = String($scope.entry.OPCO_ID);
	  } 

	  if (Number($stateParams.opcoId) !== $scope.entry.OPCO_ID) {
	    $scope.entry.OPCO_ID = Number($stateParams.opcoId);
	  }  

	Metric.getMetricResult($stateParams.opcoId, $stateParams.metricId, $stateParams.billCycle, $stateParams.date)
	.then(function (data) {
	  $scope.metricResult = data;
	  
	  metricMax = 1.7 * ($scope.metricResult.OBJECTIVE + $scope.metricResult.TOLERANCE);


	  $scope.metricResult.JSON_DATO = _.sortBy($scope.metricResult.JSON_DATO, function(a) { return a.IN_DATO+a.DATE+a.LOB_ID+a.TECHNOLOGY_ID+a.SERVICE_ID; });

	  $scope.datoGroups = _.groupBy($scope.metricResult.JSON_DATO, 'IN_DATO');
	  
	  Metric.getRelatedDatos($scope.metricResult.OPCO_ID, $scope.metricResult.METRIC_ID).then(function (data) {
	    $scope.relatedDatos = data;
	  });

	  _.each($scope.datoGroups, function (value, key) {
	      var datoComposite = {};
	      datoComposite.name = key; 
	      datoComposite.row = []; 
	      var row = [];
	      var label = [];

	      var sumRow = 0;
	      var localMaxBarChartValue = 0;
	      _.each(value, function (value1) {
	          // console.log(value1);
	          label.push($scope.localEntry.lookup.getLobById(value1.LOB_ID).NAME + ' | ' + $scope.localEntry.lookup.getServiceById(value1.SERVICE_ID).NAME + ' | ' + $scope.localEntry.lookup.getTechnologyById(value1.TECHNOLOGY_ID).NAME);
	          row.push(value1.VALUE );
	          sumRow += value1.VALUE;

	          if (value1.VALUE  > $scope.maxBarChartValue) {
	          	$scope.maxBarChartValue = value1.VALUE;
	          }

	          if (value1.VALUE  > localMaxBarChartValue) {
	          	localMaxBarChartValue = value1.VALUE;
	          }

	      }); 
	      $scope.chartData[key] = [label].concat([row]);
	      $scope.chartData[key].localMaxBarChartValue = localMaxBarChartValue;
	      
	  });

	  // Dato Composition chart
	  $scope.c3configCompositePie = {  
	    padding: {
	        top: 20,
	        right: 0,
	        bottom: 0,
	        left: 10
	    },      
	    size: {height: 150, width: 130},
	    legend: {show: false },
	    data: {
	      rows: [],
	      type: 'pie'
	    }
	  };

	  // Dato Composition chart
	  $scope.c3configCompositeBar = {
	    padding: {
	        top: 0,
	        right: 20,
	        bottom: 5,
	        left: 70,
	    },    
	    size: {height: 150, width: 130},
	    legend: {show: false },
	    data: {
	      rows: [],
	      type: 'bar',
	      groups: []
	    },
	    axis: {
	          x: {
	              tick: {
	                type: 'timeseries',
	                format: function () { return moment($scope.metricResult.DATE).format('DD.MM.YYYY'); },
	              },
	            },      
	          y: {
	              tick: {
	                fit: true,
	                format: function (d) { return Math.round(d); },
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
	  $scope.c3configCompositeBar.axis.y.max = $scope.maxBarChartValue;

	  $scope.getRelatedDato = function (datoId) {
	    return _.find($scope.relatedDatos, function (obj) { return obj.DATO_ID === datoId.substr(1,3);});
	  };

	  $scope.getDerivedDatoDescription = function (datoId) {
	    if (datoId.toLowerCase().indexOf('d1') !== -1) {
	    	return 'The daily Dato value of the day before';
	    }
	    else if (datoId.toLowerCase().indexOf('d2') !== -1) { 
	    	return 'The sum of the Dato values for period between (Dato_DATE - 7) and Dato_DATE'; 
	    }
	    else if (datoId.toLowerCase().indexOf('d3') !== -1) { 
	    	return 'The sum of the Dato values for period between (Dato_DATE - 8) and (Dato_DATE - 1)';
	    }
	    else if (datoId.toLowerCase().indexOf('d4') !== -1) { 
	    	return 'The sum of the Dato values for days (Dato_DATE - 7) + (Dato_DATE - 14) + (Dato_DATE - 21) + (Dato_DATE - 28)';
	    }
	    else if (datoId.toLowerCase().indexOf('d5') !== -1) { 
	    	return 'Logarithm with base 10 of the daily Dato value';
	    }
	    else if (datoId.toLowerCase().indexOf('d6') !== -1) { 
	    	return 'The sum of the Dato values for period between (Dato_DATE - 60) and Dato_DATE' ; 
	    }
	    else if (datoId.toLowerCase().indexOf('d7') !== -1) { 
	    	return 'The value of the Dato for (Dato_DATE - 7)';
	    }
	    else if (datoId.toLowerCase().indexOf('m1') !== -1) { 
	    	return 'Value of the monthly dato divided by days of the month';
	    }
	    else if (datoId.toLowerCase().indexOf('m2') !== -1) { 
	    	return 'Value of the monthly Dato for the month before';
	    }
	    else if (datoId.toLowerCase().indexOf('m3') !== -1) { 
	    	return 'Sum of the values of the past 3 months without taking in acount the current month divided by the sum of the number of days in those 3 months';
	    }
	    else if (datoId.toLowerCase().indexOf('m4') !== -1) { 
	    	return 'Monthly average of the daily Dato e.g. sum(Dato_1 to Dato_31 )/31';
	    }
	    else if (datoId.toLowerCase().indexOf('m5') !== -1) { 
	    	return 'Monthly average of the daily Dato for previous month (like M4 but for month before)';
	    }
	    else if (datoId.toLowerCase().indexOf('m6') !== -1) { 
	    	return 'Value of the monthly dato divided by days of the month for the month before';
	    }
	    else if (datoId.toLowerCase().indexOf('c1') !== -1) { 
	    	return 'Value of the cycle Dato for the month before';
	    }

	  };

	  $scope.getDatoSum = function (datoId) {
	    return _.find($scope.metricResult.JSON_DATO_SUMS, function (obj) { return obj.IN_DATO === datoId;});
	  };

	  $scope.getDatoMaxCount = function () {
	    var count = 0;
	    for (var i=0; i< $scope.metricResult.JSON_DATO_SUMS.length; i++) {
	      if (count < $scope.metricResult.JSON_DATO_SUMS[i].CNT) {
	      	count = $scope.metricResult.JSON_DATO_SUMS[i].CNT;
	      }
	    }
	    return count;
	  };

	  $scope.getDatoDivisor = function (datoId) {
	    return _.find($scope.metricResult.JSON_DATO, function (obj) { return obj.IN_DATO === datoId;}).DIVISOR;
	  };

	  $scope.getDatoAgg = function (datoId) {
	    var datos = _.filter($scope.metricResult.JSON_DATO, function (obj) { return obj.IN_DATO === datoId;});
	    var agg = 0;
	    for (var i=0; i<datos.length; i++) {
	      agg += datos[i].VALUE;
	    }
	    return agg;
	  };

	  //Update chart
	  setTimeout (function () {
	    $rootScope.$broadcast('c3ChartUpdate',{}); 
	  });  

		// Metric history
		Metric.getMetricResultHistory($stateParams.opcoId, $stateParams.metricId, $stateParams.billCycle, $stateParams.date)
	  .then(function(data) {
	    $scope.metricResultHistory = data;
	    $scope.metricDatoLabelUnion = [];

	    var labels = [];
	    var rows = [];
	    _.each($scope.metricResultHistory, function(metric) {

	        if (metricMax < metric.VALUE) {
	        	metricMax = metric.VALUE;
	        }

	        var label = [];
	        label.push('x');
	        label.push('Metric ' + $stateParams.metricId);
	        
	        var row = [];
	        row.push(moment(new Date(metric.DATE)).format('YYYY-MM-DD'));
	        row.push(metric.VALUE);
	        
	        _.each(metric.JSON_DATO_SUMS, function(dato) {
	            label.push(dato.IN_DATO);
	            row.push(Number(dato.VAL));
	        });
	        labels.push(label);
	        rows.push(row);
	    });


	    // Create label by making an union of all distinct labels found 
	    var labelUnion = [];
	    _.each(labels, function(label) {
	      labelUnion = _.union(labelUnion, label);
	    });


	    // fill out the rows where values are missing - null fill
	    for (var r=0; r < rows.length; r++) {
	      rows[r] = rows[r].concat(Array.apply(null, Array(labelUnion.length - rows[r].length)).fill(null));
	    }

	    // Assign chart values labels + rows
	    $scope.metricResultsHistoryChart = [labelUnion].concat(rows);

	    //Sort out the Dato labels
	    for (var i=2; i<labelUnion.length; i++){
	      $scope.metricDatoLabelUnion.push(labelUnion[i].substr(1));
	    }

	  });	

	});



	$scope.$watch('entry.OPCO_ID', function(){
	    if ($scope.entry.OPCO_ID) {
	      $state.go('metricCompositeResult', {opcoId:$scope.entry.OPCO_ID, metricId:$stateParams.metricId, billCycle:$stateParams.billCycle, date:$stateParams.date});
	    }
	});
  }
}

angular.module('amxApp')
  .component('metricCompositeResult', {
    templateUrl: 'app/amx/routes/metricCompositeResult/metricCompositeResult.html',
    controller: MetricCompositeResultComponent
  });

})();
