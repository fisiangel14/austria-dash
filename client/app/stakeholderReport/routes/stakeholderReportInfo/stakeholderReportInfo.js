'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('stakeholderReportInfo', {
        url: '/stakeholder-report-info?reportId',
        template: '<stakeholder-report-info></stakeholder-report-info>',
        data: {
              requireLogin: true,
              leftMenu: 'Incidents',
              title: 'Stakeholder report',
              showOpcoFilter: false
            }         
      });
  });
