'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('metricResultTable', {
        url: '/metric-result-table?opcoId?month?frequency?finetuned',
        template: '<metric-result-table></metric-result-table>',
				data: {
        			requireLogin: true,
        			title: 'Metric results',
        			leftMenu: 'Metric catalogue',
        			showOpcoFilter: true
      			}        
      });
  });
