'use strict';

angular.module('amxApp')
  .factory('LinkIncidentModal', function ($rootScope, $uibModal) {
    // Service logic
    // ...
    function linkIncidentModalCtrl ($scope, $timeout, Incident, Entry, $filter, $uibModalInstance) {

      
      $scope.entry = Entry;
      $scope.loadFinished = false;
      $scope._und = _;
      
      $scope.modalCancel = function () {
        $uibModalInstance.dismiss('User cancel');
      };

      $scope.modalSubmit = function () {
        $uibModalInstance.close($scope.form);
      };

      $scope.selectIncident = function (incident) {
        $uibModalInstance.close(incident);
      };

      $scope.incidents = [];
  
      Incident.getIncidents($scope.entry.OPCO_ID).then(function (data) {
        $scope.incidents = data;
        $scope.filteredIncidents = $filter('filter') ($scope.incidents, $scope.entry.searchIncident);
        $scope.loadFinished = true;
  
        // Pagination in controller
        $scope.pageSize = 6;
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
            $scope.filteredIncidents = $filter('filter') ($scope.incidents, $scope.entry.searchIncident);
            $scope.currentPage = 1;
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
    
  
      $scope.Lpad = function (str, length, padString) {
        str = str.toString();
        while (str.length < length) {
          str = padString + str;
        }
        return str;
      };  

    }

    return function() {
      var instance = $uibModal.open({
        templateUrl: 'app/amx/providers/LinkIncidentModal/link-incident-modal.html',
        controller: linkIncidentModalCtrl,
        size: 'lg',
      });
      return instance.result.then(function (data){return data;});
    };
  });
