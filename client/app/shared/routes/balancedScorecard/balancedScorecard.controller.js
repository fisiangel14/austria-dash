'use strict';
(function () {

  class BalancedScorecardComponent {
    constructor($rootScope, $scope, $sanitize, $cookies, Entry, Incident, $state, $stateParams) {
      $scope.entry = Entry;
      $scope.Math = window.Math;
      $scope.balancedScorecard = [];
      $scope.incidents = [];
      $scope.loadFinished = false;
      $scope.incidentListType = '';
      $scope.incidentListArea = '';

      if (!moment($stateParams.year, 'YYYY', true).isValid() && !$stateParams.fromDate && !$stateParams.toDate) {
        $state.go('balancedScorecard', {
          year: moment().format('YYYY'),
          opcoId: $scope.entry.OPCO_ID}, {reload: true}
        );
      }
      
      if (!moment($stateParams.year, 'YYYY', true).isValid()) {
        $stateParams.year = moment($stateParams.fromDate).format('YYYY');
      }
      
      if (!$stateParams.fromDate) {
        $stateParams.fromDate = $stateParams.year + '-01-01';
        $stateParams.toDate = $stateParams.year + '-12-31';
      }

      if (Number($stateParams.opcoId) != $scope.entry.OPCO_ID) {
        $scope.entry.OPCO_ID = Number($stateParams.opcoId);
      }

      $scope.currYear = moment().format('YYYY');
      $scope.workYear = $stateParams.year;
      
      $scope.fromDate = $stateParams.fromDate;
      $scope.dtFromDate = moment($stateParams.fromDate).toDate();

      $scope.toDate = $stateParams.toDate;
      $scope.dtToDate = moment($stateParams.toDate).toDate();

      $scope.prevYear = moment($stateParams.year, 'YYYY').startOf('year').subtract(1, 'day').format('YYYY');
      $scope.nextYear = moment($stateParams.year, 'YYYY').endOf('year').add(1, 'day').format('YYYY');

      //Datepicker OPEN_DATE
      $scope.dp1 = {};
      $scope.dp1.status = {opened: false};

      $scope.dp1.open = function($event) {
        $scope.dp1.status.opened = true;
      };

      $scope.dp1.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1
      };

      //Datepicker CLOSING_DATE
      $scope.dp2 = {};
      $scope.dp2.status = {opened: false};

      $scope.dp2.open = function($event) {
        $scope.dp2.status.opened = true;
      };

      $scope.dp2.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1
      };

      Incident.getBalancedScorecard($scope.entry.OPCO_ID, $scope.workYear, $scope.fromDate, $scope.toDate, $scope.entry.balancedScorecardShowAllIncidents)
        .then(function (data) {
          // console.log(data);
          $scope.balancedScorecard = data.results;

          // var dataSum = _.map(_.groupBy(data.results.bsKPIs), function(g) {
          // return { 
          //     OPCO_ID: _.reduce(g, function(m,x) { return 0; }, 0),
          //     OPCO_NAME: _.reduce(g, function(m,x) { return $scope.entry.lookup.getOpcoById(0).OPCO_NAME; }, 0),
          //     CNT: _.reduce(g, function(m,x) { return m + 1; }, 0),
          //     I_REVENUE_LOSS: _.reduce(g, function(m,x) { return m + x.I_REVENUE_LOSS; }, 0),
          //     R_REVENUE_LOSS: _.reduce(g, function(m,x) { return m + x.R_REVENUE_LOSS; }, 0),
          //     P_REVENUE_LOSS: _.reduce(g, function(m,x) { return m + x.P_REVENUE_LOSS; }, 0),
          //     I_EXCESSIVE_COSTS: _.reduce(g, function(m,x) { return m + x.I_EXCESSIVE_COSTS; }, 0),
          //     R_EXCESSIVE_COSTS: _.reduce(g, function(m,x) { return m + x.R_EXCESSIVE_COSTS; }, 0),
          //     P_EXCESSIVE_COSTS: _.reduce(g, function(m,x) { return m + x.P_EXCESSIVE_COSTS; }, 0),
          //     IMPACT_REVENUE_LOSS: _.reduce(g, function(m,x) { return m + x.IMPACT_REVENUE_LOSS; }, 0),
          //     IMPACT_OVERCHARGING: _.reduce(g, function(m,x) { return m + x.IMPACT_OVERCHARGING; }, 0),
          //     IMPACT_FINANCIAL_REPORTING_MISSTATEMENT: _.reduce(g, function(m,x) { return m + x.IMPACT_FINANCIAL_REPORTING_MISSTATEMENT; }, 0),
          //     IMPACT_EXCESSIVE_COSTS: _.reduce(g, function(m,x) { return m + x.IMPACT_EXCESSIVE_COSTS; }, 0),
          //     FINANCIAL_IMPACT: _.reduce(g, function(m,x) { return m + x.FINANCIAL_IMPACT; }, 0),
          //     REVENUE_IMPACT: _.reduce(g, function(m,x) { return m + x.REVENUE_IMPACT; }, 0),
          //     INCIDENT_COUNT_NO_LOSS: _.reduce(g, function(m,x) { return m + x.INCIDENT_COUNT_NO_LOSS; }, 0),
          //     INCIDENT_COUNT_NON_MONETARY: _.reduce(g, function(m,x) { return m + x.INCIDENT_COUNT_NON_MONETARY; }, 0),
          //     INCIDENT_COUNT_TOTAL: _.reduce(g, function(m,x) { return m + x.INCIDENT_COUNT_TOTAL; }, 0),
          //     TOTAL_REVENUES: _.reduce(g, function(m,x) { return m + x.TOTAL_REVENUES; }, 0),
          //     TOTAL_COVERAGE: _.reduce(g, function(m,x) { return 0; }, 0),
          //     REVENUE_LOST: _.reduce(g, function(m,x) { return m + x.REVENUE_LOST; }, 0),
          //     REVENUE_OVERCHARGED: _.reduce(g, function(m,x) { return m + x.REVENUE_OVERCHARGED; }, 0),
          //     REVENUE_MISSREPORTED: _.reduce(g, function(m,x) { return m + x.REVENUE_MISSREPORTED; }, 0),
          //     RECOVERED_IMPACT_TOTAL: _.reduce(g, function(m,x) { return m + x.RECOVERED_IMPACT_TOTAL; }, 0),
          //     PREVENTED_IMPACT_TOTAL: _.reduce(g, function(m,x) { return m + x.PREVENTED_IMPACT_TOTAL; }, 0),
          //     MEAN_TIME_TO_DETECT: _.reduce(g, function(m,x) { return m + x.MEAN_TIME_TO_DETECT; }, 0),
          //     MEAN_TIME_TO_CLOSE: _.reduce(g, function(m,x) { return m + x.MEAN_TIME_TO_CLOSE; }, 0),
          //     COLLECTION_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.COLLECTION_INCIDENT_COUNT; }, 0),
          //     ACCOUNTING_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.ACCOUNTING_INCIDENT_COUNT; }, 0),
          //     VALUE_ADDED_SERVICES_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.VALUE_ADDED_SERVICES_INCIDENT_COUNT; }, 0),
          //     BILLING_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.BILLING_INCIDENT_COUNT; }, 0),
          //     INTERCONNECTION_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.INTERCONNECTION_INCIDENT_COUNT; }, 0),
          //     LOGISTICS_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.LOGISTICS_INCIDENT_COUNT; }, 0),
          //     MEDIATION_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.MEDIATION_INCIDENT_COUNT; }, 0),
          //     PREPAID_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.PREPAID_INCIDENT_COUNT; }, 0),
          //     PROVISIONING_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.PROVISIONING_INCIDENT_COUNT; }, 0),
          //     ROAMING_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.ROAMING_INCIDENT_COUNT; }, 0),
          //     RATING_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.RATING_INCIDENT_COUNT; }, 0),
          //     TREASURY_INCIDENT_COUNT: _.reduce(g, function(m,x) { return m + x.TREASURY_INCIDENT_COUNT; }, 0)
          //   };
          // });

          // var coveredRevenues = 0;
          // _.each($scope.balancedScorecard, function(e) {
          // 	coveredRevenues += e.TOTAL_REVENUES * e.TOTAL_COVERAGE/100;
          // });
          // dataSum[0].TOTAL_COVERAGE = coveredRevenues / dataSum[0].TOTAL_REVENUES * 100;

          // dataSum[0].MEAN_TIME_TO_DETECT = dataSum[0].MEAN_TIME_TO_DETECT / dataSum[0].CNT;
          // dataSum[0].MEAN_TIME_TO_CLOSE = dataSum[0].MEAN_TIME_TO_CLOSE / dataSum[0].CNT;

          // $scope.balancedScorecard.push(dataSum[0]);

          // $scope.opcos = _.map(_.groupBy($scope.balancedScorecard, 'OPCO_ID'), function (g) {
          //   return {
          //     OPCO_ID: _.reduce(g, function (m, x) {
          //       return x.OPCO_ID;
          //     }, 0),
          //     OPCO_NAME: _.reduce(g, function (m, x) {
          //       return x.OPCO_NAME;
          //     }, 0)
          //   };
          // });

          // $scope.getMetric = function (opcoId, metricName) {
          //   return _.find($scope.balancedScorecard, function (el) {
          //     return el.OPCO_ID == opcoId;
          //   })[metricName];
          // };

          // $scope.getKPI = function (metricName) {
          //   return $scope.balancedScorecard.KPI[metricName];
          // };

          var getMaxIncidentCountPerArea = function () {
            return _.max(_.filter($scope.balancedScorecard.KPI, function (el, key) {
              return (key.substr(key.length - 14) == 'INCIDENT_COUNT') && (key.substr(0, 2) != 'BA');
            })) / $scope.balancedScorecard.KPI.INCIDENT_COUNT_TOTAL * 100;
          };

          
          var getMaxIncidentAreaValue = function () {
            return _.max(_.filter($scope.balancedScorecard.KPI, function (el, key) {
              return (key.substr(key.length - 14) == 'INCIDENT_VALUE') && (key.substr(0, 2) != 'BA');
            }));
          };

          $scope.getBgColor = function (pct, type) {
            // adapted from https://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage
            var max = 0;
            if (type == 1) {
              max = getMaxIncidentAreaValue();
            }
            else {
              max = getMaxIncidentCountPerArea();
            }

            var percentColors = [{
                pct: 0,
                color: {
                  r: 0x3c,
                  g: 0xb3,
                  b: 71
                }
              },
              {
                pct: (max / 2),
                color: {
                  r: 0xff,
                  g: 0xd7,
                  b: 0
                }
              },
              {
                pct: max,
                color: {
                  r: 0xfa,
                  g: 0x80,
                  b: 72
                }
              },
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

          var getMaxIncidentCountPerAreaBA = function () {
            return _.max(_.filter($scope.balancedScorecard.KPI, function (el, key) {
              return (key.substr(key.length - 14) == 'INCIDENT_COUNT')  && (key.substr(0, 2) == 'BA');
            })) / $scope.balancedScorecard.KPI.INCIDENT_COUNT_TOTAL * 100;
          };

          var getMaxIncidentAreaValueBA = function () {
            return _.max(_.filter($scope.balancedScorecard.KPI, function (el, key) {
              return (key.substr(key.length - 14) == 'INCIDENT_VALUE') && (key.substr(0, 2) == 'BA');
            }));
          };

          $scope.getBgColorBA = function (pct, type) {
            // adapted from https://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage
            var max = 0;
            if (type == 1) {
              max = getMaxIncidentAreaValueBA();
            }
            else {
              max = getMaxIncidentCountPerAreaBA();
            }

            var percentColors = [{
                pct: 0,
                color: {
                  r: 0x3c,
                  g: 0xb3,
                  b: 71
                }
              },
              {
                pct: (max / 2),
                color: {
                  r: 0xff,
                  g: 0xd7,
                  b: 0
                }
              },
              {
                pct: max,
                color: {
                  r: 0xfa,
                  g: 0x80,
                  b: 72
                }
              },
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

					$scope.chartOptions = {
						size: {height: 420},
						legend: {
					    show: true
					  },
					  data: {
					    columns: [
					      ['Prevented loss', Math.round($scope.balancedScorecard.harvest.PREVENTED / 1000)],
					      ['Recovered revenue', Math.round($scope.balancedScorecard.harvest.RECOVERED / 1000)],
					      ['Detected loss', Math.round($scope.balancedScorecard.harvest.IMPACT / 1000)],
					      ['Financial reporting misstatement prevented', Math.round($scope.balancedScorecard.harvest.PREVENTED_FINANCIAL_REPORTING / 1000)],
					      ['Financial reporting misstatement corrected', Math.round($scope.balancedScorecard.harvest.RECOVERED_FINANCIAL_REPORTING / 1000)],
					      ['Financial reporting misstatement', Math.round($scope.balancedScorecard.harvest.IMPACT_FINANCIAL_REPORTING / 1000)]
					    ],
							type: 'bar',
              colors: {
                'Prevented loss': '#5695A9',
					      'Recovered revenue': '#A2A8AE',
					      'Detected loss':  '#E5272D', 
					      'Financial reporting misstatement prevented': '#6F8730', 
					      'Financial reporting misstatement corrected': '#B7C397', 
					      'Financial reporting misstatement': '#DBEEAA'
              },
							bar: {
								width: {
									ratio: 0.2
								}
							},
					    labels: {
					      format: function (d) {
					        return Number(d).toFixed(0) + ' k€';
					      },
					      position: 'inner-middle'
					    },
					    groups: [
					      ['Recovered revenue', 'Prevented loss'],
					      ['Financial reporting misstatement prevented', 'Financial reporting misstatement corrected', 'Financial reporting misstatement'],
					    ]
					  },
					  color: {
					    pattern: ['#5695A9', '#A2A8AE', '#E5272D', '#6F8730', '#B7C397', '#DBEEAA']
						},
						axis: {
	            x: {
	                tick: {
	                  type: 'timeseries',
	                  format: function (d) { return moment($stateParams.year).format('YYYY'); },
	                  fit: true,
	                }
							}
						},   						
					  grid: {
					    y: {
					      show: true
					    }
					  }
					};

          // Remove series with zero values
          $scope.chartOptions.data.columns = $scope.chartOptions.data.columns.filter(function(val, idx, arr) {
            return val[1] != 0;
          });

		      $scope.loadFinished = true;
		  
          //Update chart
          setTimeout(function () {
            $rootScope.$broadcast('c3ChartUpdate', {});
          }, 550);

        });

      $scope.getAreaIncidents = function (area) {
        $scope.incidentListType = 'Area';
        $scope.incidentListArea = area;
        
        Incident.getAreaIncidents($stateParams.opcoId, area, $scope.fromDate, $scope.toDate, $scope.entry.balancedScorecardShowAllIncidents).then(function (data) {
          $scope.incidents = data;
          $scope.loadFinished = true;
        });
      };
      
      $scope.getBAIncidents = function (area) {
        $scope.incidentListType = 'Business Assurance Domain';
        $scope.incidentListArea = area;

        Incident.getBAIncidents($stateParams.opcoId, '$.'+area, $scope.fromDate, $scope.toDate, $scope.entry.balancedScorecardShowAllIncidents).then(function (data) {
          $scope.incidents = data;
          $scope.loadFinished = true;
        });
      };

      $scope.getIncident = function (incidentId) {
        $state.go('incidentInfo', {
          incidentId: incidentId
        }, {
          reload: true
        });
      };

      $scope.reloadBalancedScorecard = function () {
        setTimeout(function () {
          $state.go('balancedScorecard', {
            opcoId: $scope.entry.OPCO_ID,
            year: moment($scope.dtFromDate).format('YYYY'),
            fromDate: moment($scope.dtFromDate).format('YYYY-MM-DD'),
            toDate: moment($scope.dtToDate).format('YYYY-MM-DD')
          }, {
            reload: true
          });
        }, 100);
      };


		$scope.getTypeOfImpactText = function (typeOfImpact, level) {
	    // Revenue loss
	    if (typeOfImpact == 'Revenue loss' && level == 1) {return 'Revenue lost';}
	    else if (typeOfImpact == 'Revenue loss' && level == 2) {return 'Revenue loss recovered';}
	    else if (typeOfImpact == 'Revenue loss' && level == 3) {return 'Revenue loss prevented';}

	    else if (typeOfImpact == 'Overcharging' && level == 1) {return 'Unjustified gain';}
	    else if (typeOfImpact == 'Overcharging' && level == 2) {return 'Unjustified gain corrected';}
	    else if (typeOfImpact == 'Overcharging' && level == 3) {return 'Unjustified gain prevented';}

	    else if (typeOfImpact == 'Excessive costs' && level == 1) {return 'Excessive costs';}
	    else if (typeOfImpact == 'Excessive costs' && level == 2) {return 'Excessive costs corrected';}
	    else if (typeOfImpact == 'Excessive costs' && level == 3) {return 'Excessive costs prevented';}

	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 1) {return 'Financial reporting misstatement';}
	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 2) {return 'Financial reporting misstatement corrected';}
	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 3) {return 'Financial reporting misstatement prevented';}

	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 1) {return 'Usage loss of event CDRs';}
	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 2) {return 'Usage loss of event CDRs recovered';}
	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 3) {return 'Usage loss of event CDRs prevented';}

	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 1) {return 'Usage loss of minutes MoU';}
	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 2) {return 'Usage loss of minutes MoU recovered';}
	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 3) {return 'Usage loss of minutes MoU prevented';}

	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 1) {return 'Usage loss of data traffic GB';}
	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 2) {return 'Usage loss of data traffic GB recovered';}
	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 3) {return 'Usage loss of data traffic GB prevented';}

	    else if (typeOfImpact == 'Customer data inconsistency' && level == 1) {return 'Customer data inconsistency';}
	    else if (typeOfImpact == 'Customer data inconsistency' && level == 2) {return 'Customer data inconsistency corrected';}
	    else if (typeOfImpact == 'Customer data inconsistency' && level == 3) {return 'Customer data inconsistency prevented';}
	    
	    else if (typeOfImpact == 'No loss') {return 'No loss';}
	    else if (typeOfImpact == 'Unknown') {return 'Unknown';}
	    
	    else {return 'Unknown';}
	 
	  };

		$scope.getTypeOfImpactNumber = function (typeOfImpact, level) {
	    // Revenue loss
	    if (typeOfImpact == 'Revenue loss' && level == 1) {return '1';}
	    else if (typeOfImpact == 'Revenue loss' && level == 2) {return '2';}
	    else if (typeOfImpact == 'Revenue loss' && level == 3) {return '3';}

	    else if (typeOfImpact == 'Overcharging' && level == 1) {return '4';}
	    else if (typeOfImpact == 'Overcharging' && level == 2) {return '5';}
	    else if (typeOfImpact == 'Overcharging' && level == 3) {return '6';}

	    else if (typeOfImpact == 'Excessive costs' && level == 1) {return '7';}
	    else if (typeOfImpact == 'Excessive costs' && level == 2) {return '8';}
	    else if (typeOfImpact == 'Excessive costs' && level == 3) {return '9';}

	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 1) {return '10';}
	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 2) {return '11';}
	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 3) {return '12';}

	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 1) {return '13';}
	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 2) {return '14';}
	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 3) {return '15';}

	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 1) {return '16';}
	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 2) {return '17';}
	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 3) {return '18';}

	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 1) {return '19';}
	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 2) {return '20';}
	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 3) {return '21';}

	    else if (typeOfImpact == 'Customer data inconsistency' && level == 1) {return '22';}
	    else if (typeOfImpact == 'Customer data inconsistency' && level == 2) {return '23';}
	    else if (typeOfImpact == 'Customer data inconsistency' && level == 3) {return '24';}
	    
	    else if (typeOfImpact == 'No loss') {return 'No loss';}
	    else if (typeOfImpact == 'Unknown') {return 'Unknown';}
	    
	    else {return 'Unknown';}
	 
	  };

      $scope.$watch('entry.OPCO_ID', function () {
        setTimeout(function () {
          $state.go('balancedScorecard', {
            year: $stateParams.year,
            opcoId: $scope.entry.OPCO_ID
          });
        }, 100);
      });

    }
  }

  angular.module('amxApp')
    .component('balancedScorecard', {
      templateUrl: 'app/shared/routes/balancedScorecard/balancedScorecard.html',
      controller: BalancedScorecardComponent
    });

})();
