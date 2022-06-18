'use strict';

(function(){

class HarvestSummaryComponent {
constructor($rootScope, $scope, $sanitize, $cookies, Entry, Incident, $state, $stateParams) {
	$scope.entry = Entry;
	$scope.Math = window.Math;
	$scope.balancedScorecard = [];
	$scope.loadFinished = false;

	if (!moment($stateParams.year, 'YYYY', true).isValid()) {
		$state.go('harvestSummary', {year:moment().format('YYYY'), opcoId:$scope.entry.OPCO_ID});
	}

	if (Number($stateParams.opcoId) != $scope.entry.OPCO_ID) {
		$scope.entry.OPCO_ID = Number($stateParams.opcoId);
	}

	$scope.currYear = moment().format('YYYY');
	$scope.workYear = $stateParams.year;
	$scope.prevYear = moment($stateParams.year, 'YYYY').startOf('year').subtract(1, 'day').format('YYYY');
	$scope.nextYear = moment($stateParams.year, 'YYYY').endOf('year').add(1, 'day').format('YYYY');


	$scope.cvgOverviewChartOptions = {
	      padding: {
	          top: 20,
	          right: 100,
	          bottom: 20,
	          left: 100,
	      },    
	      size: {
	      		height: 400
	      },
	      legend: {
	      	show: true
	      },
	      data: {
	        x : 'x',
	        rows: [],
	        type: 'bar',
	        order: null,
	        labels: {},
	  		color: function (color, d) {
	  			if (getSelectedOpco() > 0) {
					if (d.index == getSelectedOpco() - 36) {
						return '#27AE60';
					}
					else {
						return '#DDDDDD';
					}
	  			}
	  			else {
	  				return getOpcoColor(d.index + 36);
	  			}
	  		}
	      },
	      color: {
	        pattern: ['#27AE60', '#D9D31C', '#E74C3C', '#E7A23C', '#DDDDDD', '#428BCA']
	      },
	      axis: {
	            rotated: false,
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
	          front: true
	        },
	        x: {
	            show: false,
	            lines: [
	            ]
	        },
	        y: {
	          	show: false,
	            lines: [
	            ] 			          
	        }
	      }    
	};

	var getSelectedOpco = function() {
		return Number($stateParams.opcoId);
	};

	var getOpcoColor = function(opcoId) {
		switch (opcoId) {
			case 36: return '#79C15A';
			case 37: return '#FACDC8';
			case 38: return '#F8DA4C';
			case 39: return '#F37D6E';
			case 40: return '#A1C4DD';
			case 41: return '#0B8D4E';
			case 42: return '#90A9CD';
			default: return '#DDDDDD';
		}
	};

	Incident.getBalancedScorecard($scope.workYear)
	.then( function (data) {
		$scope.balancedScorecard = data;

		var dataSum = _.map(_.groupBy(data), function(g) {
		return { 
		    OPCO_ID: _.reduce(g, function(m,x) { return 0; }, 0),
		    OPCO_NAME: _.reduce(g, function(m,x) { return $scope.entry.lookup.getOpcoById(0).OPCO_NAME; }, 0),
		    CNT: _.reduce(g, function(m,x) { return m + 1; }, 0),
		    I_REVENUE_LOSS: _.reduce(g, function(m,x) { return m + x.I_REVENUE_LOSS; }, 0),
		    R_REVENUE_LOSS: _.reduce(g, function(m,x) { return m + x.R_REVENUE_LOSS; }, 0),
		    P_REVENUE_LOSS: _.reduce(g, function(m,x) { return m + x.P_REVENUE_LOSS; }, 0),
		    I_EXCESSIVE_COSTS: _.reduce(g, function(m,x) { return m + x.I_EXCESSIVE_COSTS; }, 0),
		    R_EXCESSIVE_COSTS: _.reduce(g, function(m,x) { return m + x.R_EXCESSIVE_COSTS; }, 0),
		    P_EXCESSIVE_COSTS: _.reduce(g, function(m,x) { return m + x.P_EXCESSIVE_COSTS; }, 0),
		    IMPACT_REVENUE_LOSS: _.reduce(g, function(m,x) { return m + x.IMPACT_REVENUE_LOSS; }, 0),
		    IMPACT_OVERCHARGING: _.reduce(g, function(m,x) { return m + x.IMPACT_OVERCHARGING; }, 0),
		    IMPACT_FINANCIAL_REPORTING_MISSTATEMENT: _.reduce(g, function(m,x) { return m + x.IMPACT_FINANCIAL_REPORTING_MISSTATEMENT; }, 0),
		    IMPACT_EXCESSIVE_COSTS: _.reduce(g, function(m,x) { return m + x.IMPACT_EXCESSIVE_COSTS; }, 0),
		    FINANCIAL_IMPACT: _.reduce(g, function(m,x) { return m + x.FINANCIAL_IMPACT; }, 0),
		    REVENUE_IMPACT: _.reduce(g, function(m,x) { return m + x.REVENUE_IMPACT; }, 0),
		    INCIDENT_COUNT_NO_LOSS: _.reduce(g, function(m,x) { return m + x.INCIDENT_COUNT_NO_LOSS; }, 0),
		    INCIDENT_COUNT_TOTAL: _.reduce(g, function(m,x) { return m + x.INCIDENT_COUNT_TOTAL; }, 0),
		    TOTAL_REVENUES: _.reduce(g, function(m,x) { return m + x.TOTAL_REVENUES; }, 0),
		    TOTAL_COVERAGE: _.reduce(g, function(m,x) { return m + x.TOTAL_COVERAGE; }, 0),
		    REVENUE_LOST: _.reduce(g, function(m,x) { return m + x.REVENUE_LOST; }, 0),
		    REVENUE_OVERCHARGED: _.reduce(g, function(m,x) { return m + x.REVENUE_OVERCHARGED; }, 0),
		    REVENUE_MISSREPORTED: _.reduce(g, function(m,x) { return m + x.REVENUE_MISSREPORTED; }, 0),
		    RECOVERED_IMPACT_TOTAL: _.reduce(g, function(m,x) { return m + x.RECOVERED_IMPACT_TOTAL; }, 0),
		    PREVENTED_IMPACT_TOTAL: _.reduce(g, function(m,x) { return m + x.PREVENTED_IMPACT_TOTAL; }, 0),
		    MEAN_TIME_TO_DETECT: _.reduce(g, function(m,x) { return m + x.MEAN_TIME_TO_DETECT; }, 0),
		    MEAN_TIME_TO_CLOSE: _.reduce(g, function(m,x) { return m + x.MEAN_TIME_TO_CLOSE; }, 0),
		    COLLECTION_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.COLLECTION_INCIDENT_COUNT; }, 0),
		    ACCOUNTING_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.ACCOUNTING_INCIDENT_COUNT; }, 0),
		    VALUE_ADDED_SERVICES_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.VALUE_ADDED_SERVICES_INCIDENT_COUNT; }, 0),
		    BILLING_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.BILLING_INCIDENT_COUNT; }, 0),
		    INTERCONNECTION_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.INTERCONNECTION_INCIDENT_COUNT; }, 0),
		    LOGISTICS_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.LOGISTICS_INCIDENT_COUNT; }, 0),
		    MEDIATION_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.MEDIATION_INCIDENT_COUNT; }, 0),
		    PREPAID_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.PREPAID_INCIDENT_COUNT; }, 0),
		    PROVISIONING_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.PROVISIONING_INCIDENT_COUNT; }, 0),
		    ROAMING_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.ROAMING_INCIDENT_COUNT; }, 0),
		    RATING_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.RATING_INCIDENT_COUNT; }, 0),
		    TREASURY_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.TREASURY_INCIDENT_COUNT; }, 0)
		  };
		});

		var coveredRevenues = 0;
		_.each($scope.balancedScorecard, function(e) {
			coveredRevenues += e.TOTAL_REVENUES * e.TOTAL_COVERAGE/100;
		});
		dataSum[0].TOTAL_COVERAGE = coveredRevenues / dataSum[0].TOTAL_REVENUES * 100;

		dataSum[0].MEAN_TIME_TO_DETECT = dataSum[0].MEAN_TIME_TO_DETECT / dataSum[0].CNT;
		dataSum[0].MEAN_TIME_TO_CLOSE = dataSum[0].MEAN_TIME_TO_CLOSE / dataSum[0].CNT;

		$scope.balancedScorecard.push(dataSum[0]);

		$scope.opcos = _.map(_.groupBy($scope.balancedScorecard, 'OPCO_ID'), function(g) {
		return { 
		    OPCO_ID: _.reduce(g, function(m,x) { return x.OPCO_ID; }, 0),
		    OPCO_NAME: _.reduce(g, function(m,x) { return x.OPCO_NAME; }, 0)
		  };
		});

		$scope.getMetric = function(opcoId, metricName) {
			return _.find($scope.balancedScorecard, function(el) {
				return el.OPCO_ID == opcoId; 
			})[metricName];
		};

		var getMaxIncidentCountPerArea = function(opcoId) {
			var opcoData = _.find($scope.balancedScorecard, function(el) {
				return el.OPCO_ID == opcoId; 
			});

			return _.max(_.filter(opcoData, function(el, key) {
				return key.substr(key.length-14) == 'INCIDENT_COUNT';
			})) / $scope.getMetric(opcoId, 'INCIDENT_COUNT_TOTAL') * 100;
		};

		$scope.getBgColor = function(pct, opcoId) {
			// adapted from https://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage
			var max = getMaxIncidentCountPerArea(opcoId);

			var percentColors = [
			    { pct: 0, color: { r: 0x3c, g: 0xb3, b: 71 } },
			    { pct: (max/2), color: { r: 0xff, g: 0xd7, b: 0 } },
			    { pct: max, color: { r: 0xfa, g: 0x80, b: 72 } },
			    ];

		    for (var i = 1; i < percentColors.length - 1; i++) {
		        if (pct < percentColors[i].pct) {
		            break;
		        }
		    }
		    var lower = percentColors[i - 1];
		    var upper = percentColors[i];
		    var range = upper.pct - lower.pct;
		    var rangePct = (pct - lower.pct) / range;
		    var pctLower = 1 - rangePct;
		    var pctUpper = rangePct;
		    var color = {
		        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
		        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
		        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
		    };
		    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
		};

		// Chart options

        $scope.cvgOverviewChartData = [];
        $scope.cvgOverviewChartData.push(['x', 'Risk covered (%)']);

		_.each($scope.balancedScorecard, function(e) {
        	if (e.OPCO_ID !== 0){
        		$scope.cvgOverviewChartData.push([e.OPCO_NAME, e.TOTAL_COVERAGE]);
        	}
		});

        $scope.cvgOverviewChartOptions.legend.show = false;
        // $scope.cvgOverviewChartOptions.tooltip.show = false;
        // $scope.cvgOverviewChartOptions.size.height = 90;
        $scope.cvgOverviewChartOptions.axis.y.max = 100;

        $scope.cvgOverviewChartOptions.axis.y.tick.format = function (d) { return Number(d).toFixed(2) + '  %'; };
        $scope.cvgOverviewChartOptions.data.labels.format = function (d) { return Number(d).toFixed(2) + '  %'; };
        
        $scope.cvgOverviewChartOptions.grid.y.lines.push({value: $scope.getMetric(0, 'TOTAL_COVERAGE'), text: Math.round(Number($scope.getMetric(0, 'TOTAL_COVERAGE')), 2) + '% Weighted coverage', position: 'start', color: 'red'});


        console.log($scope.cvgOverviewChartData);

        setTimeout (function () {
          $scope.$broadcast('c3ChartUpdate',{}); 
        }, 100); 

	  $scope.loadFinished = true;

	});

	$scope.$watch('entry.OPCO_ID', function(){
		setTimeout (function () {
	    	$state.go('harvestSummary', {year:$stateParams.year, opcoId:$scope.entry.OPCO_ID});
	    } , 5);
	});

		}
}

angular.module('amxApp')
  .component('harvestSummary', {
    templateUrl: 'app/shared/routes/harvestSummary/harvestSummary.html',
    controller: HarvestSummaryComponent,
    controllerAs: 'harvestSummaryCtrl'
  });

})();
