'use strict';

(function(){

class TaskTableComponent {
  constructor($scope, Entry, Task, $http, $state, $stateParams) {
    $scope.entry = Entry;
    $scope.isDisabled = $scope.entry.isDisabled();
    $scope.tasks = [];
    $scope.loadFinished = false;

	  if ($stateParams.opcoId === undefined) {
	    $state.go('taskTable', {opcoId: $scope.entry.OPCO_ID}, {reload: true});
	  }

	  Task.getAllTasks($stateParams.opcoId).then(function (data) {
	    $scope.tasks = data;
	    $scope.loadFinished = true;
	  });

	  $scope.filterChanged = function () {
	  	// remove filters with blank values
		  $scope.entry.searchTask = _.pick($scope.entry.searchTask, function(value, key, object) {
		  	return value !== '' && value !== null;
		  });

	    if (_.size($scope.entry.searchTask) === 0) {
	    	delete $scope.entry.searchTask;
	    }		  
	  };

	  $scope.removeAllFilters = function () {
	    delete $scope.entry.searchTask;
	  };

	  $scope.removeFilter = function (element) {
	    delete $scope.entry.searchTask[element];
	    if (_.size($scope.entry.searchTask) === 0) {
	    	delete $scope.entry.searchTask;
	    }
	  };

    $scope.Lpad = function (str, length, padString) {
      str = str.toString();
      while (str.length < length) {
        str = padString + str;
      }
      return str;
    };

	  // Reload OPCO_ID change
	  $scope.$watch('entry.OPCO_ID', function(){
	    setTimeout (function () {
	      $state.go('taskTable', {opcoId: $scope.entry.OPCO_ID} );
	    }, 100); 
	  });  	  

	  $scope.newTask = function(opcoId) {
	  	Task.newTask({OPCO_ID: opcoId, SOURCE: 'METRIC'})
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
	        Entry.showToast('Error ' + data.error.code);
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
	        Entry.showToast('Task re-assigned back to OPCO');
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

  }
}

angular.module('amxApp')
  .component('taskTable', {
    templateUrl: 'app/amx/routes/taskTable/taskTable.html',
    controller: TaskTableComponent,
    controllerAs: 'taskTableCtrl'
  });

})();
