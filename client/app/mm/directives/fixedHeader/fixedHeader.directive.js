'use strict';

angular.module('amxApp')
  .directive('fixedHeader', ['$timeout', function ($timeout) {
    return {
      restrict: 'EA',
      link: function (scope, element, attrs) {
      	var mainDiv = angular.element(document.getElementById('main-div'));
      	var fixed = false;
      	var timerScroll = false;

      	mainDiv.bind('wheel', function() {

      		if (timerScroll) {
	      		$timeout.cancel(timerScroll);
	    		}

      		timerScroll = $timeout(function(){
						var parentOffset = element.parent().offset();
						var i, fixedHeaderElements, referenceElements, fixedHeaderElement, referenceElementWidth;

						element.css('top', 50);
						element.css('left', Number(parentOffset.left));

						if (parentOffset.top <= 0 && !fixed) {
							fixedHeaderElements = element.children(); 
							referenceElements = angular.element(document.getElementById('reference-row')).children();

							for (i=0; i<fixedHeaderElements.length; i++) {
								referenceElementWidth = Number(referenceElements[i].clientWidth);
								fixedHeaderElement = angular.element(fixedHeaderElements[i]);
								fixedHeaderElement.css('min-width', referenceElementWidth);
								fixedHeaderElement.css('max-width', referenceElementWidth);
							}
							
							element.css('position', 'fixed');
							element.css('display', 'block');
							fixed = true;
						}
						
						if (parentOffset.top > 0 && fixed) {
							element.css('display', 'none');
							element.css('position', 'static');
							fixed = false;
						}
      		}, 100);

				});

      }
    };
  }]);
