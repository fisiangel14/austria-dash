'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('overview', {
        url: '/',
        template: '<overview></overview>',
        data: {
    			requireLogin: false,
    			title: 'Overview',
    			showOpcoFilter: true
  			}    
      });
  });
