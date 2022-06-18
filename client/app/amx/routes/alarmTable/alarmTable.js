'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('alarmTable', {
        url: '/alarms?opcoId&month&filterText',
        template: '<alarm-table></alarm-table>',
				data: {
        			requireLogin: true,
        			leftMenu: 'Alarms',
        			title: 'Alarms',
        			showOpcoFilter: true
      			}        
      });
  });
