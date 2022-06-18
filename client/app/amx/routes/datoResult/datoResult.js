'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('datoResult', {
        url: '/dato-result/:opcoId/:datoId?month',
        template: '<dato-result></dato-result>',
				data: {
        			requireLogin: true,
        			title: 'Dato results',
        			leftMenu: 'Dato catalogue',
        			showOpcoFilter: true
      			}        
      });
  });
