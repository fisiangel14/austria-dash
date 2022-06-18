'use strict';
(function(){

class IncidentTableComponent {
  constructor($scope, $timeout, Incident, Entry, ExportIncidentReportModal, $filter, $stateParams, $state, ConfirmModal) {

	  $scope.entry = Entry;
	  $scope.loadFinished = false;
    $scope._und = _;
	  
	  if ($stateParams.opcoId === undefined) {
	    $state.go('incidentTable', {opcoId: $scope.entry.OPCO_ID, archive: 'N'}, {reload: true} );
	  }
	  else if (Number($stateParams.opcoId) !== $scope.entry.OPCO_ID) {
	    $scope.entry.OPCO_ID = Number($stateParams.opcoId);
	  }

	  $scope.incidents = [];

	  Incident.getIncidents($stateParams.opcoId).then(function (data) {
	    $scope.incidents = data;
			// $scope.filteredIncidents = $filter('filter') ($scope.incidents, $scope.entry.searchIncident);

			// Pagination in controller
			$scope.pageSize = 15;
			$scope.currentPage = 1;      
	  });

		$scope.setCurrentPage = function(currentPage) {
      $scope.currentPage = currentPage;
    };


    // Watch filter change
    var timer = false;
    var timeoutFilterChange = function(newValue, oldValue){
        // remove filters with blank values
        $scope.entry.searchIncident = _.pick($scope.entry.searchIncident, function(value, key, object) {
          return value !== '' && value !== null;
        });

        if (_.size($scope.entry.searchIncident) === 0) {
          delete $scope.entry.searchIncident;
        }  

        if(timer){
          $timeout.cancel(timer);
        }

        timer = $timeout(function(){ 
          $scope.loadFinished = false;
          $scope.filteredIncidents = $filter('filter') ($scope.incidents, $scope.entry.searchIncident);

          
          //var groupsAll = _.groupBy(data, 'METRIC_ID');
          $scope.filteredIncidentsGroupsArea = _.groupBy($scope.filteredIncidents, 'AREA');
          
          
          //Calculate the sum per DATO_ID
          $scope.filteredIncidentsSumsOpco = _.map($scope.filteredIncidentsGroupsArea, function(g) {
            return { 
              AREA: _.reduce(g, function(m,x) { return x.AREA != 'Value Added Services'?x.AREA:'VAS'; }, 0),
              COUNT: _.reduce(g, function(m,x) { return m + 1; }, 0)
            };
          });
          
          $scope.currentPage = 1;
          $scope.loadFinished = true;
        }, 500);
    };
    $scope.$watch('entry.searchIncident', timeoutFilterChange, true);		

    $scope.removeAllFilters = function () {
      delete $scope.entry.searchIncident;
    };

    $scope.removeFilter = function (element) {
      delete $scope.entry.searchIncident[element];
      if (_.size($scope.entry.searchIncident) === 0) {
        delete $scope.entry.searchIncident;
      }
    };
    
    $scope.addAreaFilter = function (f) {
      if (_.size($scope.entry.searchIncident) === 0) {
        $scope.entry.searchIncident = {'AREA': f==='VAS'?'Value Added Services':f};
      }
      else {
        $scope.entry.searchIncident.AREA = f;
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

	  $scope.exportIncidentReport = function () {
	    //console.log("export!");
	    ExportIncidentReportModal().then(function() {

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
	      $state.go('incidentTable', {opcoId: $scope.entry.OPCO_ID, archive: $scope.showArchive});
	    }, 100);           
	  });  
  }
}

angular.module('amxApp')
  .component('incidentTable', {
    templateUrl: 'app/amx/routes/incidentTable/incidentTable.html',
    controller: IncidentTableComponent
  });

})();
