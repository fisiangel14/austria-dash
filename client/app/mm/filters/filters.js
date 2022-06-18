'use strict';

angular.module('amxApp').filter('controlTableResultsFilter', function () {
		
		// count alarms for each control for all days
		var isAlarm = function (item) {

			for(var i=0; i<item.length; i++) {
				if (item[i].KPI_ALARM_LEVEL > 0) {
					return true;
				}
			}
			return false;
		};

		return function (items, inFilter) {
				var filtered = [];
				_.forEach(items, function(item) {
					if (typeof inFilter.text === 'undefined' || item[0].PROCESSNAME.toLowerCase().indexOf(inFilter.text.toLowerCase()) !== -1) {
						
						if (!inFilter.alarmsOnly)  {
							filtered.push(item);							
						}
						else if (inFilter.alarmsOnly && (isAlarm(item) || (item.KPI_COUNT == 0 && inFilter.noKPIisAlarm))) {
							filtered.push(item);							
						}
					}
				}); 
				return filtered;
		};
});

angular.module('amxApp').filter('controlMonitorResultsFilter', function () {
		
		return function (items, inFilter) {

				var filtered = [];
				_.forEach(items, function(item) {
					if (typeof inFilter.text === 'undefined' || item.PROCESSNAME.toLowerCase().indexOf(inFilter.text.toLowerCase()) !== -1) {	
						if (!inFilter.alarmsOnly)  {
							filtered.push(item);							
						}
						else if (inFilter.alarmsOnly && Number(item.KPI_ALARM_LEVEL)>0 ) {
							filtered.push(item);							
						}
					}

				}); 
				return filtered;
		};

});

angular.module('amxApp').filter('controlRunHistoryResultsFilter', function () {
		
		return function (items, inFilter) {
				var filtered = [];
        
				_.forEach(items, function(item) {
          
          if (inFilter.showControlWithoutExecution && item.PROCESSID === null)  {
            filtered.push(item);
          }
          else if (item.PROCESSID !== null) {
              if (inFilter.controlFrequency == 'W' || inFilter.controlFrequency == 'M'){
                if (item.RECORDSFETCHED_A || item.RECORDSFETCHED_B) {
                  filtered.push(item);
                }
              }
              else {
                filtered.push(item);
              }
						}

				}); 
				return filtered;
		};
});