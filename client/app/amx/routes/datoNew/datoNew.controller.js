'use strict';
(function(){

class DatoNewComponent {
  constructor($scope, Entry, Change, $state, Lookup) {
	  $scope.init = function (){
	    $scope.entry = Entry;
	    $scope.changeRequest = false;
	    $scope.newDato = true;
	    $scope.datoAdd = {};
			$scope.localEntry = { 'lookup': {} };

			// Areas lookup
			Lookup.lookup('getAreas').then(function (data) {
				$scope.localEntry.lookup.areas = data;
				$scope.localEntry.lookup.getAreaById = function (id) {
					return _.find($scope.localEntry.lookup.areas, function (num) { return num.AREA_ID == id; });
				};
			});

	    $scope.dato = {
	      'DATO_ID':null,
	      'NAME':null,
	      'AREA_ID':null,
	      'METRICS':null,
	      'DESCRIPTION':null,
	      'RELEVANT':'Y',
	      'FREQUENCY':'D',
	      'OPCO_ID': (Number($scope.entry.currentUser.userOpcoId)===0?$scope.entry.OPCO_ID:$scope.entry.currentUser.userOpcoId),
	      'IMPLEMENTED':'N',
	      'NOTES':null,
	      'CHANGE_NOTES':null,
	      'START_DATE':moment().toDate(),
	      'REQUESTOR':null,
	      'CHANGE_LOG':null,
	      'CHANGE_TYPE':null,
	      'NULLABLE':'N',
	      'AUTO_LAYOUT':'Y',
	      'CREATED': moment().format('YYYY-MM-DD HH:mm:ss'),
	      'MODIFIED': moment().format('YYYY-MM-DD HH:mm:ss')
	    };

	    //Datepicker
	    $scope.dp = {};
	    $scope.dp.status = {opened: false};

	    $scope.dp.open = function($event) {
	      $scope.dp.status.opened = true;
	    };
	    
	    $scope.dp.dateOptions = {
	      formatYear: 'yyyy',
	      formatMonth: 'MM',
	      formatDay: 'dd',
	      startingDay: 1
	    };
	    //Datepicker
	  };

	  $scope.submitNewDato = function () {
	      //everything ok?
	      if ($scope.datoForm.$valid){

	        var changeRequest = {};
	        changeRequest.OPCO_ID = $scope.dato.OPCO_ID;
	        changeRequest.CHANGE_TYPE = 'New dato';
	        changeRequest.OBJECT_ID = $scope.dato.DATO_ID;
	        changeRequest.OLD_OBJECT = null;
	        changeRequest.NEW_OBJECT = JSON.stringify($scope.dato);
	        changeRequest.CHANGES = JSON.stringify([{field: 'AREA', newValue: $scope.dato.AREA_ID}, {field: 'FREQUENCY', newValue: $scope.dato.FREQUENCY}, {field: 'START_DATE', newValue: moment($scope.dato.START_DATE).format('DD.MM.YYYY')}]);
	        changeRequest.REQUESTOR = angular.copy($scope.entry.currentUser.userName);
	        changeRequest.REQUESTOR_COMMENT = $scope.datoAdd.CHANGE_REQUEST_COMMENT;
	        changeRequest.APPROVER = null;
	        changeRequest.STATUS = 'Requested';

	        Change.postChangeRequest(changeRequest).then(function (data) {
	          if (data.success){
	            Entry.showToast('New dato request successfully submited.');
	            // $scope.entry.getCounters();
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
	      else {
	        Entry.showToast('Error. Please fill out all required fields!');
	        return;
	      }
	  };

	  $scope.cancelNewDato = function () {
	      $scope.newDato = false;
	      return $state.go('datoTable');
	  };

	  $scope.init();
  }
}

angular.module('amxApp')
  .component('datoNew', {
    templateUrl: 'app/amx/routes/datoInfo/datoInfo.html',
    controller: DatoNewComponent
  });

})();
