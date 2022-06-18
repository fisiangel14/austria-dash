'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('stakeholderReportTable', {
        url: '/stakeholder-reports?opcoId',
        template: '<stakeholder-report-table></stakeholder-report-table>',
        data: {
              requireLogin: true,
              leftMenu: 'Incidents',
              title: 'Stakeholder reports',
              showOpcoFilter: true
            }        
      });
  });
