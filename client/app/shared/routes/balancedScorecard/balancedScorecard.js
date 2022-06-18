'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('balancedScorecard', {
      url: '/balanced-scorecard?year?opcoId?fromDate?toDate',
      template: '<balanced-scorecard></balanced-scorecard>',
			data: {
					requireLogin: true,
					title: 'Balanced scorecard',
					leftMenu: 'Balanced scorecard',
					showOpcoFilter: true
				}       
      });
  });
