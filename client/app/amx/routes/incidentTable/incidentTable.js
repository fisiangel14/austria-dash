'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('incidentTable', {
        url: '/incidents?opcoId&amp;archive',
        template: '<incident-table></incident-table>',
				data: {
        			requireLogin: true,
        			title: 'Incidents',
        			leftMenu: 'Incidents',
        			showOpcoFilter: true
      			}        
      });
  });
