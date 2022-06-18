'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('controlResult', {
        url: '/control-results-day?opcoId?processname?runForDate',
        template: '<control-result></control-result>',
				data: {
              requireLogin: true,
              stekoholderContent: true,
        			title: 'Control result',
        			leftMenu: 'Controls',
        			showOpcoFilter: false
      			}
      });
  });
