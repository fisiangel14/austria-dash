'use strict';

angular.module('amxApp')
  .factory('Entry', function ($cookies, $mdToast, $timeout, $location) {
    // Service logic
    // ...

    var entry = {
        currentUser: {
            loginInProgress: false
        }
    };
    
    entry.navBarLink = '/';

    entry.getExpiryDate = function () {
        var date = new Date();
        var expiryDate = new Date(date.getTime() + 24 * 3600 * 1000);
        return expiryDate;
    }; 

    entry.getExpiryDateNever = function () {
        var date = new Date();
        var expiryDate = new Date(date.getTime() + 10 * 365 * 24 * 3600 * 1000);
        return expiryDate;
    };

    // Metric catalogue search
    // entry.searchMetric = {};
    // entry.searchMetric.RELEVANT = 'Y';

    // Dato catalogue search
    // entry.searchDato = {};
    // entry.searchDato.RELEVANT = 'Y';

    // Overview fine-tuned filter
    entry.overviewShowFineTunedOnly = 'Y';
    entry.balancedScorecardShowAllIncidents = 'Y';

    // default date sort order
    entry.reverse = true;

    // Dato Results Overview filters init
    entry.searchDatoOverview = {};
    entry.searchDatoOverview.GREEN = true;
    entry.searchDatoOverview.YELLOW = true;
    entry.searchDatoOverview.ORANGE = true;
    entry.searchDatoOverview.RED = true;
    entry.searchDatoOverview.NO_RESULT = true;
    entry.searchDatoOverview.D = true;
    entry.searchDatoOverview.M = true;
    entry.searchDatoOverview.C = true;

    // Metric Results Overview filters init
    entry.searchMetricOverview = {};
    entry.searchMetricOverview.GREEN = true;
    entry.searchMetricOverview.YELLOW = true;
    entry.searchMetricOverview.ORANGE = true;
    entry.searchMetricOverview.RED = true;
    entry.searchMetricOverview.NO_RESULT = true;
    entry.searchMetricOverview.IMPLEMENTED = false;
    entry.searchMetricOverview.D = true;
    entry.searchMetricOverview.M = true;
    entry.searchMetricOverview.C = true; 

    // Coverage
    entry.searchProductSegment = {};

    // Alarm filters init
    entry.searchAlarm = {};

    entry.searchAlarm.alarmLevel = '%';
    entry.searchAlarm.alarmSource = '%';
    entry.searchAlarm.alarmStatus = 'Not closed';

    // Metric result table
    entry.searchResultTable = {};
    entry.searchResultTable.GREEN = true;
    entry.searchResultTable.YELLOW = true;
    entry.searchResultTable.RED = true;
    entry.searchResultTable.ORANGE = true;
    entry.searchResultTable.NO_RESULT = true;

    // Controls
    entry.searchControlResultTable = {};

    if ($cookies.get('limitDays')) {
        entry.searchControlResultTable.limitDays = Number($cookies.get('limitDays'));
    }
    else {
        $cookies.put('limitDays', 21, {expires:entry.getExpiryDateNever()});
        entry.searchControlResultTable.limitDays = 21;
    }

    if ($cookies.get('showAuditing')) {
        entry.showAuditing = $cookies.get('showAuditing');
    }
    else {
        entry.showAuditing = 'N';
        $cookies.put('showAuditing', 'N', {expires:entry.getExpiryDateNever()});
    }

    entry.searchRiskCatalogue = {};

    entry.searchHeatMap = {};
    entry.searchHeatMap.showRPN = true;
    entry.searchHeatMap.mapValue = 'Total';
    entry.searchHeatMap.mapType = 'Risk / System';
    entry.searchHeatMap.initialSort = {'col': [], 'row': []};
    
    entry.searchKeyRiskArea = {};
    entry.showRiskAreaDetails = 'N';
    entry.showRiskAreaExpand = 'N';
    entry.showMeasures = true;

    entry.currYear = moment().format('YYYY');
    entry.currMonth = moment().format('YYYY-MM');
    entry.currDay = moment().format('DD.MM.YYYY');
    
    if ($cookies.get('searchMDmonth')) {
        entry.searchMDmonth = moment($cookies.get('searchMDmonth')).format('YYYY-MM');
    }
    else {
        entry.searchMDmonth = moment().format('YYYY-MM');
    }

    entry.getOpcoId = function() {
        if ($cookies.get('OPCO_ID')) {
            entry.OPCO_ID = Number($cookies.get('OPCO_ID'));
            return entry.OPCO_ID;
        }
        else if (entry.currentUser.userOpcoId) {
            entry.OPCO_ID = Number(entry.currentUser.userOpcoId);
            return entry.OPCO_ID;
        }
        else if (entry.currentUser.stakeholderOpcoId) {
            entry.OPCO_ID = Number(entry.currentUser.stakeholderOpcoId);
            return entry.OPCO_ID;
        }
        else {
            delete entry.OPCO_ID;   
            return 0;
        }
    };

    entry.getOpcoId();

    entry.isDisabled = function() {
        return Number(entry.OPCO_ID) !== (entry.currentUser && entry.currentUser.userAuth && Number(entry.currentUser.userOpcoId));
    };

    var timerToast = false;
    entry.showToast = function(showText){
        if (timerToast) {
          $timeout.cancel(timerToast);
        }
        timerToast = $timeout(function () {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(showText)
                    .position('bottom right')
                    .hideDelay(3000)
            );
        }, 500);
    };

    entry.copiedToClipboard = false;

    entry.copyToClipboard = function (textToCopy) {
        // create temp element
        var copyElement = document.createElement('span');
        copyElement.appendChild(document.createTextNode(textToCopy));
        copyElement.id = 'tempCopyToClipboard';
        angular.element(document.body.append(copyElement));

        // select the text
        var range = document.createRange();
        range.selectNode(copyElement);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

        // copy & cleanup
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        copyElement.remove();

        entry.copiedToClipboard = true;
        $timeout(function () {
            entry.copiedToClipboard = false;
        }, 2000);
    };

    entry.getBaseURL = function (includePort){
        var baseURL;
        if (includePort) {
            baseURL = $location.$$protocol + '://' + $location.$$host + ':' + $location.$$port ;
            return baseURL;
        }
        else {
            baseURL = $location.$$protocol + '://' + $location.$$host;
            return baseURL;
        }
    };

    // Public API here
    return entry;

  });
