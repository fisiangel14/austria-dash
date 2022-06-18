'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('controlRunhistory', {
        url: '/control-runhistory?opcoId?processname?toDate',
        template: '<control-runhistory></control-runhistory>',
				data: {
        			requireLogin: true,
        			stekoholderContent: true,
        			title: 'Control runhistory',
        			leftMenu: 'Controls',
        			showOpcoFilter: false
      			}
      });
  });
