'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('incidentInfo', {
        url: '/incident-info/:incidentId',
        template: '<incident-info></incident-info>',
				data: {
              requireLogin: true,
              stekoholderContent: true,
        			title: 'Incident info',
        			leftMenu: 'Incidents',
        			showOpcoFilter: false
      			}        
      });
  });
