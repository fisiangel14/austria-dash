'use strict';

(function(){

class InterfaceInfoComponent {
  constructor($scope, Entry, $http, $state, $stateParams, $timeout, $filter, ConfirmModal, Lookup) {
    $scope.entry = Entry;
    $scope.isDisabled = $scope.entry.isDisabled();
  	$scope.interface = {};
		$scope.localEntry = { 'lookup': {} };
    $scope.entry.searchDatasource = {};

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

	  if ($stateParams.interfaceId === undefined) {
	    $state.go('interfaceTable', {opcoId: $scope.entry.OPCO_ID}, {reload: true});
	  }
	  else if ($stateParams.interfaceId === 'new') {
	  	$scope.interface.OPCO_ID = $scope.entry.currentUser.userOpcoId; 	  	
	  	$scope.interface.INTERFACE_TYPE = 'D';
	  }  
	  else {  	
			$http({
				method: 'GET',
				url: '/api/dfl-datasources/getInterface',
				params: {interfaceId: $stateParams.interfaceId}
			}).then(function (response) {
				$scope.interface = response.data;
				// If interface is from another OPCO, switch selected opco and disable editing
				if (Number($scope.interface.OPCO_ID) !== $scope.entry.currentUser.userOpcoId) {
					$scope.entry.OPCO_ID = Number($scope.interface.OPCO_ID);
					$scope.isDisabled = $scope.entry.isDisabled();
				}				
			}, function (err) {
				// handle error
				console.log(err);
			});
	  }

		$scope.save = function() {
			if (!$scope.datoForm.$valid) {
	       Entry.showToast('Please enter all required fields!');
			}
			else {
				$http({
					method: 'POST',
					url: '/api/dfl-datasources/saveInterface',
					data: $scope.interface
				}).then(function (response) {
					if (response.data.success) {	
						Entry.showToast('All changes saved!');
						$state.go('interfaceTable', {opcoId: $scope.interface.OPCO_ID});
					}
					else {
							if (response.data.error.code === 'ER_DUP_ENTRY') {
								Entry.showToast('Save failed!  Interface with the same name already exists');
							}
							else {
								Entry.showToast('Save failed! Error ' + JSON.stringify(response.data.error));
							}
					}

				}, function (err) {
					console.log(err);
				});		
			}
		};

		$scope.cancel = function() {
			$state.go('interfaceTable', {opcoId: $scope.interface.OPCO_ID});			
		};

		$scope.clone = function(){
			$scope.interface.INTERFACE_NAME = $scope.interface.INTERFACE_NAME + '_Clone';
			delete $scope.interface.INTERFACE_ID;
		};

		$scope.delete = function() {

      ConfirmModal('Are you sure you want to delete interface "' + $scope.interface.INTERFACE_NAME + '" ?')
      .then(function(confirmResult) {
        if (confirmResult) {
					$http({
						method: 'DELETE',
						url: '/api/dfl-datasources/deleteInterface',
						params: {interfaceId: $stateParams.interfaceId}
					}).then(function (response) {
						if (response.data.success) {	
							Entry.showToast('Interface deleted');
							$state.go('interfaceTable', {opcoId: $scope.interface.OPCO_ID});			
						}
						else {
							Entry.showToast('Delete failed! Error ' + JSON.stringify(response.data.error));
						}				
					}, function (err) {
						// handle error
						console.log(err);
					});
				}
      })
      .catch(function(err) {
            Entry.showToast('Delete action canceled');
      });   

		};

	    //Datepickers
	    $scope.dp = {};
	    $scope.dp.status = {opened: false};

	    $scope.dp.open = function($event) {
	      $scope.dp.status.opened = true;
	    };

	    $scope.dp.dateOptions = {
	      formatYear: 'yyyy',
	      startingDay: 1
	    };
	    
	    $scope.dp1 = {};
	    $scope.dp1.status = {opened: false};

	    $scope.dp1.open = function($event) {
	      $scope.dp1.status.opened = true;
	    };

	    $scope.dp1.dateOptions = {
	      formatYear: 'yyyy',
	      startingDay: 1
	    };
	    //Datepickers 

      // Datasources
      
      $http({
        method: 'GET',
        url: '/api/dfl-datasources/getInterfaceDatasources',
        params: {opcoId: $stateParams.opcoId, interfaceId: $stateParams.interfaceId}
      }).then(function (response) {
  
        $scope.datasources = response.data;
        $scope.filteredDatasources = $filter('filter') ($scope.datasources, $scope.entry.searchDatasource);
  
        // Pagination in controller
        $scope.pageSize = 25;
        $scope.currentPage = 1;
        $scope.setCurrentPage = function(currentPage) {
            $scope.currentPage = currentPage;
        };
        // Pagination in controller
  
        $scope.loadFinished = true;
  
      }, function (err) {
  
      });

      $scope.datasourceInfo = function (datasourceId) {
        $state.go('datasourceInfo', {datasourceId: datasourceId} );
      };
      
      // Watch filter change
      var timer = false;
      var timeoutFilterChange = function(newValue, oldValue){

          // remove filters with blank values
          $scope.entry.searchDatasource = _.pick($scope.entry.searchDatasource, function(value, key, object) {
            return value !== '' && value !== null;
          });

          if (_.size($scope.entry.searchDatasource) === 0) {
            delete $scope.entry.searchDatasource;
          }  
        
          if(timer){
            $timeout.cancel(timer);
          }
          timer = $timeout(function(){ 

            $scope.filteredDatasources = $filter('filter') ($scope.datasources, $scope.entry.searchDatasource);

            // Pagination in controller
            $scope.currentPage = 1;
            $scope.setCurrentPage = function(currentPage) {
                $scope.currentPage = currentPage;
            };
            // Pagination in controller

          }, 400);
      };
      $scope.$watch('entry.searchDatasource', timeoutFilterChange, true);		

    $scope.removeAllFilters = function () {
      delete $scope.entry.searchDatasource;
    };

    $scope.removeFilter = function (element) {
      delete $scope.entry.searchDatasource[element];
      if (_.size($scope.entry.searchDatasource) === 0) {
        delete $scope.entry.searchDatasource;
      }
    };      
      // Datasources

  }
}

angular.module('amxApp')
  .component('interfaceInfo', {
    templateUrl: 'app/dataflow/routes/interfaceInfo/interfaceInfo.html',
    controller: InterfaceInfoComponent,
    controllerAs: 'interfaceInfoCtrl'
  });

})();
