'use strict';

(function(){

class AlarmExportReportComponent {
  constructor($scope, Incident, Alarm, Entry) {
	  $scope.entry = Entry;
	  $scope.q = {};

	  $scope.q.FROM = moment().subtract(1, 'months').startOf('month').toDate();
	  $scope.q.TO = moment().subtract(1, 'months').endOf('month').toDate();
	  $scope.q.INCLUDE_OPEN = '%';

    $scope.alarmFile = [];
    $scope.alarmFile.lines = null;
    $scope.alarmFile.header = null;
    $scope.alarmFile.date = moment().format('YYYYMMDD_HHmmss');

	  // Return value color RGB
	  $scope.getColor = function (impactType) {
	    //console.log(impactType);
	    if (impactType == 'No loss' || impactType == 'Unknown') {return 'black';}
	    else if (impactType.indexOf('prevented') != -1) {return 'blue';}
	    else if (impactType.indexOf('recovered') != -1 || impactType.indexOf('corrected') != -1) {return 'green';}
	    else {return 'red';}
	  };

	  //Datepicker OPEN_DATE
	  $scope.dp1 = {};
	  $scope.dp1.status = {opened: false};

	  $scope.dp1.open = function($event) {
	    $scope.dp1.status.opened = true;
	  };

	  $scope.dp1.dateOptions = {
	    formatYear: 'yyyy',
	    startingDay: 1
	  };

	  //Datepicker CLOSING_DATE
	  $scope.dp3 = {};
	  $scope.dp3.status = {opened: false};

	  $scope.dp3.open = function($event) {
	    $scope.dp3.status.opened = true;
	  };

	  $scope.dp3.dateOptions = {
	    formatYear: 'yyyy',
	    startingDay: 1
	  };

	  $scope.fromDateChanged = function() {
	    // $scope.q.FROM = moment($scope.q.FROM).startOf('month').toDate();
	    // $scope.q.TO = moment($scope.q.FROM).endOf('month').toDate();
	    $scope.getCsvObject();
	  };

	  $scope.getCsvObject = function () {

	    Alarm.getAlarms($scope.entry.OPCO_ID, moment($scope.q.FROM).format('YYYY-MM-DD'), moment($scope.q.TO).format('YYYY-MM-DD')).then(function(data) {
        for (var i=0; i<data.length; i++) {
          data[i].MODIFIED = moment(data[i].MODIFIED).format('YYYY-MM-DD'); 
          data[i].CREATED = moment(data[i].CREATED).format('YYYY-MM-DD'); 
          data[i].OBJECT_DATE = moment(data[i].OBJECT_DATE).format('YYYY-MM-DD'); 
        }

	      if (data.length > 0) {
	      	$scope.alarmFile.header = Object.keys(data[0]);
	      }
	      $scope.alarmFile.lines = data;
    		$scope.alarmFile.date = moment().format('YYYYMMDD_HHmmss');


	    });
	  };
	  $scope.getCsvObject(); // populates $scope.incidents


	  $scope.Lpad = function (str, length, padString) {
	    str = str.toString();
	    while (str.length < length) {
	    	str = padString + str;
	    }
	    return str;
	  };
  }
}

angular.module('amxApp')
  .component('alarmExportReport', {
    templateUrl: 'app/amx/routes/alarmExportReport/alarmExportReport.html',
    controller: AlarmExportReportComponent,
    controllerAs: 'alarmExportReportCtrl'
  });

})();
