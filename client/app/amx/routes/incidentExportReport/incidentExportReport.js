'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('incidentExportReport', {
        url: '/export-incident-report',
        template: '<incident-export-report></incident-export-report>',
				data: {
        			requireLogin: true,
        			title: 'Incidents',
        			leftMenu: 'Incidents',
        			showOpcoFilter: false
      			}        
      });
  });
