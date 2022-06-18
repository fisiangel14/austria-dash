'use strict';

function TaskService($rootScope, Entry, $http, $q, $uibModal, $timeout) {
  // Service logic
  // ...
  return {
    getAllTasks: function(opcoId){
      return $http({
        url: '/api/tasks/getAllTasks', 
        method: 'GET',
        params: {opcoId : opcoId}
      })
      .then(function(response) {
          for (var i=0; i<response.data.length; i++) {
            response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
            response.data[i].MODIFIED = moment(response.data[i].MODIFIED).toDate(); 
            response.data[i].STATUS_DATE = moment(response.data[i].STATUS_DATE).toDate(); 
          }
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },
    getObjectTasks: function(opcoId, objectId){
      return $http({
        url: '/api/tasks/getObjectTasks', 
        method: 'GET',
        params: {opcoId : opcoId, objectId: objectId}
      })
      .then(function(response) {
          for (var i=0; i<response.data.length; i++) {
            response.data[i].CREATED = moment(response.data[i].CREATED).toDate(); 
            response.data[i].MODIFIED = moment(response.data[i].MODIFIED).toDate(); 
            response.data[i].STATUS_DATE = moment(response.data[i].STATUS_DATE).toDate(); 
          }
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },
    getTaskInfo: function(taskId){
      return $http({
        url: '/api/tasks/getTaskInfo', 
        method: 'GET',
        params: {taskId: taskId}
      })
      .then(function(response) {
          response.data.CREATED = moment(response.data.CREATED).toDate();           
          response.data.MODIFIED = moment(response.data.MODIFIED).toDate(); 
          response.data.STATUS_DATE = moment(response.data.STATUS_DATE).toDate();
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },  
    postTask: function(task){
      return $http({
        url: '/api/tasks/postTask', 
        method: 'POST',
        data: task
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },  
    assignTask: function(task){
      return $http({
        url: '/api/tasks/assignTask', 
        method: 'POST',
        data: task
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },
    changeTaskStatus: function(task){
      return $http({
        url: '/api/tasks/changeTaskStatus', 
        method: 'POST',
        data: task
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });
    },
    deleteTask: function (taskId) {
      return $http({
        url: '/api/tasks', 
        method: 'DELETE',
        params: {id: taskId}
      })
      .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(response.data);
        });     
    },
    newTask: (function () {

        function newTaskModalCtrl($scope, $uibModalInstance, init) {

          $scope.entry = Entry;
          $scope.task = {};
          $scope.users = [];
          $scope.objectIds = [];
          
          $scope.task.OPCO_ID = init.OPCO_ID.toString();
          $scope.task.SOURCE = init.SOURCE;
          $scope.task.OBJECT_ID = init.OBJECT_ID;
          $scope.task.DEPENDENCIES = init.DEPENDENCIES;
          $scope.task.STATUS = 'Open - OPCO';
          $scope.task.STATUS_BY = $scope.entry.currentUser.userName;
          $scope.task.CREATED = moment().toDate();
          $scope.task.CREATED_BY = $scope.entry.currentUser.userName;

            // Get metrics
            $http({
              url: '/api/tasks/getMetrics', 
              method: 'GET',
              params: {opcoId: $scope.task.OPCO_ID}
            }).then(function (response) {
              $scope.objectIds = response.data;
            }, function (err) {
              console.log(err);
            });    

            // Get users - ASSIGN_TO
            $http({
              url: '/api/tasks/getUsers', 
              method: 'GET',
              params: {opcoId: $scope.task.OPCO_ID}
            }).then(function (response) {
              $scope.users = response.data;
            }, function (err) {
              console.log(err);
            });    

                // Set watchers
                var timer = false;
                var timeoutOpcoChange = function(newValue, oldValue){
                  if (newValue != oldValue) {
                    if(timer){
                      $timeout.cancel(timer);
                    }
                    timer = $timeout(function(){ 

                      $http({
                        url: '/api/tasks/getUsers', 
                        method: 'GET',
                        params: {opcoId: $scope.task.OPCO_ID}
                      }).then(function (response) {
                        console.log(response.data);
                        $scope.users = response.data;
                      }, function (err) {
                        console.log(err);
                      });    

                    }, 500);
                  }
                };

                var timeoutObjectChange = function(newValue, oldValue){
                  if (newValue !== oldValue && newValue !== $scope.task.OPCO_ID) {
                    if(timer){
                      $timeout.cancel(timer);
                    }
                    timer = $timeout(function(){ 

                      $http({
                        url: '/api/tasks/getDependencies', 
                        method: 'GET',
                        params: {
                                  opcoId: $scope.task.OPCO_ID, 
                                  source: $scope.task.SOURCE,  
                                  objectId: $scope.task.OBJECT_ID
                                }
                      }).then(function (response) {
                        $scope.task.DEPENDENCIES = response.data.DEPENDENCIES;
                      }, function (err) {
                        console.log(err);
                      });    

                    }, 500);
                  }
                };

                $scope.$watch('task.OPCO_ID', timeoutOpcoChange);
                $scope.$watch('task.OBJECT_ID', timeoutObjectChange);        

          
          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };

          $scope.submit = function () {

            $scope.task.MODIFIED_BY = $scope.entry.currentUser.userName;
            $scope.task.MODIFIED = moment().toDate();

            $http({
              url: '/api/tasks/postTask', 
              method: 'POST',
              data: $scope.task
            })
            .then(function(response) {
              if (response.data.success) {
                $scope.task.TASK_ID = response.data.taskId;
                Entry.showToast('Task "' + 'T_'+ $scope.task.OPCO_ID + '_' + $scope.Lpad($scope.task.TASK_ID, 3, '0') + '" created');
                $uibModalInstance.close($scope.task);
              }
              else {
                Entry.showToast('Error ' + response.data.error.code);
              }                
            }, function(response) {
                return $q.reject(response.data);
            });

          };

          $scope.Lpad = function (str, length, padString) {
            str = str.toString();
            while (str.length < length) {
              str = padString + str;
            }
            return str;
          };

        }

        return function(init) {
          var instance = $uibModal.open({
            templateUrl: 'app/amx/providers/Task/task-new-modal.html',
            controller: newTaskModalCtrl,
            size: 'md',
            resolve: {
                init : function() {return init;}
            },             
          });
          return instance.result.then(function (data){return data;});
        };

      })(),
    taskInfo: (function () {

        function taskEditModalCtrl($scope, $uibModalInstance, taskId) {

          $scope.entry = Entry;
          $scope.taskId = taskId;
          $scope.task = {};
          $scope.users = [];
          $scope.objectIds = [];
          
          $http({
            url: '/api/tasks/getTaskInfo', 
            method: 'GET',
            params: {taskId: taskId}
          }).then(function (response) {
            response.data.OPCO_ID = response.data.OPCO_ID.toString();
            response.data.CREATED = moment(response.data.CREATED).toDate();           
            response.data.MODIFIED = moment(response.data.MODIFIED).toDate(); 
            response.data.STATUS_DATE = moment(response.data.STATUS_DATE).toDate();
            $scope.task = response.data;

            // Get metrics
            $http({
              url: '/api/tasks/getMetrics', 
              method: 'GET',
              params: {opcoId: $scope.task.OPCO_ID}
            }).then(function (response) {
              $scope.objectIds = response.data;
            }, function (err) {
              console.log(err);
            });    

            // Get users - ASSIGN_TO
            $http({
              url: '/api/tasks/getUsers', 
              method: 'GET',
              params: {opcoId: $scope.task.OPCO_ID}
            }).then(function (response) {
              $scope.users = response.data;
            }, function (err) {
              console.log(err);
            });    

                // Set watchers
                var timer = false;
                var timeoutOpcoChange = function(newValue, oldValue){
                  if (newValue != oldValue) {
                    if(timer){
                      $timeout.cancel(timer);
                    }
                    timer = $timeout(function(){ 

                      $http({
                        url: '/api/tasks/getUsers', 
                        method: 'GET',
                        params: {opcoId: $scope.task.OPCO_ID}
                      }).then(function (response) {
                        console.log(response.data);
                        $scope.users = response.data;
                      }, function (err) {
                        console.log(err);
                      });    

                    }, 500);
                  }
                };

                var timeoutObjectChange = function(newValue, oldValue){
                  if (newValue !== oldValue && newValue !== $scope.task.OPCO_ID) {
                    if(timer){
                      $timeout.cancel(timer);
                    }
                    timer = $timeout(function(){ 

                      $http({
                        url: '/api/tasks/getDependencies', 
                        method: 'GET',
                        params: {
                                  opcoId: $scope.task.OPCO_ID, 
                                  source: $scope.task.SOURCE,  
                                  objectId: $scope.task.OBJECT_ID
                                }
                      }).then(function (response) {
                        $scope.task.DEPENDENCIES = response.data.DEPENDENCIES;
                      }, function (err) {
                        console.log(err);
                      });    

                    }, 500);
                  }
                };

                $scope.$watch('task.OPCO_ID', timeoutOpcoChange);
                $scope.$watch('task.OBJECT_ID', timeoutObjectChange);                

          }, function (err) {

          });          

          
          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };

          $scope.submit = function () {

            $scope.task.MODIFIED_BY = $scope.entry.currentUser.userName;
            $scope.task.MODIFIED = moment().toDate();

            $http({
              url: '/api/tasks/postTask', 
              method: 'POST',
              data: $scope.task
            })
            .then(function(response) {
              if (response.data.success) {
                Entry.showToast('Task saved');
                $uibModalInstance.close($scope.task);
              }
              else {
                Entry.showToast('Error ' + response.data.error.code);
              }                
            }, function(response) {
                return $q.reject(response.data);
            });

          };

          $scope.Lpad = function (str, length, padString) {
            str = str.toString();
            while (str.length < length) {
              str = padString + str;
            }
            return str;
          };

        }

        return function(taskId) {
          var instance = $uibModal.open({
            templateUrl: 'app/amx/providers/Task/task-edit-modal.html',
            controller: taskEditModalCtrl,
            size: 'md',
            resolve: {
                taskId : function() {return taskId;}
            },            
          });
          return instance.result.then(function (data){return data;});
        };

      })()    
  }; 

}


angular.module('amxApp')
  .factory('Task', TaskService);
