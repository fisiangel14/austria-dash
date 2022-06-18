'use strict';

angular.module('amxApp')
  .directive('infiniteScroll', ['$timeout', function ($timeout) {
    return {
      scope: {
        infiniteScroll: '&',
        infiniteScrollDistanceFromBottom: '='
      },
      restrict: 'EA',
      link: function (scope, element, attrs) {
        var mainDiv = angular.element(document.getElementById('main-div'));
        var timerScroll = false;
        mainDiv.bind('wheel mouseover', function () {
      		if (timerScroll) {
	      		$timeout.cancel(timerScroll);
          }
          timerScroll = $timeout(function() {
            var distance = element.height() + element.offset().top;
            var limit = scope.infiniteScrollDistanceFromBottom?scope.infiniteScrollDistanceFromBottom:1000;
  
            if ( distance < limit) {
              scope.infiniteScroll();
            }
          }, 50);
        });
      }
    };
  }]);
