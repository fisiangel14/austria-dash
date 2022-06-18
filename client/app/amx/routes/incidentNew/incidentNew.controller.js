'use strict';
(function(){

class IncidentNewComponent {
  constructor($scope, Incident, Entry, Coverage, $state, $stateParams, $sanitize, Lookup) {
	  $scope.init = function (){
	    $scope.entry = Entry;
	    $scope.newIncident = true;
	    $scope.amxProcedures = [];
	    $scope.incident = [];
	    $scope.controls = [];
			$scope.localEntry = { 'lookup': {} };

      $scope.visible = []; 
      $scope.label = []; 
      
			// Areas lookup
			Lookup.lookup('getAreas').then(function (data) {
				$scope.localEntry.lookup.areas = data;
				$scope.localEntry.lookup.getAreaById = function (id) {
					return _.find($scope.localEntry.lookup.areas, function (num) { return num.AREA_ID == id; });
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

	    Incident.getAmxProcedures().then(function (data) {
	      $scope.amxProcedures = data;
	    });

			Coverage.getControls($scope.entry.currentUser.userOpcoId).then(function(data){
				$scope.controls = data;
			});


      if ($stateParams.cloneFrom === undefined) {
        $scope.incident = {
          'OPCO_ID':$scope.entry.currentUser.userOpcoId,
          'METRIC_ID': null,
          'OPENING_DATE': moment().toDate(),
          'CLOSING_DATE': null,
          'CREATED': moment().toDate(),
          'MODIFIED': moment().toDate(),
          'DUE_DATE': moment().add(7, 'days').toDate(),
          'PROBLEM_DESCRIPTION': null,
          'ROOT_CAUSE': null,
          'IMPACT_TYPE': 'Unknown',
          'CLASIFICATION': 'Unknown',
          'POSITIVE_IMPACT': 0,
          'NEGATIVE_IMPACT': 0,
          'CORRECTIVE_ACTION': null,
          'RESPONSIBLE_AREA': null,
          'RESPONSIBLE_TEAM': null,
          'RESPONSIBLE_PERSON': null,
          'RESPONSIBLE_DIRECTOR': null,
          'STATUS': 'Pending',
          'NOTES': null,
          'PROCEDURE_AMX_ID': 'N/A',
          'MODIFIED_BY': $scope.entry.currentUser.userName,
          'CREATED_BY': $scope.entry.currentUser.userName,
          'STATUS_BY': null,
          'STATUS_DATE': null,
        };
      }
      else {
        Incident.getIncidentInfo($stateParams.cloneFrom).then(function (data) {
          $scope.incident = data;
          delete $scope.incident.INCIDENT_ID;
          delete $scope.incident.LAST_MODIFIED;
          delete $scope.incident.LAST_STATUS_BY;
          $scope.incident.OPENING_DATE = moment().toDate();
          $scope.incident.CLOSING_DATE = null;
          $scope.incident.END_DATE = null;
          $scope.incident.CREATED = moment().toDate();
          $scope.incident.MODIFIED = moment().toDate();
          $scope.incident.DUE_DATE = moment().add(7, 'days').toDate();
          $scope.incident.STATUS = 'Pending';
          $scope.incident.MODIFIED_BY = $scope.entry.currentUser.userName;
          $scope.incident.CREATED_BY = $scope.entry.currentUser.userName;
          $scope.incident.STATUS_BY = null;
          $scope.incident.STATUS_DATE = null;

          $scope.typeOfImpactChanged();

          Coverage.getControls($scope.incident.OPCO_ID).then(function(data){
            $scope.controls = data;
          });
  
        });        
      }

	    //Datepicker
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

	    //Datepicker DUE_DATE
	    $scope.dp2 = {};
	    $scope.dp2.status = {opened: false};

	    $scope.dp2.open = function($event) {
	      $scope.dp2.status.opened = true;
	    };

	    $scope.dp2.dateOptions = {
	      formatYear: 'yyyy',
	      startingDay: 1
	    };

	    //Datepicker CLOSING_DATE
	    $scope.dp3 = {};
	    $scope.dp3.status = {opened: false};

	    $scope.dp3.open = function($event) {
	      $scope.dp3.status.opened = true;
	    };

	    $scope.dp3.dateOptions = {
	      formatYear: 'yyyy',
	      startingDay: 1
	    };

	    //Datepicker ISSUE END DATE
	    $scope.dp4 = {};
	    $scope.dp4.status = {opened: false};

	    $scope.dp4.open = function($event) {
	      $scope.dp4.status.opened = true;
	    };

	    $scope.dp4.dateOptions = {
	      formatYear: 'yyyy',
	      startingDay: 1
	    };	    
	    //Datepicker
	  };

	  $scope.typeOfImpactChanged = function () {

      if ($scope.incident.IMPACT_TYPE === $scope.incident.SECONDARY_IMPACT_TYPE) {
        $scope.incident.SECONDARY_IMPACT_TYPE = '';
      }

      // No loss or Unknown
      if ($scope.incident.IMPACT_TYPE == 'No loss' || $scope.incident.IMPACT_TYPE == 'Unknown') {
	      $scope.visible.impact = false;
	      $scope.visible.recovered = false;
        $scope.visible.prevented = false;
        $scope.incident.IMPACT = null;
        $scope.incident.RECOVERED = null;
        $scope.incident.PREVENTED = null;

        // Reset secondary impact everytime primary impact is changed
        $scope.incident.SECONDARY_IMPACT_TYPE = '';
        $scope.visible.secondaryImpactSection = false;
        $scope.visible.secondaryImpact = false;
        $scope.visible.secondaryRecovered = false;
        $scope.visible.secondaryPrevented = false;
        $scope.incident.SECONDARY_IMPACT = null;
        $scope.incident.SECONDARY_RECOVERED = null;
        $scope.incident.SECONDARY_PREVENTED = null;        
      }  

	    // Revenue loss
	    if ($scope.incident.IMPACT_TYPE == 'Revenue loss') {
	      $scope.label.impact = 'Revenue lost';
	      $scope.visible.impact = true;
	      $scope.label.recovered = 'Revenue recovered';
	      $scope.visible.recovered = true;
	      $scope.label.prevented = 'Revenue loss prevented';
        $scope.visible.prevented = true;
        
        $scope.visible.secondaryImpactSection = true;
	    }

	    // Overcharging
	    if ($scope.incident.IMPACT_TYPE == 'Overcharging') {
	      $scope.label.impact = 'Unjustified gain';
	      $scope.visible.impact = true;
	      $scope.label.recovered = 'Unjustified gain corrected';
	      $scope.visible.recovered = true;
	      $scope.label.prevented = 'Unjustified gain prevented';
        $scope.visible.prevented = true;
        
        $scope.visible.secondaryImpactSection = true;
	    }

	    // Excessive costs
	    if ($scope.incident.IMPACT_TYPE == 'Excessive costs') {
	      $scope.label.impact = 'Excessive costs';
	      $scope.visible.impact = true;
	      $scope.label.recovered = 'Excessive costs corrected';
	      $scope.visible.recovered = true;
	      $scope.label.prevented = 'Excessive costs prevented';
        $scope.visible.prevented = true;
        
        $scope.visible.secondaryImpactSection = true;
	    }

	    // Financial reporting wrong
	    if ($scope.incident.IMPACT_TYPE == 'Financial reporting misstatement') {
	      $scope.label.impact = 'Financial reporting misstatement';
	      $scope.visible.impact = true;
	      $scope.label.recovered = 'Financial reporting misstatement corrected';
	      $scope.visible.recovered = true;
	      $scope.label.prevented = 'Financial reporting misstatement prevented';
        $scope.visible.prevented = true;
        
        $scope.visible.secondaryImpactSection = true;
	    }

	    // Usage
	    if ($scope.incident.IMPACT_TYPE == 'Usage loss of event CDRs') {
	      $scope.label.impact = 'Usage loss of event CDRs';
	      $scope.visible.impact = true;
	      $scope.label.recovered = 'Usage loss of event CDRs recovered';
	      $scope.visible.recovered = true;
	      $scope.label.prevented = 'Usage loss of event CDRs prevented';
        $scope.visible.prevented = true;
        
        $scope.visible.secondaryImpactSection = true;
	    }    
	    
	    // Usage
	    if ($scope.incident.IMPACT_TYPE == 'Usage loss of minutes MoU') {
	      $scope.label.impact = 'Usage loss of minutes MoU';
	      $scope.visible.impact = true;
	      $scope.label.recovered = 'Usage loss of minutes MoU recovered';
	      $scope.visible.recovered = true;
	      $scope.label.prevented = 'Usage loss of minutes MoU prevented';
        $scope.visible.prevented = true;
        
        $scope.visible.secondaryImpactSection = true;
	    }        

	    // Usage
	    if ($scope.incident.IMPACT_TYPE == 'Usage loss of data traffic GB') {
	      $scope.label.impact = 'Usage loss of data traffic GB';
	      $scope.visible.impact = true;
	      $scope.label.recovered = 'Usage loss of data traffic GB recovered';
	      $scope.visible.recovered = true;
	      $scope.label.prevented = 'Usage loss of data traffic GB prevented';
        $scope.visible.prevented = true;
        
        $scope.visible.secondaryImpactSection = true;
	    }    

	    // Customer data inconsistency
	    if ($scope.incident.IMPACT_TYPE == 'Customer data inconsistency') {
	      $scope.label.impact = 'Customer data inconsistency';
	      $scope.visible.impact = true;
	      $scope.label.recovered = 'Customer data inconsistency corrected';
	      $scope.visible.recovered = true;
	      $scope.label.prevented = 'Customer data inconsistency prevented';
        $scope.visible.prevented = true;
        
        $scope.visible.secondaryImpactSection = true;
      }
      
      $scope.typeOfSecondaryImpactChanged();

	  };

	  $scope.typeOfSecondaryImpactChanged = function () {

      if ($scope.incident.SECONDARY_IMPACT_TYPE == null || $scope.incident.SECONDARY_IMPACT_TYPE == '') {
	      $scope.visible.secondaryImpact = false;
	      $scope.visible.secondaryRecovered = false;
        $scope.visible.secondaryPrevented = false;
        $scope.incident.SECONDARY_IMPACT = null;
        $scope.incident.SECONDARY_RECOVERED = null;
        $scope.incident.SECONDARY_PREVENTED = null;
      }  
        
      // Overcharging
	    if ($scope.incident.SECONDARY_IMPACT_TYPE == 'Overcharging') {
	      $scope.label.secondaryImpact = 'Unjustified gain';
	      $scope.visible.secondaryImpact = true;
	      $scope.label.secondaryRecovered = 'Unjustified gain corrected';
	      $scope.visible.secondaryRecovered = true;
	      $scope.label.secondaryPrevented = 'Unjustified gain prevented';
	      $scope.visible.secondaryPrevented = true;
	    }

	    // Excessive costs
	    if ($scope.incident.SECONDARY_IMPACT_TYPE == 'Excessive costs') {
	      $scope.label.secondaryImpact = 'Excessive costs';
	      $scope.visible.secondaryImpact = true;
	      $scope.label.secondaryRecovered = 'Excessive costs corrected';
	      $scope.visible.secondaryRecovered = true;
	      $scope.label.secondaryPrevented = 'Excessive costs prevented';
	      $scope.visible.secondaryPrevented = true;
	    }

	    // Financial reporting wrong
	    if ($scope.incident.SECONDARY_IMPACT_TYPE == 'Financial reporting misstatement') {
	      $scope.label.secondaryImpact = 'Financial reporting misstatement';
	      $scope.visible.secondaryImpact = true;
	      $scope.label.secondaryRecovered = 'Financial reporting misstatement corrected';
	      $scope.visible.secondaryRecovered = true;
	      $scope.label.secondaryPrevented = 'Financial reporting misstatement prevented';
	      $scope.visible.secondaryPrevented = true;
	    }

	    // Usage
	    if ($scope.incident.SECONDARY_IMPACT_TYPE == 'Usage loss of event CDRs') {
	      $scope.label.secondaryImpact = 'Usage loss of event CDRs';
	      $scope.visible.secondaryImpact = true;
	      $scope.label.secondaryRecovered = 'Usage loss of event CDRs recovered';
	      $scope.visible.secondaryRecovered = true;
	      $scope.label.secondaryPrevented = 'Usage loss of event CDRs prevented';
	      $scope.visible.secondaryPrevented = true;
	    }    
	    
	    // Usage
	    if ($scope.incident.SECONDARY_IMPACT_TYPE == 'Usage loss of minutes MoU') {
	      $scope.label.secondaryImpact = 'Usage loss of minutes MoU';
	      $scope.visible.secondaryImpact = true;
	      $scope.label.secondaryRecovered = 'Usage loss of minutes MoU recovered';
	      $scope.visible.secondaryRecovered = true;
	      $scope.label.secondaryPrevented = 'Usage loss of minutes MoU prevented';
	      $scope.visible.secondaryPrevented = true;
	    }        

	    // Usage
	    if ($scope.incident.SECONDARY_IMPACT_TYPE == 'Usage loss of data traffic GB') {
	      $scope.label.secondaryImpact = 'Usage loss of data traffic GB';
	      $scope.visible.secondaryImpact = true;
	      $scope.label.secondaryRecovered = 'Usage loss of data traffic GB recovered';
	      $scope.visible.secondaryRecovered = true;
	      $scope.label.secondaryPrevented = 'Usage loss of data traffic GB prevented';
	      $scope.visible.secondaryPrevented = true;
	    }    

	    // Customer data inconsistency
	    if ($scope.incident.SECONDARY_IMPACT_TYPE == 'Customer data inconsistency') {
	      $scope.label.secondaryImpact = 'Customer data inconsistency';
	      $scope.visible.secondaryImpact = true;
	      $scope.label.secondaryRecovered = 'Customer data inconsistency corrected';
	      $scope.visible.secondaryRecovered = true;
	      $scope.label.secondaryPrevented = 'Customer data inconsistency prevented';
	      $scope.visible.secondaryPrevented = true;
	    }

	  };
    
	  $scope.statusChanged = function () {
	    $scope.incident.STATUS_BY = $scope.entry.currentUser.userName;
	    $scope.incident.STATUS_DATE = moment().toDate();

	    if ($scope.incident.STATUS == 'Closed') {
	      $scope.incident.CLOSING_DATE = moment().toDate();
	    }
	    else {
	      $scope.incident.CLOSING_DATE = null;
	    }
	  };

	  $scope.saveIncident = function () {
	      //everything ok?
	      if ($scope.incidentForm.$valid){
	        Incident.postIncident($scope.incident)
	        .then(function (data) {
	          if (data.success){
	            Entry.showToast('Incident saved');
	            // $scope.entry.getCounters();
	          }
	          else {
	            switch (data.error.errno){
	              default: Entry.showToast('Update failed. Error ' + data.error.code); break;
	            }
	          }
	        });   
					$state.go('incidentTable', {archive: 'N'}, {reload: true});
	      }
	      else {
	        Entry.showToast('Error. Please fill out all required fields!');
	        return;
	      }
	  };

	  $scope.cancelIncident = function () {
	      $scope.newIncident = false;
	      $state.go('incidentTable', {archive: 'N'}, {reload: true});
	  };

	  $scope.controlSelectedFromList = function(item) {
	  	$scope.incident.METRIC_DESCRIPTION = item.DESCRIPTION;
	  };

	  $scope.Lpad = function (str, length, padString) {
	  	if (str) {
		    str = str.toString();
		    while (str.length < length) {
		    	str = padString + str;
		    }
		    return str;
	  	}
	  	else {
	  		return '#';
	  	}
	  };

	  $scope.normalizeText = function(txt) {
	  	if (txt) {
		  	var returnTxt = txt.replace('&', 'and');
		  	returnTxt = returnTxt.replace(/["|`|–|\t]/g, ' ');
		  	returnTxt = returnTxt.replace(/(?:\r\n|\r|\n)/g, ' ');
		  	returnTxt = $sanitize(returnTxt);
		  	return returnTxt;
	  	}
	  	else {
	  		return '';
	  	}
	  };

	  $scope.init();
  }
}

angular.module('amxApp')
  .component('incidentNew', {
    templateUrl: 'app/amx/routes/incidentInfo/incidentInfo.html',
    controller: IncidentNewComponent
  });

})();
