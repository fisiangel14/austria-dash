'use strict';
(function(){

class ChangeRequestsComponent {
  constructor($scope, Change, Entry, CommentModal, $state, $stateParams) {

	  $scope.entry = Entry;
	  $scope.loadFinished = false;
	  
	  if ($stateParams.opcoId === undefined) {
	    $state.go('changeRequests', {opcoId: $scope.entry.OPCO_ID, archive: 'N'}, {reload: true} );
	  }

	  $scope.changeRequests = [];
	  $scope.showArchive = 'N';

	  if ($stateParams.archive == 'N') {
	    $scope.showArchive = 'N';
	    $scope.toggleArchive = 'Y';
	    $scope.showArchivedLabel = 'Change requests archive';
	  }
	  else {
	    $scope.showArchive = 'Y';
	    $scope.toggleArchive = 'N';
	    $scope.showArchivedLabel = 'Back to active change requests';
	  }

	  Change.getChangeRequests($stateParams.opcoId, $scope.showArchive)
	  .then(function (data) {
	    $scope.changeRequests = data;
	  	$scope.loadFinished = true;
	  });

	  // $scope.init = function () {
	  //   $scope.entry = Entry;
	  //   $scope.showArchive = 'N';
	  //   $scope.showArchivedLabel = 'Archive';

	  //   $scope.changeRequests = [];

	  //   Change.getActiveChangeRequests().then(function (data) {
	  //     $scope.changeRequests = data;
	  //   });

	  // };

	  // $scope.init();
	  
	  // $scope.toggleShowArchived = function () {
	  //   if ($scope.showArchive == 'N') {
	  //     Change.getArchivedChangeRequests().then(function (data) {
	  //       $scope.showArchivedLabel = 'Back to active change requests';
	  //       $scope.changeRequests = data;
	  //       $scope.showArchive = 'Y';
	  //     }); 
	  //   }
	  //   else {
	  //     Change.getActiveChangeRequests().then(function (data) {
	  //       $scope.showArchivedLabel = 'Archive';
	  //       $scope.changeRequests = data;
	  //       $scope.showArchive = 'N';
	  //     });       
	  //   }
	  // };

	  $scope.toggleShowArchived = function () {
	    if ($scope.showArchive == 'N') {
	      $state.go('changeRequests', {opcoId: $scope.entry.OPCO_ID, archive: 'Y'}, {reload: true} );
	      // Incident.getIncidents($stateParams.opcoId, 'Y').then(function (data) {
	      //   $scope.showArchivedLabel = 'Back to active incidents';
	      //   $scope.incidents = data;
	      //   $scope.showArchive = 'Y';
	      // }); 
	    }
	    else {
	      $state.go('changeRequests', {opcoId: $scope.entry.OPCO_ID, archive: 'N'}, {reload: true} );
	      // Incident.getIncidents($stateParams.opcoId, 'N').then(function (data) {
	      //   $scope.showArchivedLabel = 'Incident archive';
	      //   $scope.incidents = data;
	      //   $scope.showArchive = 'N';
	      // });       
	    }
	  };

	  $scope.removeAllFilters = function () {
	    delete $scope.entry.searchChange;
	  };

	  $scope.removeFilter = function (element) {
	    delete $scope.entry.searchChange[element];
	    if (_.size($scope.entry.searchChange)  === 0) {
	    	delete $scope.entry.searchChange;
	    }
	  };

	  // $scope.modalCancel = function () {
	  //   $modalInstance.dismiss('cancel');
	  // };

	  // $scope.modalSubmit = function () {
	  //   $modalInstance.close($scope.commentForm);
	  // };

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
	          return $state.go('changeRequests');
	        }
	        else {
	          switch (data.error.errno){
	            case 19: Entry.showToast('Change request approval failed. Open request for this dato already exists.'); break;
	            default: Entry.showToast('Change request approval failed. Error ' + data.error.code); break;
	          }
	        }
	      });

	    }).catch(function (err) {
	      Entry.showToast('Change request approval canceled. Error: ' + err); 
	      return $state.go('changeRequests', {}, { reload: true });
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
	          return $state.go('changeRequests');
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
	      return $state.go('changeRequests', {}, { reload: true });
	    });

	  }; 

	  $scope.archiveChange = function (rowId) {
	    var changeObj = _.find($scope.changeRequests, function(obj) { return obj.CHANGE_ID == rowId; });

	    changeObj.ARCHIVED = 'Y';
	    Change.archiveChangeRequest(changeObj).then(function (data) {
	      if (data.success){
	        $scope.changeRequests = _.reject($scope.changeRequests, function(obj) { return obj.CHANGE_ID == rowId; });
	        Entry.showToast('Change request archived.');
	        // $scope.entry.getCounters();
	        return $state.go('changeRequests');
	      }
	      else {
	        switch (data.error.errno){
	          case 19: Entry.showToast('Change request archive failed. Open request for this dato already exists.'); break;
	          default: Entry.showToast('Change request archive failed. Error ' + data.error.code); break;
	        }
	      }
	    });

	  }; 

	  $scope.Lpad = function (str, length, padString) {
	    str = str.toString();
	    while (str.length < length) {
	    	str = padString + str;
	    }
	    return str;
	  };

	  // On OPCO_ID change
	  $scope.$watch('entry.OPCO_ID', function(){
	    setTimeout (function () {
	      $state.go('changeRequests', {opcoId: $scope.entry.OPCO_ID, archive: $scope.showArchive});
	    }, 100);           
	  }); 
  }
}

angular.module('amxApp')
  .component('changeRequests', {
    templateUrl: 'app/amx/routes/changeRequests/changeRequests.html',
    controller: ChangeRequestsComponent
  });

})();
