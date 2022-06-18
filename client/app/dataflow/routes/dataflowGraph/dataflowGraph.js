'use strict';

angular.module('amxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('dataflowGraph', {
        url: '/dataflow-graph?procedureId?datasourceId',
        template: '<dataflow-graph></dataflow-graph>',
        data: {
              requireLogin: true,
              stekoholderContent: true,
              leftMenu: 'Dataflow',
              title: 'Dataflow graph',
              showOpcoFilter: false
            }        
      });
  });
