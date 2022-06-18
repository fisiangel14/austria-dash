'use strict';
(function(){

class MetricInfoComponent {
  constructor($scope, $timeout, Entry, Metric, Change, Coverage, Lookup, CommentModal, Task, $state, $stateParams, $sce) {
	  $scope.init = function () {
	    $scope.entry = Entry;
	    $scope.isDisabled = $scope.entry.isDisabled();
	    $scope.changeRequest = false;
	    $scope.newMetric = false;
	    $scope.metricAdd = {};
	    $scope.tasks = [];
      $scope.coverage = [];
      $scope.coverageStats = [];
			$scope.localEntry = { 'lookup': {} };

			// Areas lookup
			Lookup.lookup('getAreas').then(function (data) {
				$scope.localEntry.lookup.areas = data;
				$scope.localEntry.lookup.getAreaById = function (id) {
					return _.find($scope.localEntry.lookup.areas, function (num) { return num.AREA_ID == id; });
				};
			});

	    if ($stateParams.opcoId !== $scope.entry.OPCO_ID) {
	    	$scope.entry.OPCO_ID = Number($stateParams.opcoId);
	    }

	    Metric.getMetricInfo($stateParams.opcoId, $stateParams.metricId)
      .then(function (data) {
	      $scope.metric = data;
        $scope.activeBAs = JSON.stringify(_.keys(_.pick($scope.metric.BUSINESS_ASSURANCE_DOMAIN, function(val, key, obj) {return val == 'Y';}))).replace(/[\[|\]]/g, '').replace(/,/g, ', ');

				// Get coverage info
				Coverage.getControlDetails($scope.metric.CVG_CONTROL_ID)
				.then(function (response) {
          $scope.coverage = response.results.RiskNodes;
          $scope.coverageStats = response.results.CoverageStats;

					if ($scope.coverage.length > 0) {
						var productSegmentId = 0;
						var riskId = 0;
						var active = 0;

						for (var i=0; i<$scope.coverage.length;i++) {
							if (productSegmentId == $scope.coverage[i].PRODUCT_SEGMENT_ID && riskId == $scope.coverage[i].RISK_ID) {
								active = active+1;
							}
							else {
								active = 0;
							}

							$scope.coverage[i].active = active;

							productSegmentId = $scope.coverage[i].PRODUCT_SEGMENT_ID;
							riskId = $scope.coverage[i].RISK_ID;							
						}
					}					
				}, function (err) {
					// handle error
					console.log(err);
				});

	    });

	    Metric.getRelatedDatos($stateParams.opcoId, $stateParams.metricId).then(function (data) {
	      $scope.relatedDatos = data;
	    });

 			Task.getObjectTasks($stateParams.opcoId, $stateParams.metricId).then(function (data) {
	      $scope.tasks = data;
	    });

 			Change.getChangeRequestsForObject($stateParams.opcoId, $stateParams.metricId, 'M').then(function (data) {
	      $scope.changeRequests = data;
	    });

	    //Datepicker
	    $scope.dp = {};
	    $scope.dp.status = {opened: false};

	    $scope.dp.open = function() {
	      $scope.dp.status.opened = true;
	    };

	    $scope.dp.dateOptions = {
	      formatYear: 'yyyy',
	      startingDay: 1
	    };

	    //Update timer
	    var timer = false;
	    var timeoutChangeUpdate = function(newValue, oldValue){
	      if (newValue !== oldValue && oldValue !== undefined && ($scope.metric.OPCO_ID == $scope.entry.currentUser.userOpcoId || Number($scope.entry.currentUser.userOpcoId) === 0)) {
	        $scope.flashMessage = 'Saving...';
	        if(timer){
	          $timeout.cancel(timer);
	        }
	        timer = $timeout(function(){ 
	            //console.log('Note changed to ' + newValue);      
	            //console.log('Saving ' + moment().format('YYYY-MM-DD HH:mm'));
	            Metric.postMetricFlashUpdate($scope.metric).then(function (data) {
	              if (data.success){
	                $scope.flashMessage = 'All changes saved';
	              }
	              else {
	                Entry.showToast('Change request failed. Error ' + data.error.code);
	              }
	            });
	        }, 500);
	      }
	    };
	    $scope.$watch('metric.NOTES', timeoutChangeUpdate);
//	    $scope.$watch('metric.IMPLEMENTED', timeoutChangeUpdate);
//	    $scope.$watch('metric.TASKLIST_DONE', timeoutChangeUpdate);
	  };

	  $scope.init();

	  $scope.calculateMetric = function (formula){
	    var strFin = formula;
	    var myRe = /#([0-9]{3}([A-Za-z]{1}\d{1})?)/g;

	    //console.log('Formula: ' + formula);

	    var msg = '';
	    var myArray;
	    while ((myArray = myRe.exec(formula)) !== null) {
	      msg = 'Found ' + myArray[0] + '. ';
	      var datoResult = '(' + Math.floor(Math.random() * 10) + ')';
	      strFin = strFin.replace(myArray[0], datoResult);
	      msg += 'Replacing it with dato value: ' + datoResult + '. Formula incomplete: ' + strFin + '. ';
	      // msg += 'Search position is now: ' + myRe.lastIndex + '. ';
	      // console.log(msg);
	    }
	  };

	  $scope.updateRelatedDatos = function () {
	    Metric.updateRelatedDatos($stateParams.opcoId, $stateParams.metricId).then(function (dataUpdate) {
	      if (dataUpdate.success) {
	        Metric.getRelatedDatos($stateParams.opcoId, $stateParams.metricId).then(function (data) {
	          $scope.relatedDatos = data;
	          Entry.showToast('Formula parsed successfully.' + ' Found ' + data.length + ' datos (' + _.pluck(data, 'DATO_ID') + ') related to this metric!');
	        });
	      }
	      else {
	          Entry.showToast('Error. parsing the formula.');
	      }
	    });
	  };

	  // ^ Metric change request
	  $scope.addMetricChangeRequest = function () {
	      //$scope.metricForm.datePicker.$setValidity('date', true);
	      $scope.originalMetric = angular.copy($scope.metric);
	      $scope.changeRequest = true;
	  };

	  $scope.submitMetricChangeRequest = function () {
	    var metricChanges = '<ol>';     
	    var changesArr = [];     

	    _.each($scope.metric, function (element, index, list) {
	      if ($scope.originalMetric[index] !== list[index]) {
	        //handle Date types
	        if (list[index] instanceof Date) {
	          var newDate = moment(list[index]).format('DD.MM.YYYY');
	          var oldDate = moment($scope.originalMetric[index]).format('DD.MM.YYYY');
	          if ( newDate !== oldDate) {
	            metricChanges += '<li><strong>' + (index + '</strong> changed from <em>\"' + oldDate + '\"</em> to <em>\"' + newDate + '\"</em>') + '</li>';
	            changesArr.push({field:index, oldValue: oldDate, newValue: newDate});
	          }
	        }
	        else {
	          metricChanges += '<li><strong>' + (index + '</strong> changed from <em>\"' + $scope.originalMetric[index] + '\"</em> to <em>\"' + element + '\"</em>') + '</li>';
	          changesArr.push({field:index, oldValue: $scope.originalMetric[index], newValue: element});          
	        }
	      }
	    });
	    metricChanges += '</ol>';

	    //Some changes are made in the form
	    if (changesArr.length > 0 && $scope.metricForm.$valid){
	      var changeRequest = {};
	      changeRequest.OPCO_ID = $scope.originalMetric.OPCO_ID;
	      changeRequest.CHANGE_TYPE = 'Edit metric';
	      changeRequest.OBJECT_ID = $scope.originalMetric.METRIC_ID;
	      changeRequest.OLD_OBJECT = JSON.stringify($scope.originalMetric);
	      changeRequest.NEW_OBJECT = JSON.stringify($scope.metric);
	      changeRequest.CHANGES = JSON.stringify(changesArr);
	      changeRequest.REQUESTOR = angular.copy($scope.entry.currentUser.userName);
	      changeRequest.REQUESTOR_COMMENT = $scope.metricAdd.CHANGE_REQUEST_COMMENT;
	      changeRequest.APPROVER = null;
	      changeRequest.STATUS = 'Requested';

	      Change.postChangeRequest(changeRequest).then(function (data) {
	        if (data.success){
	          Entry.showToast('Metric change request successfully submited');
	        //   $scope.entry.getCounters();
	          return $state.go('changeRequests');
	        }
	        else {
	          switch (data.error.errno){
	            case 19: Entry.showToast('Change request failed. Open request for this dato already exists.'); break;
	            default: Entry.showToast('Change request failed. Error ' + data.error.code); break;
	          }
	        }
	      });
	    }
	    else if (!$scope.metricForm.$valid) {
	      Entry.showToast('Error. Please fill out all required fields!');
	      return;
	    }
	    else {
	      Entry.showToast('No change made. Change request ignored');
	    }

	    $scope.changeRequest = false;
	    //return metric 
	    $scope.metric = angular.copy($scope.originalMetric);
	  };

	  $scope.cancelMetricChangeRequest = function () {
	    $scope.changeRequest = false;
	    $scope.metric = angular.copy($scope.originalMetric);  
	    Entry.showToast('Change Request Canceled. Original metric info restored');
	  };

	  $scope.lastMetricResult = function (opcoId, metricId) {
	    Metric.getLastMetricResult(opcoId, metricId).then(function(data) {
	      if (data) {
	        $state.go('metricResult', {opcoId: data.OPCO_ID, metricId: data.METRIC_ID, metricDate:data.DATE, billCycle:data.BILL_CYCLE});
	      }
	      else {
	        Entry.showToast('No results for this control');
	      }
	    });
	  };

	  $scope.newTask = function() {
	  	Task.newTask({OPCO_ID: $stateParams.opcoId, SOURCE: 'METRIC', OBJECT_ID: $stateParams.metricId, DEPENDENCIES: $scope.metric.DATOS})
	  	.then(function(data){
	    //   $scope.entry.getCounters();
	      $scope.tasks.push(data);
	  	});	  	
	  };

	  $scope.taskEditModal = function(taskId) {
	  	var task = 	_.find($scope.tasks, function(obj) { return obj.TASK_ID == taskId; });

	  	Task.taskInfo(taskId)
	  	.then(function(data){
	  		task.DESCRIPTION = data.DESCRIPTION;
	  		task.OBJECT_ID = data.OBJECT_ID;
	  		task.NOTE = data.NOTE;
	  		task.STATUS = data.STATUS;
	  		task.ASSIGNED_TO = data.ASSIGNED_TO;
	  		task.MODIFIED = data.MODIFIED;
	  		task.OPCO_ID = data.OPCO_ID;
	      
	    //   $scope.entry.getCounters();	      	

	  	});
	  };
	  
	  $scope.assignTaskToMe = function(taskId) {
 	
	  	var task = 	_.find($scope.tasks, function(obj) { return obj.TASK_ID == taskId; });
	  	var taskBackup = angular.copy(task);

	  	task.ASSIGNED_TO = $scope.entry.currentUser.userName;
	  	task.MODIFIED_BY = $scope.entry.currentUser.userName;
	  	task.MODIFIED = moment().toDate();

	  	Task.assignTask(task)	    
	  	.then( function (data) {
	      if (data.success) {
	        Entry.showToast('Task assigned to ' + $scope.entry.currentUser.userName);
	      }
	      else {
			  	task.ASSIGNED_TO = taskBackup.ASSIGNED_TO;
			  	task.MODIFIED_BY = taskBackup.MODIFIED_BY;
			  	task.MODIFIED = taskBackup.MODIFIED;
	        Entry.showToast('Error ' + data.error.code);
	      }
	    });
	 
	  };
	  
	  $scope.unAssignTask = function(taskId) {

	  	var task = 	_.find($scope.tasks, function(obj) { return obj.TASK_ID == taskId; });
	  	var taskBackup = angular.copy(task);

	  	task.ASSIGNED_TO = null;
	  	task.MODIFIED_BY = $scope.entry.currentUser.userName;
	  	task.MODIFIED = moment().toDate();

	  	Task.assignTask(task)	    
	  	.then( function (data) {
	      if (data.success) {
	        Entry.showToast('Task unassigned');
	      }
	      else {
			  	task.ASSIGNED_TO = taskBackup.ASSIGNED_TO;
			  	task.MODIFIED_BY = taskBackup.MODIFIED_BY;
			  	task.MODIFIED = taskBackup.MODIFIED;
	        Entry.showToast('Error ' + data.error.code);
	      }
	    });

	  };
	  
	  $scope.closeTaskOpco = function(taskId) {

	  	var task = 	_.find($scope.tasks, function(obj) { return obj.TASK_ID == taskId; });
	  	var taskBackup = angular.copy(task);

	  	task.STATUS = 'Open - TAG';
	  	task.ASSIGNED_TO = $scope.entry.currentUser.userName;
	  	task.MODIFIED_BY = $scope.entry.currentUser.userName;
	  	task.MODIFIED = moment().toDate();
	  	task.STATUS_BY = $scope.entry.currentUser.userName;

	  	Task.changeTaskStatus(task)	    
	  	.then( function (data) {
	      if (data.success) {
	        // $scope.entry.getCounters();	      	
	        Entry.showToast('Task closed and flagged for TAG review');
	      }
	      else {
			  	task.STATUS = taskBackup.STATUS;
			  	task.MODIFIED_BY = taskBackup.MODIFIED_BY;
			  	task.MODIFIED = taskBackup.MODIFIED;
			  	task.ASSIGNED_TO = taskBackup.ASSIGNED_TO;
			  	task.STATUS_BY = taskBackup.STATUS_BY;
	        Entry.showToast('Error' + data.error.code);
	      }
	    });

	  };

	  $scope.closeTaskTag = function(taskId) {

	  	var task = 	_.find($scope.tasks, function(obj) { return obj.TASK_ID == taskId; });
	  	var taskBackup = angular.copy(task);

	  	task.STATUS = 'Closed';
	  	task.MODIFIED_BY = $scope.entry.currentUser.userName;
	  	task.MODIFIED = moment().toDate();
	  	task.STATUS_BY = $scope.entry.currentUser.userName;

	  	Task.changeTaskStatus(task)	    
	  	.then( function (data) {
	      if (data.success) {
	        // $scope.entry.getCounters();	      	
	        Entry.showToast('Task closed');
	      }
	      else {
			  	task.STATUS = taskBackup.STATUS;
			  	task.MODIFIED_BY = taskBackup.MODIFIED_BY;
			  	task.MODIFIED = taskBackup.MODIFIED;
			  	task.STATUS_BY = taskBackup.STATUS_BY;
	        Entry.showToast('Error ' + data.error.code);
	      }
	    });

	  };

	  $scope.returnTaskToOpco = function(taskId) {

	  	var task = 	_.find($scope.tasks, function(obj) { return obj.TASK_ID == taskId; });
	  	var taskBackup = angular.copy(task);

	  	task.STATUS = 'Open - OPCO';
	  	task.MODIFIED_BY = $scope.entry.currentUser.userName;
	  	task.MODIFIED = moment().toDate();
	  	task.STATUS_BY = $scope.entry.currentUser.userName;

	  	Task.changeTaskStatus(task)	    
	  	.then( function (data) {
	      if (data.success) {
	        // $scope.entry.getCounters();	      	
	        Entry.showToast('Task closed');
	      }
	      else {
			  	task.STATUS = taskBackup.STATUS;
			  	task.MODIFIED_BY = taskBackup.MODIFIED_BY;
			  	task.MODIFIED = taskBackup.MODIFIED;
			  	task.STATUS_BY = taskBackup.STATUS_BY;
	        Entry.showToast('Error ' + data.error.code);
	      }
	    });

	  };


	  $scope.approveChange = function (rowId) {
	    var changeObj = _.find($scope.changeRequests, function(obj) { return obj.CHANGE_ID == rowId; });

	    CommentModal().then(function (modalData) {
	      
	      changeObj.STATUS = 'Approved';
	      changeObj.MODIFIED = moment().toDate();
	      changeObj.APPROVER = angular.copy($scope.entry.currentUser.userName);
	      if (typeof modalData !== 'undefined') {
	      	changeObj.APPROVER_COMMENT = modalData.COMMENT;
	      }

	      Change.approveChangeRequest(changeObj).then(function (data) {
	        if (data.success){
	          Entry.showToast('Change request approval successfully submited.');
	        //   $scope.entry.getCounters();
	          return $state.go('metricInfo', {opcoId: $scope.metric.OPCO_ID, metricId: $scope.metric.METRIC_ID}, { reload: true });
	        }
	        else {
	          switch (data.error.errno){
	            case 19: Entry.showToast('Change request approval failed. Open request for this dato already exists.'); break;
	            default: Entry.showToast('Change request approval failed. Error ' + data.error.code); break;
	          }
	        }
	      });

	    }).catch(function (err) {
	      Entry.showToast('Change request approval canceled. Error ' + err); 
	      return $state.go('metricInfo', {opcoId: $scope.metric.OPCO_ID, metricId: $scope.metric.METRIC_ID}, { reload: true });
	    });
	  };

	  $scope.rejectChange = function (rowId) {
	    var changeObj = _.find($scope.changeRequests, function(obj) { return obj.CHANGE_ID == rowId; });

	    CommentModal().then(function (modalData) {

	      changeObj.STATUS = 'Rejected';
	      changeObj.MODIFIED = moment().toDate();
	      changeObj.APPROVER = angular.copy($scope.entry.currentUser.userName);
	      if (typeof modalData !== 'undefined') {
	      	changeObj.APPROVER_COMMENT = modalData.COMMENT;
	      }

	      Change.rejectChangeRequest(changeObj).then(function (data) {
	        if (data.success){
	          Entry.showToast('Change request rejected');
	        //   $scope.entry.getCounters();
	          return $state.go('metricInfo', {opcoId: $scope.metric.OPCO_ID, metricId: $scope.metric.METRIC_ID}, { reload: true });
	        }
	        else {
	          switch (data.error.errno){
	            case 19: Entry.showToast('Change request approval failed. Open request for this dato already exists'); break;
	            default: Entry.showToast('Change request approval failed. Error ' + data.error.code); break;
	          }
	        }
	      });

	    }).catch(function (err) {
	      Entry.showToast('Change request approval canceled. Error ' + err); 
	      return $state.go('metricInfo', {opcoId: $scope.metric.OPCO_ID, metricId: $scope.metric.METRIC_ID}, { reload: true });
	    });

	  }; 

	  $scope.Lpad = function (str, length, padString) {
	    str = str.toString();
	    while (str.length < length) {
	    	str = padString + str;
	    }
	    return str;
	  };

		$scope.getColor = function(str) {
			var colorHash = new window.ColorHash();
			return colorHash.hex(str);
		};

		$scope.riskNodeClick = function(riskNode) {
			$state.go('riskNodeTable', {productSegmentId: riskNode.PRODUCT_SEGMENT_ID, riskId: riskNode.RISK_ID, tabId: riskNode.active}, {reload: true});
		};

    $scope.toggleShowBA = function () {
      $scope.showBA = !$scope.showBA;
    };  

	  var trusted = {};
	  $scope.popoverHtml = function (popoverDescription, popoverUnit) {	  	
	  	var popoverTxt = popoverDescription + ' <small class="btn-blue"> [unit: <strong>' + popoverUnit + '</strong>]</small>';
	  	return trusted[popoverTxt] || (trusted[popoverTxt] = $sce.trustAsHtml(popoverTxt));
	  };

	  $scope.$watch('entry.OPCO_ID', function(){
	      if ($scope.entry.OPCO_ID) {
	        $state.go('metricInfo', {opcoId:$scope.entry.OPCO_ID, metricId:$stateParams.metricId});
	      }
	  });  
  }
}

angular.module('amxApp')
  .component('metricInfo', {
    templateUrl: 'app/amx/routes/metricInfo/metricInfo.html',
    controller: MetricInfoComponent
  });

})();
