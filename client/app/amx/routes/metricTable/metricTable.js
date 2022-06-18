'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('metricTable', {
        url: '/metric-catalogue?opcoId',
        template: '<metric-table></metric-table>',
				data: {
        			requireLogin: true,
        			title: 'Metrics',
        			leftMenu: 'Metric catalogue',
        			showOpcoFilter: true
      			}        
      });
  });
