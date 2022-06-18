'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('datoNew', {
        url: '/dato-new/:opcoId',
        template: '<dato-new></dato-new>',
				data: {
        			requireLogin: true,
        			title: 'New dato',
        			leftMenu: 'Dato catalogue',
        			showOpcoFilter: false
      			}        
      });
  });
