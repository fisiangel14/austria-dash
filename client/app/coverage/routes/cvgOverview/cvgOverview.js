'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('cvgOverview', {
        url: '/coverage-overview?opcoId?month',
        template: '<cvg-overview></cvg-overview>',
        data: {
              requireLogin: true,
              leftMenu: 'Coverage',
              title: 'Risk coverage overview',
              showOpcoFilter: true
            }            
      });
  });
