'use strict';
(function(){

class IncidentExportReportComponent {
  constructor($scope, Incident, Entry, $timeout) {
	  $scope.entry = Entry;
	  $scope.q = {};

	  $scope.q.FROM = moment().subtract(1, 'months').startOf('month').toDate();
	  $scope.q.TO = moment().subtract(1, 'months').endOf('month').toDate();
	  $scope.q.INCLUDE_OPEN = '%';
	  $scope.incidents = {};

	  var footer = [];
	  footer.push({'RA. Ref. no.': '+/- effect on EBITDA in EUR:'});
	  footer.push({'RA. Ref. no.': '1) Revenue lost: revenue lost and not billed to the customer or business partners'});
	  footer.push({'RA. Ref. no.': '2) Revenue loss recovered: revenues recovered due to RA activities'});
	  footer.push({'RA. Ref. no.': '3) Revenue loss prevented: future revenue loss avoided due to RA activities'});
	  footer.push({'RA. Ref. no.': '4) Unjustified gain: overcharging & excessive costs underpayment of customers and partners'});
	  footer.push({'RA. Ref. no.': '5) Unjustified gain corrected: overcharging & excessive costs underpayment of customers and partners corrected due to RA activities'});
	  footer.push({'RA. Ref. no.': '6) Unjustified gain prevented: future overcharging & excessive costs underpayment of customers and partners avoided due to RA activities'});
	  footer.push({'RA. Ref. no.': '7) Excessive costs: overcharging of Telekom Austria by business partners'});
	  footer.push({'RA. Ref. no.': '8) Excessive costs corrected: overcharging of Telekom Austria by business partners corrected avoided due to RA activities'});
	  footer.push({'RA. Ref. no.': '9) Excessive costs prevented: future overcharging of Telekom Austria by business partners avoided due to RA activities avoided due to RA activities'});
	  footer.push({'RA. Ref. no.': '10) Financial Reporting misstatement: inaccurate presentation of financial statements'});
	  footer.push({'RA. Ref. no.': '11) Financial Reporting misstatement corrected: inaccurate presentation of financial statements corrected avoided due to RA activities'});
	  footer.push({'RA. Ref. no.': '12) Financial Reporting misstatement prevented: inaccurate presentation of financial statements avoided due to RA activities'});
	  footer.push({'RA. Ref. no.': '13) Usage loss of event CDRs: loss measured in number of events/CDRs'});
	  footer.push({'RA. Ref. no.': '14) Usage loss of event CDRs recovered:  loss measured in number of events/CDRs recovered due to RA activities'});
	  footer.push({'RA. Ref. no.': '15) Usage loss of event CDRs prevented: loss measured in number of events/CDRs avoided due to RA activities'});
	  footer.push({'RA. Ref. no.': '16) Usage loss of minutes MoU:  loss measured in number of Minutes of Use'});
	  footer.push({'RA. Ref. no.': '17) Usage loss of minutes MoU recovered:   loss measured in number of Minutes of Use recovered due to RA activities'});
	  footer.push({'RA. Ref. no.': '18) Usage loss of minutes MoU prevented:  loss measured in number of Minutes of Use avoided due to RA activities'});
	  footer.push({'RA. Ref. no.': '19) Usage loss of data traffic GB:  loss measured in amount of GB'});
	  footer.push({'RA. Ref. no.': '20) Usage loss data traffic GB recovered:  loss measured in amount of GB recovered due to RA activities'});
	  footer.push({'RA. Ref. no.': '21) Usage loss data traffic GB prevented:  loss measured in amount of GB avoided due to RA activities'});
	  footer.push({'RA. Ref. no.': '22) Customer Data Inconsistency: any loss or deviation measured in number of affected lines/subscribers or products/services'});
	  footer.push({'RA. Ref. no.': '23) Customer Data Inconsistency corrected: any loss or deviation measured in number of affected lines/subscribers or products/services corrected avoided due to RA activities'});
	  footer.push({'RA. Ref. no.': '24) Customer Data Inconsistency prevented: any loss or deviation measured in number of affected lines/subscribers or products/services avoided due to RA activities`;'});
	  $scope.incidents.footer = footer;

/* jshint ignore:start */
    $scope.tableToExcel = (function() {
          var uri = 'data:application/vnd.ms-excel;base64,'
            , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
            , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
            , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
          return function(table, name) {
            if (!table.nodeType) table = document.getElementById(table)
            var ctx = {worksheet: name, table: table.innerHTML}
      			// window.location.href = uri + base64(format(template, ctx))

        		var filename = name;
            var elem = window.document.createElement('a');
            elem.href = uri + base64(format(template, ctx));
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
          }
        })();
/* jshint ignore:end */

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
	    $scope.q.FROM = moment($scope.q.FROM).startOf('month').toDate();
	    $scope.q.TO = moment($scope.q.FROM).endOf('month').toDate();
	    $scope.getCsvObject();
	  };

	  $scope.getCsvObject = function () {


	    Incident.getIncidentReport($scope.entry.OPCO_ID, moment($scope.q.FROM).format('YYYY-MM-DD'), moment($scope.q.TO).format('YYYY-MM-DD'), $scope.q.INCLUDE_OPEN).then(function(data) {
	      if (data.length > 0) {
	      	$scope.incidents.header = Object.keys(data[0]);
	      }
	      $scope.incidents.lines = data;
	      //$scope.incidents.lines.push({});
	      //$scope.incidents.lines = $scope.incidents.lines.concat(footer);
	      //console.log($scope.incidents);

	    });
	  };
	  $scope.getCsvObject(); // populates $scope.incidents

$scope.getTypeOfImpactText = function (typeOfImpact, level) {
	    // Revenue loss
	    if (typeOfImpact == 'Revenue loss' && level == 1) {return 'Revenue lost';}
	    else if (typeOfImpact == 'Revenue loss' && level == 2) {return 'Revenue loss recovered';}
	    else if (typeOfImpact == 'Revenue loss' && level == 3) {return 'Revenue loss prevented';}

	    else if (typeOfImpact == 'Overcharging' && level == 1) {return 'Unjustified gain';}
	    else if (typeOfImpact == 'Overcharging' && level == 2) {return 'Unjustified gain corrected';}
	    else if (typeOfImpact == 'Overcharging' && level == 3) {return 'Unjustified gain prevented';}

	    else if (typeOfImpact == 'Excessive costs' && level == 1) {return 'Excessive costs';}
	    else if (typeOfImpact == 'Excessive costs' && level == 2) {return 'Excessive costs corrected';}
	    else if (typeOfImpact == 'Excessive costs' && level == 3) {return 'Excessive costs prevented';}

	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 1) {return 'Financial reporting misstatement';}
	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 2) {return 'Financial reporting misstatement corrected';}
	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 3) {return 'Financial reporting misstatement prevented';}

	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 1) {return 'Usage loss of event CDRs';}
	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 2) {return 'Usage loss of event CDRs recovered';}
	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 3) {return 'Usage loss of event CDRs prevented';}

	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 1) {return 'Usage loss of minutes MoU';}
	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 2) {return 'Usage loss of minutes MoU recovered';}
	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 3) {return 'Usage loss of minutes MoU prevented';}

	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 1) {return 'Usage loss of data traffic GB';}
	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 2) {return 'Usage loss of data traffic GB recovered';}
	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 3) {return 'Usage loss of data traffic GB prevented';}

	    else if (typeOfImpact == 'Customer data inconsistency' && level == 1) {return 'Customer data inconsistency';}
	    else if (typeOfImpact == 'Customer data inconsistency' && level == 2) {return 'Customer data inconsistency corrected';}
	    else if (typeOfImpact == 'Customer data inconsistency' && level == 3) {return 'Customer data inconsistency prevented';}
	    
	    else if (typeOfImpact == 'No loss') {return 'No loss';}
	    else if (typeOfImpact == 'Unknown') {return 'Unknown';}
	    
	    else {return 'Unknown';}
	 
	  };

		$scope.getTypeOfImpactNumber = function (typeOfImpact, level) {
	    // Revenue loss
	    if (typeOfImpact == 'Revenue loss' && level == 1) {return '1';}
	    else if (typeOfImpact == 'Revenue loss' && level == 2) {return '2';}
	    else if (typeOfImpact == 'Revenue loss' && level == 3) {return '3';}

	    else if (typeOfImpact == 'Overcharging' && level == 1) {return '4';}
	    else if (typeOfImpact == 'Overcharging' && level == 2) {return '5';}
	    else if (typeOfImpact == 'Overcharging' && level == 3) {return '6';}

	    else if (typeOfImpact == 'Excessive costs' && level == 1) {return '7';}
	    else if (typeOfImpact == 'Excessive costs' && level == 2) {return '8';}
	    else if (typeOfImpact == 'Excessive costs' && level == 3) {return '9';}

	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 1) {return '10';}
	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 2) {return '11';}
	    else if (typeOfImpact == 'Financial reporting misstatement' && level == 3) {return '12';}

	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 1) {return '13';}
	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 2) {return '14';}
	    else if (typeOfImpact == 'Usage loss of event CDRs' && level == 3) {return '15';}

	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 1) {return '16';}
	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 2) {return '17';}
	    else if (typeOfImpact == 'Usage loss of minutes MoU' && level == 3) {return '18';}

	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 1) {return '19';}
	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 2) {return '20';}
	    else if (typeOfImpact == 'Usage loss of data traffic GB' && level == 3) {return '21';}

	    else if (typeOfImpact == 'Customer data inconsistency' && level == 1) {return '22';}
	    else if (typeOfImpact == 'Customer data inconsistency' && level == 2) {return '23';}
	    else if (typeOfImpact == 'Customer data inconsistency' && level == 3) {return '24';}
	    
	    else if (typeOfImpact == 'No loss') {return 'No loss';}
	    else if (typeOfImpact == 'Unknown') {return 'Unknown';}
	    
	    else {return 'Unknown';}
	 
	  }; 

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
  .component('incidentExportReport', {
    templateUrl: 'app/amx/routes/incidentExportReport/incidentExportReport.html',
    controller: IncidentExportReportComponent
  });

})();
