'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('incidentNew', {
        url: '/incident-new?cloneFrom',
        template: '<incident-new></incident-new>',
				data: {
        			requireLogin: true,
        			title: 'New incident',
        			leftMenu: 'Incidents',
        			showOpcoFilter: false
      			}        
      });
  });
