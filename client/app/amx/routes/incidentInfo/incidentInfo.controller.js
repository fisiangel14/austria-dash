'use strict';
(function(){

class IncidentInfoComponent {
  constructor($rootScope, $scope, $sanitize, $cookies, Incident, Alarm, Lookup, Entry, Coverage, $state, $stateParams, ConfirmModal) {

	  $scope.tabChanged = function () {
	    setTimeout (function () {
	      $rootScope.$broadcast('elastic:adjust');
	    }, 800); 
	  };

	  $scope.init = function () {
	    $scope.entry = Entry;
	    $scope.isDisabled = $scope.entry.isDisabled();
	    $scope.incident = [];
	    $scope.controls = [];
	    $scope.alarms = [];
	    $scope.amxProcedures = [];
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

	    Incident.getIncidentInfo($stateParams.incidentId).then(function (data) {
	      $scope.incident = data;
        $scope.activeBAs = JSON.stringify(_.keys(_.pick($scope.incident.BUSINESS_ASSURANCE_DOMAIN, function(val, key, obj) {return val == 'Y';}))).replace(/[\[|\]]/g, '').replace(/,/g, ', ');

	      $scope.typeOfImpactChanged();
	      // $scope.typeOfSecondaryImpactChanged();

				Coverage.getControls($scope.incident.OPCO_ID).then(function(data){
					$scope.controls = data;
				});

	    });

	    Incident.getAmxProcedures().then(function (data) {
	      $scope.amxProcedures = data;
	    });

	    Alarm.getLinkedAlarms($stateParams.incidentId).then(function (data) {
	      $scope.alarms = data;
	    });


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

	  };

	  $scope.init();

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

    $scope.deleteIncident = function (incidentId) {
      ConfirmModal('Are you sure you want to delete incident "' + 'I_' + $scope.entry.currentUser.userOpcoId + '_' + $scope.Lpad(incidentId, 3, '0') + '" ?')
      .then(function(confirmResult) {
        if (confirmResult) {
			    Incident.deleteIncident(incidentId).then(function (data) {
			      if (data.success){
			        $scope.incidents = _.reject($scope.incidents, function(obj) { return obj.INCIDENT_ID == incidentId; });
			        Entry.showToast('Incident I_' + $scope.entry.currentUser.userOpcoId + '_' + $scope.Lpad(incidentId, 3, '0') + '" deleted.');
			        // $scope.entry.getCounters();
			        return $state.go('incidentTable');
			      }
			      else {
			        Entry.showToast('ERROR: Delete failed !');
			      }
		    	});
				}
      })
      .catch(function err() {
            Entry.showToast('Delete action canceled');
      });      	
    };
    
	  $scope.saveIncident = function () {
	      // Form ok?
	      if ($scope.incidentForm.$valid){

			// Check mandatory fields
			if ($scope.incident.STATUS == 'Closed' && $scope.incident.PROCEDURE_AMX_ID == 'N/A') {
				Entry.showToast('Error! Select valid "Issue Detais --> AMX Procedure reference"');
				return;
			}

			if ($scope.incident.STATUS == 'Closed' && $scope.incident.IMPACT_TYPE == 'Unknown') {
				Entry.showToast('Error! Select valid "Impact assessment --> Type of impact"');
				return;
			}

			if ($scope.incident.STATUS == 'Closed' && $scope.incident.CLASIFICATION == 'Unknown') {
				Entry.showToast('Error! Select valid "Resolution --> Classification"');
				return;
			}

			if ($scope.incident.STATUS == 'Closed' && (!$scope.incident.ROOT_CAUSE || $scope.incident.ROOT_CAUSE.length < 5)) {
				Entry.showToast('Error! Enter valid "Resolution --> Cause" description');
				return;
			}

			if ($scope.incident.STATUS == 'Closed' && (!$scope.incident.CORRECTIVE_ACTION || $scope.incident.CORRECTIVE_ACTION.length < 5)) {
				Entry.showToast('Error! Enter valid "Resolution --> Corrective measure" description');
				return;
			}

	        $scope.incident.MODIFIED_BY = angular.copy($scope.entry.currentUser.userName);
	        
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
	        Entry.showToast('Error. Check if all required fields are valid values!');
	        return;
	      }
	  };

	  $scope.saveContact = function (contactType, contactName) {

	    // Skip insert if contact empty or contact exists
	    if (contactName === null || contactName === '') {
	      Entry.showToast('Contact name is empty');
	      return;
	    }
	    else if (typeof _.find($scope.localEntry.lookup.contacts, function (contact) {return contact.NAME == contactName;}) !== 'undefined') {
	      Entry.showToast('Name already exists in contact list');
	      return;
	    }

	    var newContact = [{'OPCO_ID':$scope.entry.currentUser.userOpcoId, 'CONTACT_TYPE': contactType, 'NAME': contactName}];

	    Lookup.postFlashUpdate('contact', newContact)
	    .then(function (data) {
	      if (data.success){
	        Entry.showToast('Name saved in your contact list');
	        Lookup.lookup('getContacts').then(function (data) {
	          $scope.localEntry.lookup.contacts = data;
	        });
	      }
	      else {
	        switch (data.error.errno){
	          default: Entry.showToast('Update failed. Error ' + data.error.code); break;
	        }
	      }
	    });
	  };
	  
	  $scope.cancelIncident = function () {
	      $scope.newIncident = false;
	      $state.go('incidentTable', {archive: 'N'}, {reload: true});
	  };

	  $scope.controlSelectedFromList = function(item) {
	  	$scope.incident.METRIC_DESCRIPTION = item.DESCRIPTION;
	  };

	  $scope.Lpad = function (str, length, padString) {
		if (typeof str === 'undefined') {
			str = '#';
		}
	    str = str.toString();
	    while (str.length < length) {
	    	str = padString + str;
	    }
	    return str;
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
    
    $scope.toggleShowBA = function () {
      $scope.showBA = !$scope.showBA;
    };

    setTimeout (function () {
      $rootScope.$broadcast('elastic:adjust');
    }, 500); 

  }
}

angular.module('amxApp')
  .component('incidentInfo', {
    templateUrl: 'app/amx/routes/incidentInfo/incidentInfo.html',
    controller: IncidentInfoComponent
  });

})();
