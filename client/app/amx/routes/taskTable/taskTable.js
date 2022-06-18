'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('taskTable', {
        url: '/tasks?opcoId&amp;archive',
        template: '<task-table></task-table>',
				data: {
        			requireLogin: true,
        			title: 'Tasks',
        			leftMenu: 'Tasks',
        			showOpcoFilter: true
      			}        
      });
  });
