'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('changeRequests', {
        url: '/change-requests?opcoId&amp;archive',
        template: '<change-requests></change-requests>',
				data: {
        			requireLogin: true,
        			title: 'Change requests',
        			leftMenu: 'Change requests',
        			showOpcoFilter: true
      			}        
      });
  });
