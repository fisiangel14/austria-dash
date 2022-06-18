'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('controlMonitor', {
        url: '/control-monitor?opcoId?fromDate?toDate',
        template: '<control-monitor></control-monitor>',
				data: {
        			requireLogin: true,
        			title: 'Control monitor',
        			leftMenu: 'Controls',
        			showOpcoFilter: true
      			}
      });
  });
