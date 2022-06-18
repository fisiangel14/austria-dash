'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('alarmExportReport', {
        url: '/export-alarm-report',
        template: '<alarm-export-report></alarm-export-report>',
				data: {
        			requireLogin: true,
        			title: 'Alarms',
        			leftMenu: 'Alarms',
        			showOpcoFilter: false
      			}          
      });
  });
