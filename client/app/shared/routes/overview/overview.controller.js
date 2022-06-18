'use strict';
(function(){

class OverviewComponent {
  constructor($scope, $rootScope, $cookies, Entry, Lookup) {

	$scope.init = function (){
	    $scope.entry = Entry;

	    $scope.moment = moment;

	    $scope.metrics = [];
	    $scope.metricsSummary = {};
	    $scope.overview = {};
	    $scope.overviewDailyChart = {};
	    $scope.overviewDailyTable = {};

	    $scope.overviewMonthlyChart = {};
	    $scope.overviewMonthlyTable = {};

	    //$scope.entry.overviewShowFineTunedOnly = '%';

	    $scope.overviewChartOptions = {
	      padding: {
	          top: 0,
	          right: 20,
	          bottom: 10,
	          left: 70,
	      },    
	      size: {height: 320},
	      legend: {show: false},
	      data: {
	        x : 'x',
	        rows: [],
	        type: 'bar',
	        groups: [['Green', 'Yellow', 'Red', 'Orange', 'No result']],
	        order: null
	      },
	      color: {
	        pattern: ['#27AE60', '#D9D31C', '#E74C3C', '#E7A23C', '#DDDDDD', '#428BCA']
	      },
	      axis: {
	            x: {
	                tick: {
	                  type: 'timeseries',
	                  format: function (d) { return moment(d).format('MMM.YYYY'); },
	                  fit: true,
	                },
	              },      
	            y: {
	                //label: "%",
	                //position: 'inner-center',
	                //show: true,                  
	                tick: {
	                  format: function (d) { return Number(d).toFixed(2) + '	 %'; },
	                  fit: true
	                },
	                min: 0,
	                max: 100,
	                padding: {top:0, bottom:0},
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

	  };

	  $scope.init();

	$scope.reloadOverview = function () {
	      /*
	      // Heatmap calendar
	      View.getDatoSummaryDaily($scope.entry.OPCO_ID).then(function (data) {
	        $scope.metricsSummary = data;
	        setTimeout (function () {
	          $rootScope.$broadcast('calHeatmapUpdate',{});  
	        });    
	      });
	      */
	      
	      // Bar Charts
	      Lookup.getOverview('D', $scope.entry.OPCO_ID, ($scope.entry.overviewShowFineTunedOnly=='N'?'%':'Y')).then(function (data) {
	        $scope.overview = data;
	        $scope.overviewDailyTable = data;    
	       
	        var rows = [];
	        rows.push(['x', 'Green', 'Yellow', 'Red', 'Orange', 'No result']);
	        for (var i=0; i<data.length; i++) {
	          rows.push([data[i].MONTH, data[i].GREEN, data[i].YELLOW, data[i].RED, data[i].ORANGE, data[i].NO_RESULT]);
	        }
	        $scope.overviewDailyChart = rows;    
	        //Update chart
	        setTimeout (function () {
	          $rootScope.$broadcast('c3ChartUpdate',{}); 
	        }, 100); 
	      }); 

	      Lookup.getOverview('M', $scope.entry.OPCO_ID, ($scope.entry.overviewShowFineTunedOnly=='N'?'%':'Y')).then(function (data) {
	        $scope.overview = data;
	        $scope.overviewMonthlyTable = data;    
	       
	        var rows = [];
	        rows.push(['x', 'Green', 'Yellow', 'Red', 'Orange', 'No result']);
	        for (var i=0; i<data.length; i++) {
	          rows.push([data[i].MONTH, data[i].GREEN, data[i].YELLOW, data[i].RED, data[i].ORANGE, data[i].NO_RESULT]);
	        }
	        $scope.overviewMonthlyChart = rows;    
	        //Update chart
	        setTimeout (function () {
	          $rootScope.$broadcast('c3ChartUpdate',{}); 
	        }, 100); 
	      });
	  };

	  $scope.$watch('entry.OPCO_ID', function () { $scope.reloadOverview(); });

	  $scope.calOptions = {
	    itemName: ['dato', 'datos'],
	    cellSize: 22,
	    cellRadius: 0,
	    domain: 'month',
	    domainGutter: 10,
	    domainLabelFormat: function(date) {   return moment(date).format('MMMM, YYYY');   },
	    subDomain: 'day',
	    subDomainTextFormat: function(date) {   return moment(date).format('DD');   },
	    highlight: [moment().toDate()],  
	    start: moment().subtract(5, 'months').toDate(),
	    onClick: function () { 
	    						// (date, value)
	                //$scope.getMetrics($scope.entry.OPCO_ID, date); 
	              },
	    range: Number($scope.entry.windowWidth)/200,
	    legend: [0, 20, 40, 60, 80],
	    displayLegend: true,
	    nextSelector: '#cal-next',
	    previousSelector: '#cal-prev'        
	  };

  }
}

angular.module('amxApp')
  .component('overview', {
    templateUrl: 'app/shared/routes/overview/overview.html',
    controller: OverviewComponent,

  });

})();
