'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('datoFileTable', {
        url: '/dato-file?month',
        template: '<dato-file-table></dato-file-table>',
				data: {
        			requireLogin: true,
        			title: 'Dato files',
        			leftMenu: 'Dato catalogue',
        			showOpcoFilter: true
      			}        
      });
  });
