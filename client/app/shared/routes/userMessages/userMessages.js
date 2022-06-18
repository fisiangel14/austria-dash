'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('userMessages', {
        url: '/user-messages',
        template: '<user-messages></user-messages>',
				data: {
        			requireLogin: true,
        			title: 'User messages',
        			showOpcoFilter: false
      			}        
      });
  });
