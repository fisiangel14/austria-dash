'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('metricResult', {
        url: '/metric-result/:opcoId/:metricId?month',
        template: '<metric-result></metric-result>',
				data: {
        			requireLogin: true,
        			title: 'Metric results',
        			leftMenu: 'Metric catalogue',
        			showOpcoFilter: true
      			}        
      });
  });
