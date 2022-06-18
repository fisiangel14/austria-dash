'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('harvestSummary', {
        url: '/harvest-summary?year?opcoId',
        template: '<harvest-summary></harvest-summary>',
		data: {
				requireLogin: true,
				title: 'Incidents summary',
				leftMenu: 'Incidents',
				showOpcoFilter: true
			}           
      });
  });
