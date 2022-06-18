'use strict';
(function(){

class DatoInfoComponent {
  constructor($scope, $timeout, Dato, Entry, Change, CommentModal, Task, $state, $stateParams, ConfirmModal, Lookup) {

	  $scope.init = function () {
	    $scope.entry = Entry;
	    $scope.changeRequest = false;
	    $scope.newDato = false;
	    $scope.datoAdd = {};
			$scope.tasks = [];
			$scope.localEntry={'lookup': {}};

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
			//Systems lookup
			Lookup.lookup('getSystems').then(function (data) {
				$scope.localEntry.lookup.systems = data;
				$scope.localEntry.lookup.getSystemById = function (id) {
					if (typeof id === 'undefined' || isNaN(id)) { id = 0; }
					return _.find($scope.localEntry.lookup.systems, function (num) { return num.SYSTEM_ID == id; });
				};
			});				
			//Contacts lookup
			Lookup.lookup('getContacts').then(function (data) {
				$scope.localEntry.lookup.contacts = data;
				$scope.localEntry.lookup.getContactById = function (id) {
					if (typeof id === 'undefined' || isNaN(id)) { id = 0; }
					return _.find($scope.localEntry.lookup.contacts, function (num) { return num.CONTACT_ID == id; });
				};
				$scope.localEntry.lookup.getContactByName = function (name) {
					return _.find($scope.localEntry.lookup.contacts, function (num) { return num.NAME === name && num.OPCO_ID == $scope.entry.currentUser.userOpcoId; });
				};
			});	

	    if (Number($stateParams.opcoId) != $scope.entry.OPCO_ID) {
	    	$scope.entry.OPCO_ID = Number($stateParams.opcoId);
	    }

	    Dato.getDatoInfo($stateParams.opcoId, $stateParams.datoId).then(function (data) {
	      $scope.dato = data;
	    });

	    Dato.getDatoLayout($stateParams.opcoId, $stateParams.datoId).then(function (data) {
	      $scope.datoLayout = data;
	      // console.log($scope.datoLayout);
	    });

 			Task.getObjectTasks($stateParams.opcoId, $stateParams.datoId).then(function (data) {
	      $scope.tasks = data;
	    });

 			Change.getChangeRequestsForObject($stateParams.opcoId, $stateParams.datoId, 'D').then(function (data) {
	      $scope.changeRequests = data;
			});
			

	    //Datepicker
	    $scope.dp = {};
	    $scope.dp.status = {opened: false};

	    $scope.dp.open = function($event) {
	      $scope.dp.status.opened = true;
	    };

	    $scope.dp.dateOptions = {
	      formatYear: 'yyyy',
	      startingDay: 1
	    };

	    //Update timer
	    var timer = false;

	    var timeoutDatoChangeUpdate = function(newValue, oldValue){
	      if (newValue != oldValue && oldValue !== undefined && ($scope.dato.OPCO_ID == $scope.entry.currentUser.userOpcoId || Number($scope.entry.currentUser.userOpcoId) === 0)) {
	        $scope.flashMessage = 'Saving...';
	        if(timer){
	          $timeout.cancel(timer);
	        }
	        timer = $timeout(function(){ 
	            //console.log('Note changed to ' + newValue);      
	            //console.log('Saving ' + moment().format('YYYY-MM-DD HH:mm'));
	            Dato.postDatoFlashUpdate($scope.dato).then(function (data) {
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
	    $scope.$watch('dato.NOTES', timeoutDatoChangeUpdate);
	    $scope.$watch('dato.IMPLEMENTED', timeoutDatoChangeUpdate, true);
	    $scope.$watch('dato.UNIT', timeoutDatoChangeUpdate, true);

	    var timeoutLayoutChangeUpdate = function(newValue, oldValue){
	      if (newValue != oldValue && oldValue !== undefined && ($scope.dato.OPCO_ID == $scope.entry.currentUser.userOpcoId || Number($scope.entry.currentUser.userOpcoId) === 0)) {
	        $scope.flashMessage = 'Saving...';
	        if(timer){
	          $timeout.cancel(timer);
	        }
	        timer = $timeout(function(){ 
	            Dato.postLayoutFlashUpdate($scope.datoLayout).then(function (data) {
	              if (data.success){
	                $scope.flashMessage = 'All changes saved';
	              }
	              else {
	                Entry.showToast('Change request failed. Error: ' + data.error.code); 
	              }
	            });

	        }, 500);
	      }
	    };
	    $scope.$watch('datoLayout', timeoutLayoutChangeUpdate, true);

	  };

	  $scope.init();

	  $scope.addDatoChangeRequest = function () {
	    //$scope.datoForm.datoSTART_DATE.$setValidity('date', true);
	    $scope.originalDato = angular.copy($scope.dato);
	    $scope.changeRequest = true;    
	  };

	  $scope.cancelDatoChangeRequest = function () {
	    $scope.dato = angular.copy($scope.originalDato);  
	    Entry.showToast('Change Request Canceled. Original dato info restored. ');
	    $scope.changeRequest = false;
	  };

	  $scope.submitDatoChangeRequest = function () {

	    // console.log('$scope.CHANGE_REQUEST_COMMENT');
	    // console.log($scope.datoAdd.CHANGE_REQUEST_COMMENT);

	    var datoChanges = '<ol>';     
	    var changesArr = [];     
	    _.each($scope.dato, function (element, index, list) {
	      if ($scope.originalDato[index] != list[index]) {
	        //handle Date types
	        if (list[index] instanceof Date) {
	          var newDate = moment(list[index]).format('YYYY-MM-DD');
	          var oldDate = moment($scope.originalDato[index]).format('YYYY-MM-DD');
	          if ( newDate != oldDate) {
	            datoChanges += '<li>' + (index + ' changed from \"' + oldDate + '\" to \"' + newDate + '\"') + '</li>';
	            changesArr.push({field:index, oldValue: oldDate, newValue: newDate});
	          }
	        }
	        else {
	          datoChanges += '<li>' + (index + ' changed from \"' + $scope.originalDato[index] + '\" to \"' + element + '\"') + '</li>';
	          changesArr.push({field:index, oldValue: $scope.originalDato[index], newValue: element});
	        }
	      }
	    });
	    datoChanges += '</ol>';

	    //Some changes are made in the form
	    if (changesArr.length > 0 && $scope.datoForm.$valid){
	      var changeRequest = {};
	      changeRequest.OPCO_ID = $scope.originalDato.OPCO_ID;
	      changeRequest.CHANGE_TYPE = 'Edit dato';
	      changeRequest.OBJECT_ID = $scope.originalDato.DATO_ID;
	      changeRequest.OLD_OBJECT = JSON.stringify($scope.originalDato);
	      changeRequest.NEW_OBJECT = JSON.stringify($scope.dato);
	      changeRequest.CHANGES = JSON.stringify(changesArr);
	      changeRequest.REQUESTOR = angular.copy($scope.entry.currentUser.userName);
	      changeRequest.REQUESTOR_COMMENT = $scope.datoAdd.CHANGE_REQUEST_COMMENT;
	      changeRequest.APPROVER = null;
	      changeRequest.STATUS = 'Requested';

	      Change.postChangeRequest(changeRequest).then(function (data) {
	        if (data.success){
	          Entry.showToast('Dato change request successfully submited.');
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
	    else if (!$scope.datoForm.$valid) {
	      Entry.showToast('Error. Please fill out all required fields!');
	      return;
	    }
	    else {
	      Entry.showToast('No change made. Change request ignored');
	    }

	    $scope.dato = angular.copy($scope.originalDato);
	    $scope.changeRequest = false;

	  };

	  $scope.deleteLayout = function (layoutId) {

      ConfirmModal('Are you sure you want to delete this Dato dimension ?')
      .then(function(confirmResult) {
        if (confirmResult) {
		      Dato.deleteLayout(layoutId).then(function (data) {
		        if (data.success){
		          $scope.datoLayout = _.reject($scope.datoLayout, function(obj) { return obj.LAYOUT_ID == layoutId; });
		          Entry.showToast('Layout entry successfully deleted.');
		        }
		        else {
		          Entry.showToast('Layout delete request failed'); 
		        }
		      });
				}
      })
      .catch(function err() {
            Entry.showToast('Delete action canceled');
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
	          return $state.go('datoInfo', {opcoId: $scope.dato.OPCO_ID, datoId: $scope.dato.DATO_ID}, { reload: true });
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
	      return $state.go('datoInfo', {opcoId: $scope.dato.OPCO_ID, datoId: $scope.dato.DATO_ID}, { reload: true });
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
	          Entry.showToast('Change request rejected.');
	        //   $scope.entry.getCounters();
	          return $state.go('datoInfo', {opcoId: $scope.dato.OPCO_ID, datoId: $scope.dato.DATO_ID}, { reload: true });
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
	      return $state.go('datoInfo', {opcoId: $scope.dato.OPCO_ID, datoId: $scope.dato.DATO_ID}, { reload: true });
	    });

	  }; 

	  $scope.Lpad = function (str, length, padString) {
	    str = str.toString();
	    while (str.length < length) {
	    	str = padString + str;
	    }
	    return str;
	  };
	  
	  $scope.$watch('entry.OPCO_ID', function(){
	      if ($scope.entry.OPCO_ID) {
	        $state.go('datoInfo', {opcoId:$scope.entry.OPCO_ID, datoId:$stateParams.datoId});
	      }
	  });

  }
}

angular.module('amxApp')
  .component('datoInfo', {
    templateUrl: 'app/amx/routes/datoInfo/datoInfo.html',
    controller: DatoInfoComponent
  });

})();
