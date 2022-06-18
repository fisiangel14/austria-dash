'use strict';
(function(){

class DatoFileTableComponent {
  constructor($scope, Entry, View, $stateParams, $cookies) {
	  $scope.entry = Entry;
	  $scope.loadFinished = false;

		if (moment($stateParams.month, 'YYYY-MM', true).isValid()) {
		  if ($cookies.get('searchMDmonth') !== $stateParams.month) {
		  	$cookies.put('searchMDmonth', $stateParams.month);
		  	$scope.entry.searchMDmonth = $stateParams.month;
		  }
	  }
	  else {
	  	if ($cookies.get('searchMDmonth')){
	  		$stateParams.month = $cookies.get('searchMDmonth');
	  	}
	  	else {
	  		$stateParams.month = moment().format('YYYY-MM');
	  	}
	  }
	  
	  $scope.workMonth = $stateParams.month;
	  $scope.workMonthText = moment($stateParams.month, 'YYYY-MM').format('MMMM, YYYY');

	  $scope.prevMonth = moment($stateParams.month, 'YYYY-MM').subtract(1, 'months').format('YYYY-MM');
	  $scope.prevMonthText = moment($stateParams.month, 'YYYY-MM').subtract(1, 'months').format('MMMM, YYYY');
	  
	  $scope.nextMonth = moment($stateParams.month, 'YYYY-MM').add(1, 'months').format('YYYY-MM');
	  $scope.nextMonthText = moment($stateParams.month, 'YYYY-MM').add(1, 'months').format('MMMM, YYYY');
	  
	  $scope.currMonth = moment().format('YYYY-MM');
	  $scope.currMonthText = moment().format('MMMM, YYYY');
	  
	  $scope.rangeFromDate = moment($stateParams.month, 'YYYY-MM').format('YYYY-MM-DD');
	  $scope.rangeToDate = moment($stateParams.month, 'YYYY-MM').endOf('month').add(1, 'days').format('YYYY-MM-DD');

	  View.getDatoFiles($scope.rangeFromDate, $scope.rangeToDate).then(function (data) {
	    $scope.files = data;
			$scope.loadFinished = true;
	  });
  }
}

angular.module('amxApp')
  .component('datoFileTable', {
    templateUrl: 'app/amx/routes/datoFileTable/datoFileTable.html',
    controller: DatoFileTableComponent
  });

})();
