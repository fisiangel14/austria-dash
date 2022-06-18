'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('datoResultsOverview', {
        url: '/dato-results-overview?month?opcoId',
        template: '<dato-results-overview></dato-results-overview>',
				data: {
        			requireLogin: true,
        			title: 'Dato results overview',
        			leftMenu: 'Dato catalogue',
        			showOpcoFilter: true
      			}        
      });
  });
