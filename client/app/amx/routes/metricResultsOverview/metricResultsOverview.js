'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('metricResultsOverview', {
        url: '/metric-results-overview?month?opcoId',
        template: '<metric-results-overview></metric-results-overview>',
				data: {
        			requireLogin: true,
        			title: 'Metric results overview',
        			leftMenu: 'Metric catalogue',
        			showOpcoFilter: true
      			}        
      });
  });
