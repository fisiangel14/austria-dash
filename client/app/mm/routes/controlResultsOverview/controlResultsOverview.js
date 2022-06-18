'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('controlResultsOverview', {
        url: '/control-results?opcoId?fromDate?toDate',
        template: '<control-results-overview></control-results-overview>',
				data: {
        			requireLogin: true,
        			title: 'Control results',
        			leftMenu: 'Controls',
        			showOpcoFilter: true
      			}
      });
  });
