'use strict';
(function(){

class DatoTableComponent {
  constructor($scope, Entry, Dato, $stateParams, $state) {
    $scope.entry = Entry;
    $scope.loadFinished = false;

	  if ($stateParams.opcoId === undefined) {
	    $state.go('datoTable', {opcoId: $scope.entry.OPCO_ID}, {reload: true} );
	  }
	  else if (Number($stateParams.opcoId) !== $scope.entry.OPCO_ID) {
	    $scope.entry.OPCO_ID = Number($stateParams.opcoId);
	  }

    Dato.getAllDatos($stateParams.opcoId).then(function (data) {
      $scope.datos = data;
      $scope.loadFinished = false;
    });

	  $scope.filterChanged = function () {
	  	// remove filters with blank values
		  $scope.entry.searchDato = _.pick($scope.entry.searchDato, function(value, key, object) {
		  	return value !== '' && value !== null;
		  });

      if (_.size($scope.entry.searchDato) === 0) {
        delete $scope.entry.searchDato;
      }		  
	  };
	  
	  $scope.removeAllFilters = function () {
	    delete $scope.entry.searchDato;
	  };

	  $scope.removeFilter = function (element) {
	    delete $scope.entry.searchDato[element];
	    if (_.size($scope.entry.searchDato) === 0) {
	    	delete $scope.entry.searchDato;
	    }
	  };

  	// On OPCO_ID change
	  $scope.$watch('entry.OPCO_ID', function(){
	    setTimeout (function () {
	      $state.go('datoTable', {opcoId: $scope.entry.OPCO_ID});
	    }, 100);           
	  });	  
  }
}

angular.module('amxApp')
  .component('datoTable', {
    templateUrl: 'app/amx/routes/datoTable/datoTable.html',
    controller: DatoTableComponent
  });

})();
