'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('metricCompositeResult', {
        url: '/metric-composite-result?opcoId?metricId?billCycle?date',
        template: '<metric-composite-result></metric-composite-result>',
				data: {
        			requireLogin: true,
        			title: 'Metric results',
        			leftMenu: 'Metric results',
        			showOpcoFilter: true
      			}        
      });
  });
