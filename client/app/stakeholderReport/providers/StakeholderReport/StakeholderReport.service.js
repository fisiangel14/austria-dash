'use strict';

function StakeholderReportService($http, $q, Entry, $rootScope, $uibModal, $timeout) {
  // Service logic
  // ...
  return {
    getStakeholderReports: function(opcoId){
      return $http({
        url: '/api/stakeholder-reports', 
        method: 'GET',
        params: {opcoId: opcoId}
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
      });
    },
    getStakeholderReport: function(reportId){
      return $http({
        url: '/api/stakeholder-reports/'+reportId, 
        method: 'GET'
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
      });
    },
    getStakeholderReportLinkedControls: function(reportId){
      return $http({
        url: '/api/stakeholder-reports/linked-controls', 
        method: 'GET',
        params: {reportId : reportId}
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
      });
    },
    deleteStakeholderReport: function(reportId){
      return $http({
        url: '/api/stakeholder-reports/' + reportId, 
        method: 'DELETE',
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
      });
    },
    postStakeholderReport: function(data){
      return $http({
        url: '/api/stakeholder-reports/', 
        method: 'POST',
        data: data
      })
      .then(function(response) {
        return response.data;
      }, function(response) {
        return $q.reject(response.data);
      });
    }, 
    unlinkControls: function(reportId, selectedControls){
      return $http({
        url: 'api/stakeholder-reports/unlink-controls',
        method: 'POST',
        data: selectedControls,
        params: { reportId: reportId }
      })
        .then(function (response) {
          return response.data;
        }, function (response) {
          return $q.reject(response.data);
        });
    },
    linkControl: (function () {

      function linkControlCtrl($scope, $uibModalInstance, init, $filter) {

        $scope.entry = Entry;
        $scope.controls = [];
        $scope.loadFinished = false;

        $http({
          url: 'api/stakeholder-reports/controls',
          method: 'GET',
          params: {reportId: init.STAKEHOLDER_REPORT_ID}
        }).then(function (response) {
          var data = response.data;

          $scope.controls = data;
          $scope.filteredControls = $filter('filter')($scope.controls, $scope.entry.searchControl);
          $scope.loadFinished = true;

          // Pagination in controller
          $scope.pageSize = 5;
          $scope.currentPage = 1;

        }, function (err) {
          console.log(err);
        });

        $scope.setCurrentPage = function (currentPage) {
          $scope.currentPage = currentPage;
        };

        // Watch filter change
        var timeoutControlFilterChange = function (newValue, oldValue) {
          // remove filters with blank values
          $scope.entry.searchControl = _.pick($scope.entry.searchControl, function (value, key, object) {
            return value !== '' && value !== null;
          });

          if (_.size($scope.entry.searchControl) === 0) {
            delete $scope.entry.searchControl;
          }

          $timeout(function () {
            $scope.filteredControls = $filter('filter')($scope.controls, $scope.entry.searchControl);
            $scope.currentPage = 1;
          }, 400);
        };
        $scope.$watch('entry.searchControl', timeoutControlFilterChange, true);

        $scope.removeAllFilters = function () {
          delete $scope.entry.searchControl;
        };

        $scope.removeFilter = function (element) {
          delete $scope.entry.searchControl[element];
          if (_.size($scope.entry.searchControl) === 0) {
            delete $scope.entry.searchControl;
          }
        };

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };

        $scope.modalCancel = function () {
          $uibModalInstance.dismiss('User cancel');
        };

        $scope.selectControl = function (control) {
          $uibModalInstance.close(control);
        };

        $scope.selectAll = function () {
          $scope.controls.forEach(function (m) { m.SELECTED = 'Y'; });
          $scope.updateSelected();
        };
  
        $scope.updateSelected = function () {
          $scope.selectedControls = _.filter($scope.controls, function (elem) { return elem.SELECTED == 'Y'; });
        };
  
        $scope.submit = function () {
  
          $scope.selectedControls = _.filter($scope.controls, function (elem) { return elem.SELECTED == 'Y'; });

          $http({
            url: 'api/stakeholder-reports/link-controls',
            method: 'POST',
            data: $scope.selectedControls,
            params: { reportId: init.STAKEHOLDER_REPORT_ID }
          })
          .then(function (response) {
            if (response.data.success) {
              Entry.showToast($scope.selectedControls.length + ' controls linked to this report. All changes saved!');
              $uibModalInstance.close($scope.selectedControls);
            }
            else {
              Entry.showToast('Error ' + response.data.error.code);
            }
          }, function (response) {
            return $q.reject(response.data);
          });

        };
      }

      return function (init) {
        var instance = $uibModal.open({
          templateUrl: 'app/stakeholderReport/providers/StakeholderReport/link-control-to-stakeholder-report.html',
          controller: linkControlCtrl,
          size: 'lg',
          resolve: {
            init: function () { return init; }
          },
        });
        return instance.result.then(function (data) {
          data.forEach(function (m) { m.SELECTED = 'N'; });
          return data;
        });
      };
    })(),
    getToken: function (data) {
      return $http({
        url: '/api/stakeholder-reports/token',
        method: 'POST',
        data: data
      })
        .then(function (response) {
          return response.data;
        }, function (response) {
          return $q.reject(response.data);
        });
    },    
    verifyToken: function (key) {
      return $http({
        url: '/api/stakeholder-reports/verify-token/' + key,
        method: 'GET'      
      })
        .then(function (response) {
          return response.data;
        }, function (response) {
          return $q.reject(response.data);
        });
    },    
    getPublicReport: function (key) {
      return $http({
        url: '/api/stakeholder-reports/public-report',
        method: 'GET',
        headers: {
          'Authorization': key
        },        
      })
        .then(function (response) {
          return response.data;
        }, function (response) {
          return $q.reject(response.data);
        });
    },    
  };
}

angular.module('amxApp')
  .factory('StakeholderReport', StakeholderReportService);