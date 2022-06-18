'use strict';

(function(){

class ControlRunhistoryComponent {
  constructor($scope, $rootScope, Entry, Socket, Control, $state, $stateParams, $cookies, $timeout, $filter) {
	  $scope.entry = Entry;
	  $scope.Math = window.Math;
	  $scope.moment = moment;
	  $scope.loadFinished = false;
	  $scope._und = _;
	  $scope.header = [];
	  $scope.controlsData = [];
	  $scope.processname = $stateParams.processname;
	  $scope.colspan=12;
	  $scope.controlResultsChartData = {};

	  $scope.showControlInfo = true;

		$scope.controlResultsChartOptions = {
			padding: {
				top: 0,
				right: 70,
				bottom: 0,
				left: 70,
			},    
			size: {height: 200},
			legend: {show: true },      
			data: {
			x : 'x',
			rows: [],
			axes: {
				'Value': 'y2'
			},
			type: 'line',
			types: {},
			groups: []
			// onclick: function (a, b) { $scope.chartClick(a.x); }      
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: function(d) {
							return moment(d).format('DD.MM.YYYY'); 
						},
					},
					},
				y: {
					label: 'Records',
					position: 'outer-center',
					show: true,
					tick: {
						format: function (d) { 
							if (Number.isNaN(d)) {
								return 0;
							}
							else {
								return Number(d).toFixed(0); 
							}
						},
					},
					min: 0,
					padding: {top:0, bottom:0}
				},
				y2: {
					label: 'KPIs',
					position: 'outer-middle',
					show: true,
					tick: {
						format: function (d) { 
							if (Number.isNaN(d)) {
								return 0;
							}
							else {
								return Number(d).toFixed(0); 
							}
						},
					},
//					max: 100
				}        
			},    
			grid: {
				x: {
					show: false
				},      
				y: {
					show: true
				}
			}  
		};    

		if (moment($stateParams.toDate, 'YYYY-MM-DD', true).isValid()) {
		  $scope.toDate = moment($stateParams.toDate, 'YYYY-MM-DD').format('YYYY-MM-DD'); 
		}
		else {
		  $scope.toDate = moment().format('YYYY-MM-DD'); 
		}

		$scope.currDate = moment().format('YYYY-MM-DD');
	  $scope.fromDate = moment($scope.toDate, 'YYYY-MM-DD').subtract(Number($scope.entry.searchControlResultTable.limitDays), 'days').format('YYYY-MM-DD');

	  $scope.goBack = moment($scope.toDate, 'YYYY-MM-DD').subtract(Number($scope.entry.searchControlResultTable.limitDays), 'days').format('YYYY-MM-DD');
	  $scope.goForward = moment($scope.toDate, 'YYYY-MM-DD').add(Number($scope.entry.searchControlResultTable.limitDays), 'days').format('YYYY-MM-DD');

	  $scope.goBackText = moment($scope.toDate, 'YYYY-MM-DD').subtract((2 * Number($scope.entry.searchControlResultTable.limitDays)), 'days').format('DD.MM.YYYY');
	  $scope.goForwardText = moment($scope.toDate, 'YYYY-MM-DD').add(Number($scope.entry.searchControlResultTable.limitDays), 'days').format('DD.MM.YYYY');
	  $scope.fromDateText = moment($scope.fromDate, 'YYYY-MM-DD').format('DD.MM.YYYY');
	  $scope.toDateText = moment($scope.toDate, 'YYYY-MM-DD').format('DD.MM.YYYY');

	  var reloadData = function() {
		  Control.getRunhistory($stateParams.opcoId, $stateParams.processname, $scope.fromDate, $scope.toDate)
		  .then(function(data) {
				$scope.loadFinished = false;
	      $scope.controlsData = data;
	      $scope.controlsDataHeader = _.find($scope.controlsData, function(el) {return el.PROCESSID != null;});
        $scope.entry.searchControlResultTable.controlFrequency = $scope.controlsDataHeader.FREQUENCY;
	      $scope.controlsDataFiltered = $filter('controlRunHistoryResultsFilter') ($scope.controlsData, $scope.entry.searchControlResultTable);
	      $scope.loadFinished = true;

	      if ($scope.controlsDataHeader && $scope.controlsDataHeader.KPI_JSON) {
					$scope.colspan = _.size($scope.controlsDataHeader.KPI_JSON) + 12;
	      }
	      else {
	      	$scope.colspan = 12;
	      }

	      // Prepare data for the chart
				var labels = [];
				var rows = [];
				var maxY = 0;
				var maxY2 = 0;

				// find the minimum priority KPI
				var minimumPriority;
				var headerKpi = {};

				if (_.size($scope.controlsDataHeader.KPI_JSON) > 0) {
					minimumPriority = Number($scope.controlsDataHeader.KPI_JSON[0].KPI_PRIORITY);
					_.each($scope.controlsDataHeader.KPI_JSON, function(el) {
						if (Number(el.KPI_PRIORITY) < minimumPriority) {
							minimumPriority = Number(el.KPI_PRIORITY);
						}
					});

					headerKpi = _.find($scope.controlsDataHeader.KPI_JSON, function(el) {
						return Number(el.KPI_PRIORITY) == minimumPriority;
					});

				}
				else {
					minimumPriority = null;
					headerKpi = {KPI_TYPE_DESC:'No KPI defined'};
				}

				_.each($scope.controlsData, function(control) {

					var label = [];
					var row = [];
					
					// Date
					label.push('x');
					row.push(moment(control.RUN_FOR_DATE).format('YYYY-MM-DD'));

					// KPI value
					if (control.KPI_JSON) {
						var kpi = _.find(control.KPI_JSON, function(el) {
							return el.KPI_TYPE === headerKpi.KPI_TYPE; 
						});
						label.push(kpi.KPI_TYPE_DESC);
						row.push(kpi.KPI_VALUE);
						maxY2 = Math.max(Number(kpi.KPI_VALUE), maxY2);
					}
					else {
						label.push(headerKpi.KPI_TYPE_DESC);
						row.push(null);
					}

					// DS_A
					label.push($scope.controlsDataHeader.DS_A + ' (A)');
					$scope.controlResultsChartOptions.data.types[$scope.controlsDataHeader.DS_A + ' (A)'] = 'line';
					row.push(control.RECORDSFETCHED_A);
					maxY = Math.max(Number(control.RECORDSFETCHED_A), maxY);

					// DS_B
					label.push($scope.controlsDataHeader.DS_B + ' (B)');
					$scope.controlResultsChartOptions.data.types[$scope.controlsDataHeader.DS_B + ' (B)'] = 'line';
					row.push(control.RECORDSFETCHED_B);
					maxY = Math.max(Number(control.RECORDSFETCHED_B), maxY);

					// DISC_COUNT_A
					label.push('Disc. count (A)');
					$scope.controlResultsChartOptions.data.types['Disc. count (A)'] = 'area';
					row.push(control.DISC_COUNT_A);

					// DISC_COUNT_B
					label.push('Disc. count (B)');
					$scope.controlResultsChartOptions.data.types['Disc. count (B)'] = 'area';
					row.push(control.DISC_COUNT_B);		

					labels.push(label);
					rows.push(row);
				});

				// Set chart options
				$scope.controlResultsChartOptions.axis.y.max = Math.max(maxY*1.3, 50); 
				$scope.controlResultsChartOptions.axis.y2.max = Math.max(maxY2*1.3, 50);
				$scope.controlResultsChartOptions.data.axes[headerKpi.KPI_TYPE_DESC] = 'y2';
				$scope.controlResultsChartOptions.data.types[headerKpi.KPI_TYPE_DESC] = 'bar';

				// Create label by making an union of all distinct labels found 
				var labelUnion = [];
				_.each(labels, function(label) {
					labelUnion = _.union(labelUnion, label);
				});

				// fill out the rows where values are missing - null fill
				for (var r=0; r< rows.length; r++) {
					rows[r] = rows[r].concat(Array.apply(null, Array(labelUnion.length - rows[r].length)).fill(null));
				}

				var groupsKpi = [];
				_.each($scope.controlsDataHeader.KPI_JSON, function(headerKpi) {
					groupsKpi.push(headerKpi.KPI_TYPE_DESC);
				});

				if (groupsKpi.length > 1) {
					$scope.controlResultsChartOptions.data.groups.push(groupsKpi);
				}

				// Assign chart values labels + rows
				$scope.controlResultsChartData = [labelUnion].concat(rows);

				//Update chart
				setTimeout (function () {
					$rootScope.$broadcast('c3ChartUpdate',{}); 
				}, 300);       

		  });
		};

		reloadData();

		$scope.$watch('entry.OPCO_ID', function (newValue, oldValue) {
			if (newValue !== oldValue) {
			  Socket.off('control:new:' + oldValue + ':' + $scope.processname);
			}
			if ($scope.entry.OPCO_ID) {
				$state.go('controlRunhistory', {opcoId:$scope.entry.OPCO_ID, processname:$stateParams.processname, toDate:$stateParams.toDate});
			}
		});

		var timerlimitDays = false;
		$scope.limitDaysChanged = function () {
			$scope.loadFinished = false;

			if (timerlimitDays) {
			$timeout.cancel(timerlimitDays);
			}

				timerlimitDays = $timeout(function(){
					if ($scope.entry.searchControlResultTable.limitDays < 7) {
						$scope.entry.searchControlResultTable.limitDays = 7;
					}
					else if ($scope.entry.searchControlResultTable.limitDays > 61) {
						$scope.entry.searchControlResultTable.limitDays = 61;	
					}
					$cookies.put('limitDays', $scope.entry.searchControlResultTable.limitDays, {expires:$scope.entry.getExpiryDateNever()});
			$state.go('controlRunhistory', {opcoId:$scope.entry.OPCO_ID, processname:$stateParams.processname, toDate:$stateParams.toDate}, {reload: true});
				}, 800);
		};

		var timerFilterChanged = false;
		$scope.filterChanged = function () {
			$scope.loadFinished = false;

			if (timerFilterChanged) {
			$timeout.cancel(timerFilterChanged);
			}

				timerFilterChanged = $timeout(function(){
				$scope.controlsDataFiltered = $filter('controlRunHistoryResultsFilter') ($scope.controlsData, $scope.entry.searchControlResultTable);
				$scope.loadFinished = true;
				}, 800);
		};

    $scope.filterChanged();

		$scope.rerun = function(control) {
      control.ACTION = 'R';
      if (typeof $scope.controlsDataHeader === 'undefined' || typeof $scope.controlsDataHeader.RULE_TYPE === 'undefined') {
        control.RULE_TYPE = 'X';
      }
      else {
        control.RULE_TYPE = $scope.controlsDataHeader.RULE_TYPE;
      }
			Control.sendMoneyMapRequest(control)
			.then(function(data) {
				if (data.success) {
						control.RECALCULATE = 'Y';
				}
			});	  	
		};

		$scope.stop = function(control) {
      control.ACTION = 'S';
      control.RULE_TYPE = $scope.controlsDataHeader.RULE_TYPE;
			Control.sendMoneyMapRequest(control)
			.then(function(data) {
				if (data.success) {
					// Entry.showToast('Control queued for re-run');
					control.RECALCULATE = 'N';
				  }
			  });	  	
		  };

		$scope.searchTextClear = function () {
			$scope.entry.searchControlResultTable.text = '';
			$scope.filterChanged();
		};

		$scope.controlResultForDay = function (control) {
			$state.go('controlResult', {opcoId:$scope.entry.OPCO_ID, processname:$stateParams.processname, runForDate:moment(control.RUN_FOR_DATE).format('YYYY-MM-DD')});	  	
		};

		$scope.copyToClipboard = function (control, side) {
			var copyText = '';
			if (control.RULE_TYPE === 'U') {
			  copyText = 'select * from ZZUAG_' + control.PROCESSNAME + '_' + (side==='B'?'BNA':'ANB') + ' where "_PID" = ' + '\'' + control.PROCESSID + '\';';
			  $scope.entry.copyToClipboard(copyText);
			  $scope.entry.showToast('ZZUAG select statement copied to clipboard');
			}
			else if (control.RULE_TYPE === 'R') {
			  copyText = 'select * from RAPO_REST_' + control.PROCESSNAME + ' where RAPO_PROCESS_ID = ' + control.PROCESSID + ';';
			  $scope.entry.copyToClipboard(copyText);
			  $scope.entry.showToast('RAPO results select statement copied to clipboard');
			  
			}
      else if (control.RULE_TYPE === 'C') {
        var prefix = 'MM_MODEL.ZZAG_';
        if (control.OPCO_ID == 39) {
          prefix = 'A1_MODEL.ZZAG_';

        }
        copyText = 'select * from ' + prefix + control.PROCESSNAME.toUpperCase() + ' where ' + control.PROCESSNAME.toUpperCase() + '_STATUS = \'Open\';';
        $scope.entry.copyToClipboard(copyText);
        $scope.entry.showToast('Configuration rule ZZAG select statement copied to clipboard'); 
      }
			else {
			  $scope.entry.showToast('Wrong RULE_TYPE! Generating the SQL statement failed');
			}
		};

		$scope.toggleShowControlInfo = function() {
			$scope.showControlInfo = !$scope.showControlInfo;
			//Update chart
			setTimeout (function () {
				$rootScope.$broadcast('c3ChartUpdate',{}); 
			}, 300);       
		};

		var timerReloadOnNewControlRun = false;
		var controlNewOpcoIdProcessname = function (message) {
			// Do only one data refresh in case multiple control result in preset timer
			if (timerReloadOnNewControlRun) {
				$timeout.cancel(timerReloadOnNewControlRun);
			}
			timerReloadOnNewControlRun = $timeout(function () {
				reloadData();
				if (message) {
					Entry.showToast(message.toast);
				}
			}, 1000);

		};
		Socket.on(('control:new:' + $scope.entry.OPCO_ID + ':' + $scope.processname), controlNewOpcoIdProcessname);

		$scope.$on('$destroy', function () {
			Socket.off('control:new:' + $scope.entry.OPCO_ID + ':' + $scope.processname);
		});	

  }
}

angular.module('amxApp')
  .component('controlRunhistory', {
    templateUrl: 'app/mm/routes/controlRunhistory/controlRunhistory.html',
    controller: ControlRunhistoryComponent,
    controllerAs: 'controlRunhistoryCtrl'
  });

})();
