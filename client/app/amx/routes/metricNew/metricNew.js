'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('metricNew', {
        url: '/metric-new/:opcoId',
        template: '<metric-new></metric-new>',
				data: {
        			requireLogin: true,
        			title: 'New metric',
        			leftMenu: 'Metric catalogue',
        			showOpcoFilter: false
      			}        
      });
  });
