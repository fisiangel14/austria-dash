'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('metricInfo', {
        url: '/metric-info/:opcoId/:metricId',
        template: '<metric-info></metric-info>',
				data: {
        			requireLogin: true,
        			title: 'Metric info',
        			leftMenu: 'Metric catalogue',
        			showOpcoFilter: true
      			}        
      });
  });
