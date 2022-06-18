'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('datoTable', {
        url: '/dato-catalogue?opcoId',
        template: '<dato-table></dato-table>',
				data: {
        			requireLogin: true,
        			title: 'Dato catalogue',
        			leftMenu: 'Dato catalogue',
        			showOpcoFilter: true
      			}        
      });
  });
