'use strict';

(function(){

class CvgOverviewComponent {
  constructor($scope, Entry, Coverage, $state, $stateParams, ConfirmModal, $cookies) {
    $scope.entry = Entry;
    $scope.isDisabled = $scope.entry.isDisabled();
    $scope.loadFinished = false;

    $scope.total = {TOTAL_VALUE_COVERAGE:0};
    $scope.lobs = [];
    $scope.productSegments = [];
    $scope.productGroups = [];

    // Set OPCO and month if not provided

    if ($stateParams.month === undefined) {
      if ($cookies.get('searchMDmonth')) {
        $state.go('cvgOverview', {opcoId: $scope.entry.OPCO_ID, month: $cookies.get('searchMDmonth')}, {reload: true});
      }
      else {
        $state.go('cvgOverview', {opcoId: $scope.entry.OPCO_ID, month: moment().format('YYYY-MM')}, {reload: true});
      }
    }  
    else if ($stateParams.opcoId === undefined) {
      $state.go('cvgOverview', {opcoId: $scope.entry.OPCO_ID, month: $stateParams.month}, {reload: true});
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


	  // if ($stateParams.opcoId === undefined && $stateParams.month === undefined) {
   //    if ($cookies.get('searchMDmonth')) {
   //      $state.go('cvgOverview', {opcoId: $scope.entry.OPCO_ID, month: $cookies.get('searchMDmonth')}, {reload: true});
   //    }
   //    else {
   //      $state.go('cvgOverview', {opcoId: $scope.entry.OPCO_ID, month: moment().format('YYYY-MM')}, {reload: true});
   //    }
	  // }    

   //  // Set OPCO if not provided
   //  if ($stateParams.opcoId === undefined) {
   //    $state.go('cvgOverview', {opcoId: $scope.entry.OPCO_ID, month: $stateParams.month}, {reload: true});
   //  }

   //  if (!moment($stateParams.month, 'YYYY-MM', true).isValid()) {
   //    if ($cookies.get('searchMDmonth')) {
   //      $state.go('cvgOverview', {opcoId:$scope.entry.OPCO_ID, month:$cookies.get('searchMDmonth')});
   //    }
   //    else {
   //      $state.go('cvgOverview', {opcoId:$scope.entry.OPCO_ID, month:moment().format('YYYY-MM')});
   //    }
   //  }

   //  if ($cookies.get('searchMDmonth') !== $stateParams.month) {
   //    $cookies.put('searchMDmonth', $stateParams.month);
   //  }
   //  $scope.entry.searchMDmonth = $stateParams.month;

    $scope.workMonth = $stateParams.month;
    $scope.workMonthText = moment($stateParams.month, 'YYYY-MM').format('MMMM, YYYY');

    $scope.prevMonth = moment($stateParams.month, 'YYYY-MM').subtract(1, 'months').format('YYYY-MM');
    $scope.prevMonthText = moment($stateParams.month, 'YYYY-MM').subtract(1, 'months').format('MMMM, YYYY');
    
    $scope.nextMonth = moment($stateParams.month, 'YYYY-MM').add(1, 'months').format('YYYY-MM');
    $scope.nextMonthText = moment($stateParams.month, 'YYYY-MM').add(1, 'months').format('MMMM, YYYY');
    
    $scope.currMonth = moment().format('YYYY-MM');
    $scope.currMonthText = moment().format('MMMM, YYYY');

    $scope.forDate = moment($stateParams.month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

	  // Sankey Diagram
		$scope.sankeyDiagramConfig = {};
		$scope.sankeyDiagramConfig.links = [];
    $scope.sankeyDiagramConfig.units = 'EUR';
    $scope.sankeyDiagramConfig.width = 'window';

    var cvgOverviewChartOptions = {
      padding: {
          top: -40,
          right: 20,
          bottom: 20,
          left: 220,
      },    
      size: {height: 100},
      legend: {show: true},
      data: {
        x : 'x',
        rows: [],
        type: 'bar',
        groups: [['RPN Residual', 'RPN Covered'], ['Value Residual', 'Value Covered']],
        order: null,
        labels: {}
      },
      color: {
        pattern: ['#27AE60', '#EEEDDD']
      },
      axis: {
            rotated: true,
            x: {
                type: 'categorized',
                tick: {multiline: false, rotate: 0}
              },      
            y: {
                //label: "%",
                //position: 'inner-center',
                //show: true,                  
                tick: {
                  format: function (d) { return Number(d).toFixed(0); },
                  fit: true
                },
                min: 0,
                padding: {top:0, bottom:0},
              }
      },
      tooltip: {
          show: true,
          grouped: true // Default true
      },
      grid: {
        lines: {
          front: false
        },
        x: {
            show: false,
            lines: [
                {value: 'Postpaid Recurring fees', text: 'Postpaid', position: 'end'},
                {value: 'Prepaid One time charges', text: 'Prepaid', position: 'end'},
                {value: 'Wholesale Interconnection Fixnet', text: 'Wholesale', position: 'end'},
                {value: 'Special Billing Projects', text: 'Special Billing', position: 'end'},
            ]          
        },
        y: {
          show: true
        }
      }    
    };

    $scope.cvgOverviewChartOptionsTotal = angular.copy(cvgOverviewChartOptions);

    $scope.cvgOverviewChartOptionsLOB = angular.copy(cvgOverviewChartOptions);

    $scope.cvgOverviewChartOptionsPG = angular.copy(cvgOverviewChartOptions);

    // Coverage.getSankeyOverview($stateParams.opcoId).then(function(data) {
    //   $scope.sankeyDiagramConfig.links = _.filter(data, function(e) { return e.value > 0; });
    //   $scope.$broadcast('sankeyDiagramUpdate',{});
    //   $scope.loadFinished = true;
    // });

    Coverage.getProductSegmentsHistory($stateParams.opcoId, $scope.forDate)
      .then(function(data){
        $scope.productSegments = data;
        //$scope.productSegments.forEach(function(e){e.COVERAGE = Math.floor(Math.random() * 100 + 1);})
        $scope.total = _.map(_.groupBy(data, 'OPCO_ID'), function(g) {
          return { 
              TOTAL_PS_COUNT: _.reduce(g, function(m,x) { return m + 1; }, 0),
              TOTAL_VALUE: _.reduce(g, function(m,x) { return m + Math.abs(x.PS_VALUE); }, 0),
              TOTAL_VALUE_RATIO: _.reduce(g, function(m,x) { return m + x.PS_TOTAL_VALUE_RATIO; }, 0),
              TOTAL_RISK_NODE_COUNT: _.reduce(g, function(m,x) { return m + x.RISK_COUNT; }, 0),
              TOTAL_RPN: _.reduce(g, function(m,x) { return m + x.RPN_COUNT; }, 0),
              TOTAL_VALUE_COVERAGE: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.PS_TOTAL_VALUE_RATIO/100; }, 0),
              TOTAL_RPN_COVERAGE: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.RPN_COUNT/100; }, 0)
            };
        })[0];

        $scope.lobs = _.map(_.groupBy(data, 'LOB'), function(g) {
          return { 
              LOB: _.reduce(g, function(m,x) { return x.LOB; }, 0),
              PS_COUNT: _.reduce(g, function(m,x) { return m + 1; }, 0),
              LOB_VALUE: _.reduce(g, function(m,x) { return m + Math.abs(x.PS_VALUE); }, 0),
              LOB_VALUE_RATIO: _.reduce(g, function(m,x) { return m + x.PS_TOTAL_VALUE_RATIO; }, 0),
              LOB_RISK_NODE_COUNT: _.reduce(g, function(m,x) { return m + x.RISK_COUNT; }, 0),
              LOB_RPN: _.reduce(g, function(m,x) { return m + x.RPN_COUNT; }, 0),              
              LOB_VALUE_COVERAGE_P: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.PS_LOB_VALUE_RATIO/100; }, 0),
              LOB_VALUE_COVERAGE: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.PS_VALUE/100; }, 0),
              LOB_RPN_COVERAGE: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.RPN_COUNT/100; }, 0)              
            };
        });

        $scope.productGroups = _.map(_.groupBy(data, 'PRODUCT_GROUP_ID'), function(g) {
          return { 
              LOB: _.reduce(g, function(m,x) { return x.LOB; }, 0),
              PG: _.reduce(g, function(m,x) { return x.PRODUCT_GROUP; }, 0),
              PG_ID: _.reduce(g, function(m,x) { return x.PRODUCT_GROUP_ID; }, 0),
              PS_COUNT: _.reduce(g, function(m,x) { return m + 1; }, 0),
              PG_VALUE: _.reduce(g, function(m,x) { return m + Math.abs(x.PS_VALUE); }, 0),
              PG_RPN: _.reduce(g, function(m,x) { return m + x.RPN_COUNT; }, 0),              
              PG_VALUE_RATIO: _.reduce(g, function(m,x) { return m + x.PS_TOTAL_VALUE_RATIO; }, 0),
              PG_RISK_NODE_COUNT: _.reduce(g, function(m,x) { return m + x.RISK_COUNT; }, 0),
              PG_VALUE_COVERAGE_P: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.PS_GROUP_VALUE_RATIO/100; }, 0),
              PG_VALUE_COVERAGE: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.PS_VALUE/100; }, 0),              
              PG_RPN_COVERAGE: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.RPN_COUNT/100; }, 0)              
            };
        });

        $scope.loadFinished = true;

        // Value total chart
        $scope.cvgOverviewDailyChartDataTotal = [];
        $scope.cvgOverviewDailyChartDataTotal.push(['x', 'Value Covered', 'Value Residual']);
        $scope.cvgOverviewDailyChartDataTotal.push([' ',null,null]); // work around S3 styling bug
        $scope.cvgOverviewDailyChartDataTotal.push(['All', $scope.total.TOTAL_VALUE_COVERAGE, 100-$scope.total.TOTAL_VALUE_COVERAGE]);
        
        $scope.cvgOverviewChartOptionsTotal.legend.show = false;
        $scope.cvgOverviewChartOptionsTotal.tooltip.show = false;
        $scope.cvgOverviewChartOptionsTotal.size.height = 90;
        $scope.cvgOverviewChartOptionsTotal.axis.y.max = 100;
        $scope.cvgOverviewChartOptionsTotal.axis.y.tick.format = function (d) { return Number(d).toFixed(0) + '  %'; };
        $scope.cvgOverviewChartOptionsTotal.data.labels.format = function (d) { return d?(Number(d).toFixed(2) + '  %'):''; };

        // Value LoB chart
        $scope.cvgOverviewDailyChartDataLOB = [];
        $scope.cvgOverviewDailyChartDataLOB.push(['x', 'Value Covered', 'Value Residual']);
        $scope.cvgOverviewDailyChartDataLOB.push([' ',null,null]); // work around S3 styling bug
        for (var i=0; i<$scope.lobs.length; i++) {
          $scope.cvgOverviewDailyChartDataLOB.push([$scope.lobs[i].LOB, $scope.lobs[i].LOB_VALUE_COVERAGE, $scope.lobs[i].LOB_VALUE - $scope.lobs[i].LOB_VALUE_COVERAGE]);
        }
        $scope.cvgOverviewChartOptionsLOB.size.height = 210;
        $scope.cvgOverviewChartOptionsLOB.axis.y.max = _.max($scope.lobs, function(e){ return e.LOB_VALUE; }).LOB_VALUE;
        $scope.cvgOverviewChartOptionsLOB.axis.y.tick.format = function (d) { return Number(d/1000000).toFixed(0); };
        $scope.cvgOverviewChartOptionsLOB.axis.y.label = '\'M EUR';
        $scope.cvgOverviewChartOptionsLOB.data.labels.format = function (v, l, i, j) { 
          if (v == null) {
            return '';
          }
          if (l === 'Value Covered') {
            return Number(($scope.cvgOverviewDailyChartDataLOB[i+1][1]*100) / ($scope.cvgOverviewDailyChartDataLOB[i+1][1] + $scope.cvgOverviewDailyChartDataLOB[i+1][2])).toFixed(2) + ' %';
          }
        };

        // Value Product groups chart
        $scope.cvgOverviewDailyChartDataPG = [];
        $scope.cvgOverviewDailyChartDataPG.push(['x', 'Value Covered', 'Value Residual']);
        $scope.cvgOverviewDailyChartDataPG.push([' ',null,null]); // work around S3 styling bug
        for (i=0; i<$scope.productGroups.length; i++) {
          $scope.cvgOverviewDailyChartDataPG.push([$scope.productGroups[i].LOB + ' ' + $scope.productGroups[i].PG, $scope.productGroups[i].PG_VALUE_COVERAGE, $scope.productGroups[i].PG_VALUE - $scope.productGroups[i].PG_VALUE_COVERAGE]);
        }

        $scope.cvgOverviewChartOptionsPG.size.height = 680;        
        $scope.cvgOverviewChartOptionsPG.axis.y.max = $scope.cvgOverviewChartOptionsLOB.axis.y.max;
        $scope.cvgOverviewChartOptionsPG.axis.y.tick.format = function (d) { return Number(d/1000000).toFixed(0); };
        $scope.cvgOverviewChartOptionsPG.axis.y.label = '\'M EUR';
        $scope.cvgOverviewChartOptionsPG.data.labels.format = function (v, l, i, j) { 
          if (v == null) {
            return '';
          } 
          
          if (l === 'Value Covered') {
            var cvg = Number(($scope.cvgOverviewDailyChartDataPG[i+1][1]*100) / ($scope.cvgOverviewDailyChartDataPG[i+1][1] + $scope.cvgOverviewDailyChartDataPG[i+1][2])).toFixed(2);
            if (isNaN(cvg)) {
              return '0 %';
            }
            else {
              return cvg + ' %';
            }
          }
        };
        //Update chart
        setTimeout (function () {
          $scope.$broadcast('c3ChartUpdate',{}); 
        }, 100); 

    });

	  // Reload OPCO_ID change
	  $scope.$watch('entry.OPCO_ID', function(){
	    setTimeout (function () {
	      $state.go('cvgOverview', {opcoId: $scope.entry.OPCO_ID} );
	    }, 100); 
	  });
  }
}

angular.module('amxApp')
  .component('cvgOverview', {
    templateUrl: 'app/coverage/routes/cvgOverview/cvgOverview.html',
    controller: CvgOverviewComponent,
    controllerAs: 'cvgOverviewCtrl'
  });

})();
