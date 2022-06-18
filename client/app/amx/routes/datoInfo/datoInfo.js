'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('datoInfo', {
        url: '/dato-info/:opcoId/:datoId',
        template: '<dato-info></dato-info>',
				data: {
        			requireLogin: true,
        			title: 'Dato info',
        			leftMenu: 'Dato catalogue',
        			showOpcoFilter: true
      			}        
      });
  });
