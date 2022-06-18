'use strict';
(function () {

  class MetricResultComponent {
    constructor($scope, $rootScope, Entry, Socket, View, Metric, Lookup, $state, $stateParams, $sce, $cookies, $timeout) {
      $scope.entry = Entry;
      $scope.Math = window.Math;
      $scope.localEntry = {
        'lookup': {}
      };

      // Areas lookup
      Lookup.lookup('getAreas').then(function (data) {
        $scope.localEntry.lookup.areas = data;
        $scope.localEntry.lookup.getAreaById = function (id) {
          return _.find($scope.localEntry.lookup.areas, function (num) {
            return num.AREA_ID == id;
          });
        };
      });

      if (moment($stateParams.month, 'YYYY-MM', true).isValid()) {
        if ($cookies.get('searchMDmonth') !== $stateParams.month) {
          $cookies.put('searchMDmonth', $stateParams.month);
          $scope.entry.searchMDmonth = $stateParams.month;
        }
      } else {
        if ($cookies.get('searchMDmonth')) {
          $stateParams.month = $cookies.get('searchMDmonth');
        } else {
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

      $scope.showMetricInfo = false;
      $scope.metric = {};
      $scope.relatedDatos = {};
      $scope.relatedMetrics = {};
      $scope.metricResults = {};
      $scope.metricResultsChart = {};
      $scope.metricDatoLabelUnion = [];

      var metricMax = 0;

      //Load data
      // $scope.loadData = function(callback) {
      // console.log('Reload data!');



      //Datepicker
      $scope.dp = {};
      $scope.dp.status = {
        opened: false
      };

      $scope.dp.open = function () {
        $scope.dp.status.opened = true;
      };

      $scope.dp.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1
      };

      // Get main metric info - same as MetricInfo tab
      var reloadData = function () {

        Metric.getMetricInfo($stateParams.opcoId, $stateParams.metricId).
        then(function (data) {
          $scope.metric = data;
          $scope.metricDatoLabelUnion = [];

          metricMax = 1.7 * ($scope.metric.OBJECTIVE + $scope.metric.TOLERANCE);

          if ($scope.metric.FREQUENCY === 'M') {
            $scope.rangeFromDate = moment($stateParams.month, 'YYYY-MM').startOf('year').format('YYYY-MM-DD');
            $scope.rangeToDate = moment($stateParams.month, 'YYYY-MM').endOf('year').format('YYYY-MM-DD');

            $scope.prevMonth = moment($stateParams.month, 'YYYY-MM').startOf('year').subtract(1, 'day').format('YYYY-MM');
            $scope.prevMonthText = moment($stateParams.month, 'YYYY-MM').startOf('year').subtract(1, 'day').format('YYYY');

            $scope.nextMonth = moment($stateParams.month, 'YYYY-MM').endOf('year').add(1, 'day').format('YYYY-MM');
            $scope.nextMonthText = moment($stateParams.month, 'YYYY-MM').endOf('year').add(1, 'day').format('YYYY');

            $scope.workMonthText = moment($stateParams.month, 'YYYY-MM').format('YYYY');

            $scope.currMonth = moment().format('YYYY-MM');
          }

          View.getMetricsForPeriod($scope.metric.FREQUENCY, $stateParams.opcoId, $stateParams.metricId, $scope.rangeFromDate, $scope.rangeToDate)
            .then(function (data) {
              $scope.metricResults = data;

              var labels = [];
              var rows = [];
              _.each($scope.metricResults, function (metric) {

                if (metricMax < metric.VALUE) {
                  metricMax = metric.VALUE;
                }

                var label = [];
                label.push('x');
                label.push('Metric ' + $stateParams.metricId);

                var row = [];
                row.push(moment(new Date(metric.DATE)).format('YYYY-MM-DD'));
                row.push(metric.VALUE);

                var jsonDatoSums = [];

                _.each($scope.relatedDatos, function (dato) {
                  var datoId = '#' + dato.DATO_ID;
                  var datoValue = null;

                  var sums = _.find(metric.JSON_DATO_SUMS, function (datoSums) {
                    return datoSums.IN_DATO == datoId;
                  });

                  if (typeof sums !== 'undefined') {
                    datoValue = Number(sums.VAL);
                  }

                  label.push(datoId);
                  row.push(datoValue);
                  jsonDatoSums.push({
                    'IN_DATO': datoId,
                    'VAL': datoValue
                  });

                });

                metric.JSON_DATO_SUMS_FINAL = jsonDatoSums;

                // _.each(metric.JSON_DATO_SUMS, function(dato) {
                // 	label.push(dato.IN_DATO);
                // 	row.push(Number(dato.VAL));
                // });

                labels.push(label);
                rows.push(row);
              });

              // Create label by making an union of all distinct labels found 
              var labelUnion = [];
              _.each(labels, function (label) {
                labelUnion = _.union(labelUnion, label);
              });

              // fill out the rows where values are missing - null fill
              for (var r = 0; r < rows.length; r++) {
                rows[r] = rows[r].concat(Array.apply(null, Array(labelUnion.length - rows[r].length)).fill(null));
              }

              // Assign chart values labels + rows
              $scope.metricResultsChart = [labelUnion].concat(rows);

              //Sort out the Dato labels
              for (var i = 2; i < labelUnion.length; i++) {
                $scope.metricDatoLabelUnion.push(labelUnion[i].substr(1));
              }

              // Chart config / options START
              $scope.metricResultsChartOptions = {
                padding: {
                  top: 0,
                  right: 70,
                  bottom: 0,
                  left: 70,
                },
                size: {
                  height: 250
                },
                legend: {
                  show: true
                },
                data: {
                  x: 'x',
                  rows: [],
                  axes: {
                    'Value': 'y2'
                  },
                  type: 'line',
                  types: {
                    'Value': 'area'
                  },
                  // onclick: function (a, b) { $scope.chartClick(a.x); }      
                },
                axis: {
                  x: {
                    type: 'timeseries',
                    tick: {
                      format: function (d) {
                        return ($scope.metric.FREQUENCY === 'D') ? (moment(d).format('DD.MM.YYYY')) : (moment(d).format('MMM YYYY'));
                      },
                    },
                  },
                  y: {
                    label: 'Dato',
                    position: 'outer-center',
                    show: true,
                    tick: {
                      format: function (d) {
                        if (Number.isNaN(d)) {
                          return 0;
                        } else {
                          return Number(d).toFixed(0);
                        }
                      },
                    },
                    min: 0,
                    padding: {
                      top: 0,
                      bottom: 0
                    }
                  },
                  y2: {
                    label: 'Metric',
                    position: 'outer-middle',
                    show: true,
                    tick: {
                      format: function (d) {
                        if (Number.isNaN(d)) {
                          return 0;
                        } else {
                          return Number(d).toFixed(5);
                        }
                      },
                    },
                    max: metricMax
                  }
                },
                regions: [{
                    axis: 'y2',
                    start: $scope.metric.OBJECTIVE,
                    end: $scope.metric.OBJECTIVE + $scope.metric.TOLERANCE,
                    class: 'regionO'
                  },
                  {
                    axis: 'y2',
                    start: $scope.metric.OBJECTIVE + $scope.metric.TOLERANCE,
                    class: 'regionT'
                  },
                ],
                grid: {
                  x: {
                    show: false
                  },
                  y: {
                    show: true,
                    lines: [{
                        position: 'start',
                        value: $scope.metric.OBJECTIVE,
                        axis: 'y2',
                        show: true
                      },
                      {
                        position: 'start',
                        value: $scope.metric.OBJECTIVE + $scope.metric.TOLERANCE,
                        text: 'Tolerance',
                        axis: 'y2',
                        show: true
                      },
                    ]
                  }
                }
              };

              $scope.metricResultsChartOptions.data.axes['Metric ' + $stateParams.metricId] = 'y2';
              $scope.metricResultsChartOptions.axis.y2.label = 'Metric ' + $stateParams.metricId;
              $scope.metricResultsChartOptions.data.types['Metric ' + $stateParams.metricId] = 'area';
              // Chart config / options END


              //Update chart
              setTimeout(function () {
                $rootScope.$broadcast('c3ChartUpdate', {});
              }, 300);

              // callback();

            });

        });
      }; // reload data

      reloadData();

      Metric.getRelatedDatos($stateParams.opcoId, $stateParams.metricId).then(function (data) {
        $scope.relatedDatos = data;
        //console.log($scope.relatedDatos);
      });

      Metric.getRelatedMetrics($stateParams.opcoId, $stateParams.metricId).then(function (data) {
        $scope.relatedMetrics = data;
        //console.log($scope.relatedDatos);
      });



      // $scope.loadData(function () {

      // Break execution if metric is not relevant
      // if ($scope.metric.RELEVANT === 'N') {
      // 	return;
      // }



      // }); // *** $scope.loadData // END

      $scope.getMissingDatos = function (opcoId, metricId, billCycle, date) {
        var changeMetricResult = _.find($scope.metricResults,
          function (obj) {
            return obj.DATE === date;
          });

        date = moment(date).format('YYYY-MM-DD');

        View.getMissingDatos(opcoId, metricId, billCycle, moment(date).format('YYYY-MM-DD'))
          .then(function (data) {
            changeMetricResult.DATO_ID_MISSING = data.DATO_ID_MISSING;
          });
      };

      $scope.openDatoResult = function (opcoId, datoId) {
        //console.log(opcoId, datoId);
        $state.go('datoResult', {
          opcoId: opcoId,
          datoId: datoId,
          month: $stateParams.month
        });
      };

      $scope.toggleShowMetricInfo = function () {
        $scope.showMetricInfo = !$scope.showMetricInfo;
      };

      $scope.recalculateMetric = function (metric) {

        metric.FREQUENCY = $scope.metric.FREQUENCY;
        metric.FORMULA = $scope.metric.FORMULA;
        metric.OBJECTIVE = $scope.metric.OBJECTIVE;
        metric.TOLERANCE = $scope.metric.TOLERANCE;
        metric.IMPLEMENTED = $scope.metric.IMPLEMENTED;
        metric.TREND = $scope.metric.TREND;

        if (!metric.BILL_CYCLE) {
          metric.BILL_CYCLE =  0;
        }

        if (!metric.CYCLE_FREQ) {
          metric.CYCLE_FREQ =  0;
        }
        
        if (metric.FREQUENCY === 'C') {
          metric.PERIODICITY_ID = 5;
          metric.PERIOD = moment(metric.DATE).format('YYYYMM');
        }
        else if (metric.FREQUENCY === 'M') {
          metric.PERIODICITY_ID = 3;
          metric.PERIOD = moment(metric.DATE).format('YYYYMM');
        }
        else {
          metric.PERIODICITY_ID = 1;
          metric.PERIOD = moment(metric.DATE).format('YYYYMMDD');
        }
        metric.DATE = moment(metric.DATE).format('YYYYMMDD');
        metric.RECALCULATE = 'Y';

        Metric.recalculateMetric(metric)
          .then(function (data) {

            if (data.success) {

              // // Refresh the data in next 5 minutes in 10 * 31 second interval
              // $interval(function (){
              //   $scope.loadData(function () {
              //     // data loaded - write some update ?
              //   });
              // },61000, 10);

            } else {
              Entry.showToast('Recalculation failed,. Error ' + data.error.code);
            }
          });
      };

      // If no result exists - start first calculation
      $scope.calculateMetric = function (result) {
        var forDate = result.DATE;
        var queryPeriodicityId = 1;
        var queryPeriod = moment(forDate).format('YYYYMMDD');
        var queryDate = moment(forDate).format('YYYY-MM-DD');

        if ($scope.metric.FREQUENCY == 'M') {
          queryPeriodicityId = 3;
          queryPeriod = moment(forDate).format('YYYYMM');
        }

        console.log($scope.metric.METRIC_ID, $scope.metric.OPCO_ID, queryPeriodicityId, queryPeriod, queryDate);

        Metric.calculateMetric($scope.metric.METRIC_ID, $scope.metric.OPCO_ID, queryPeriodicityId, queryPeriod, queryDate)
          .then(function (data) {

            if (data.success) {
              result.RECALCULATE = 'Y';
            } else {
              Entry.showToast('Recalculation failed,. Error ' + data.error.code);
            }
          });
      };

      $scope.predicate = 'metric.DATE';

      $scope.order = function (predicate) {
        $scope.entry.reverse = ($scope.predicate === predicate) ? !$scope.entry.reverse : false;
        $scope.predicate = predicate;
      };

      var trusted = {};
      $scope.popoverHtml = function (popoverDescription, popoverUnit) {
        var popoverTxt = popoverDescription + ' <small class="btn-blue"> [unit: <strong>' + popoverUnit + '</strong>]</small>';
        return trusted[popoverTxt] || (trusted[popoverTxt] = $sce.trustAsHtml(popoverTxt));
      };

      $scope.Lpad = function (str, length, padString) {
        str = str.toString();
        while (str.length < length) {
          str = padString + str;
        }
        return str;
      };

      $scope.$watch('entry.OPCO_ID', function () {
        if ($scope.entry.OPCO_ID) {
          $state.go('metricResult', {
            opcoId: $scope.entry.OPCO_ID,
            datoId: $stateParams.metricId,
            month: $stateParams.month
          });
        }
      });

      var timerReloadOnNewMetricRun = false;
      var newMetricRunReceived = function (message) {

        // Do only one data refresh in case multiple control result in preset timer
        if (timerReloadOnNewMetricRun) {
          $timeout.cancel(timerReloadOnNewMetricRun);
        }
        timerReloadOnNewMetricRun = $timeout(function () {
          reloadData();
          if (message) {
            Entry.showToast(message.toast);
          }
        }, 1500);

      };

      Socket.on(('metric:new:' + $scope.entry.OPCO_ID + ':' + $stateParams.metricId), newMetricRunReceived);

      $scope.$on('$destroy', function () {
        Socket.off('metric:new:' + $scope.entry.OPCO_ID + ':' + $stateParams.metricId);
      });


      // uibModal windows showing details behind Dato 
      // $scope.showMetricDatoComposite = function (metricResult) {
      //   var instance = $uibModal.open({
      //     templateUrl: 'views/metric/metric-composite-result-info-modal.html',
      //     controller: 'metricCompositeResultuibModalCtrl',
      //     size: 'lg',
      //     resolve: {
      //        getMetricResult: function () {
      //          return metricResult;
      //        }
      //      }      
      //   });    
      // };
    }
  }

  angular.module('amxApp')
    .component('metricResult', {
      templateUrl: 'app/amx/routes/metricResult/metricResult.html',
      controller: MetricResultComponent
    });

})();
