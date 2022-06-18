'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('stakeholderReportPublic', {
        url: '/public-report/:key',
        template: '<stakeholder-report-public></stakeholder-report-public>',
        data: {
          requireLogin: false,
          title: 'Report',
          showOpcoFilter: false
        }  
      });
  });
