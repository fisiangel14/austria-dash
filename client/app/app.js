'use strict';

var app = angular.module('amxApp',
  ['amxApp.constants',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'ui.bootstrap.tabs',
    'ngAnimate',
    'ngMessages',
    'ngAria',
    'ngMaterial',
    'ngCsv',
    'amxApp.c3chart',
    'angular-jwt'
  ]);

app.config(function ($urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true);
});

app.config(['$mdDateLocaleProvider', function ($mdDateLocaleProvider) {
  $mdDateLocaleProvider.formatDate = function (date) {
    return moment(date).format('DD.MM.YYYY');
  };
}]);

app.config(['$qProvider', function ($qProvider) {
  $qProvider.errorOnUnhandledRejections(false);
}]);

app.config(function Config($httpProvider, jwtOptionsProvider) {
  // Please note we're annotating the function so that the $injector works when the file is minified
  jwtOptionsProvider.config({
    authPrefix: '',
    tokenGetter: ['Entry', function (Entry) {
      return Entry.currentUser.userToken;
    }],
    unauthenticatedRedirector: ['$state', 'Auth', 'Entry', '$cookies', '$timeout', 'Socket', function ($state, Auth, Entry, $cookies, Socket) {

      if (Entry.currentUser.loginInProgress) {
        Entry.showToast('Login in progress...');
      } else {
        Entry.currentUser.loginInProgress = true;
        Entry.showToast('Authorization token invalid or expired. Please sign in!');
        Auth.login().then(function () {
          // Continue to intended page after successfull authentication
          $state.go($state.current.name, $state.params, {
            reload: true
          });
        }).catch(function () {
          // Log out if failed to authenticate
          Socket.removeAllListeners();
          Entry.currentUser = {
            userAuth: false,
            userAuthFailed: 0
          };
          $cookies.remove('userAuth');
          $cookies.remove('userName');
          $cookies.remove('userAlias');
          $cookies.remove('userToken');
          $cookies.remove('userOpcoName');
          $cookies.remove('userOpcoId');
          $cookies.remove('userAccessLevel');
          $cookies.remove('userMessageConfig');
          $cookies.remove('OPCO_ID');
          $cookies.remove('OPCO_NAME');
          // $state.go('overview');
        });
      }

    }]
  });
  $httpProvider.interceptors.push('jwtInterceptor');
});

app.run(['$rootScope', '$state', '$cookies', '$interval', '$timeout', '$window', 'Entry', 'Lookup', 'Auth', '$http', 'authManager', 'Socket',
  function ($rootScope, $state, $cookies, $interval, $timeout, $window, Entry, Lookup, Auth, $http, authManager, Socket) {
    $rootScope.entry = Entry;

    $rootScope.entry.params = {};

    $rootScope.entry.lookup = {};

    authManager.redirectWhenUnauthenticated();

    $http({
      method: 'GET',
      url: '/api/config'
    }).then(function (response) {
      $rootScope.entry.env = response.data.NODE_ENV;
    }, function (err) {
      $rootScope.entry.env = 'unknown';
    });

    //*** Window width
    $rootScope.entry.windowWidth = $window.innerWidth;
    angular.element($window).bind('resize', function () {
      $timeout(function () {
        $rootScope.entry.windowWidth = $window.innerWidth;
        $rootScope.$broadcast('calHeatmapUpdate', {});
        $rootScope.$broadcast('c3ChartUpdate', {});
        $rootScope.$broadcast('directedGraphUpdate', {});
        $rootScope.$digest();
      }, 500);
    });


    //*** LOOKUPS

    // // Areas lookup
    // Lookup.lookup('getAreas').then(function (data) {
    //   $rootScope.entry.lookup.areas = data;
    // 	$rootScope.entry.lookup.getAreaById = function (id){
    // 		return _.find($rootScope.entry.lookup.areas, function(num){return num.AREA_ID == id;});
    // 	};
    // });


    // Opcos lookup
    Lookup.lookup('getOpcos').then(function (data) {
      $rootScope.entry.lookup.opcos = data;
      $rootScope.entry.lookup.getOpcoById = function (id) {
        if (typeof id === 'undefined' || isNaN(id)) {
          id = 0;
        }
        return _.find($rootScope.entry.lookup.opcos, function (num) {
          return num.OPCO_ID == id;
        });
      };
    });


    // //LOBs lookup
    // Lookup.lookup('getLobs').then(function (data) {
    //   $rootScope.entry.lookup.lobs = data;
    // 	$rootScope.entry.lookup.getLobById = function (id) {
    // 		if (typeof id === 'undefined' || isNaN(id)) { id = 0; }
    // 		return _.find($rootScope.entry.lookup.lobs, function(num){return num.LOB_ID == id;});
    // 	};
    // });	


    // //Technology lookup
    // Lookup.lookup('getTechnologies').then(function (data) {
    //   $rootScope.entry.lookup.technologies = data;
    // 	$rootScope.entry.lookup.getTechnologyById = function (id){
    // 		if (typeof id === 'undefined' || isNaN(id)) {id = 0;}
    // 		return _.find($rootScope.entry.lookup.technologies, function(num){return num.TECHNOLOGY_ID == id;});
    // 	};
    // });	


    // //Service lookup
    // Lookup.lookup('getServices').then(function (data) {
    //   $rootScope.entry.lookup.services = data;
    // 	$rootScope.entry.lookup.getServiceById = function (id) {
    // 		if (typeof id === 'undefined' || isNaN(id)) {id = 0;}
    // 		return _.find($rootScope.entry.lookup.services, function(num){return num.SERVICE_ID == id;});
    // 	};
    // });	


    // //Systems lookup
    // Lookup.lookup('getSystems').then(function (data) {
    //   $rootScope.entry.lookup.systems = data;
    // 	$rootScope.entry.lookup.getSystemById = function (id) {
    // 		if (typeof id === 'undefined' || isNaN(id)) {id = 0;}
    // 		return _.find($rootScope.entry.lookup.systems, function(num){return num.SYSTEM_ID == id;});
    // 	};
    // });	


    // //Bill cycles lookup
    // Lookup.lookup('getBillCycles').then(function (data) {
    //   $rootScope.entry.lookup.billCycles = data;
    // 	$rootScope.entry.lookup.getBillCycleById = function (id) {
    // 		if (typeof id === 'undefined' || isNaN(id)) {id = 0;}
    // 		return _.find($rootScope.entry.lookup.billCycles, function(num){return num.BILL_CYCLE_ID == id;});
    // 	};
    // 	$rootScope.entry.lookup.getBillCycleByOpcoId = function (opcoId) {
    // 		if (typeof opcoId === 'undefined' || isNaN(opcoId)) {opcoId = 0;}
    // 		return _.find($rootScope.entry.lookup.billCycles, function(num){return num.OPCO_ID == opcoId;});
    // 	};
    // });	


    // //Contacts lookup
    // Lookup.lookup('getContacts').then(function (data) {
    //   $rootScope.entry.lookup.contacts = data;
    // 	$rootScope.entry.lookup.getContactById = function (id) {
    // 		if (typeof id === 'undefined' || isNaN(id)) {id = 0;}
    // 		return _.find($rootScope.entry.lookup.contacts, function(num){return num.CONTACT_ID == id;});
    // 	};
    // 	$rootScope.entry.lookup.getContactByName = function (name) {
    // 		return _.find($rootScope.entry.lookup.contacts, function(num){return num.NAME === name && num.OPCO_ID == $rootScope.entry.currentUser.userOpcoId;});
    // 	};
    // });	


    // //Periodicity lookup
    // Lookup.lookup('getPeriodicity').then(function (data) {
    //   $rootScope.entry.lookup.periodicity = data;
    // 	$rootScope.entry.lookup.getPeriodicityById = function (id) {
    // 	//		console.log(id);
    // 		if (typeof id === 'undefined' || isNaN(id)) {id = 0;}
    // 		return _.find($rootScope.entry.lookup.periodicity, function(num){return num.PERIODICITY_ID == id;});
    // 	};
    // });	

    //*** end: LOOKUPS

    // Watch OPCO_ID
    $rootScope.$watch('entry.OPCO_ID', function () {
      // console.log('OPCO_ID: ' + $rootScope.entry.OPCO_ID);
      // console.log(typeof $rootScope.entry.OPCO_ID);

      $timeout(function () {
        $rootScope.entry.OPCO_NAME = $rootScope.entry.lookup.getOpcoById($rootScope.entry.OPCO_ID).OPCO_NAME;
        $cookies.put('OPCO_ID', $rootScope.entry.OPCO_ID, {
          expires: $rootScope.entry.getExpiryDate()
        });
        $cookies.put('OPCO_NAME', $rootScope.entry.OPCO_NAME, {
          expires: $rootScope.entry.getExpiryDate()
        });
      }, 600);
    });

    if ($cookies.get('userAuth')) {

      // Set default message cookie if not alrady there
      if (!$cookies.get('userMessageConfig')) {
        $cookies.put('userMessageConfig', '{}');
      }

      // Load user authentication details from cookie 
      $rootScope.entry.currentUser = {
        userAuth: true,
        userAuthFailed: 0,
        userName: $cookies.get('userName'),
        userAlias: $cookies.get('userAlias'),
        userToken: $cookies.get('userToken'),
        userOpcoName: $cookies.get('userOpcoName'),
        userOpcoId: Number($cookies.get('userOpcoId')),
        userAccessLevel: $cookies.get('userAccessLevel'),
        userMessageConfig: JSON.parse($cookies.get('userMessageConfig'))
      };
    } else {
      // Set currentUser object to not authenticated 
      $rootScope.entry.currentUser = {
        userAuth: false,
        userAuthFailed: 0
      };
    }

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      // Enrich Entry object on each state change
      $rootScope.entry.state = toState;
      $rootScope.entry.stateParams = toParams;
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      var requireLogin = toState.data.requireLogin;
      var stekoholderContent = toState.data.stekoholderContent;

      // State requres Login and user is not authenticated
      if ((!stekoholderContent && requireLogin && !$rootScope.entry.currentUser.userAuth) || (!stekoholderContent && requireLogin && typeof $rootScope.entry.OPCO_ID == 'undefined') || (stekoholderContent && !$rootScope.entry.currentUser.stakeholderUserAuth && !$rootScope.entry.currentUser.userAuth)) {
        event.preventDefault();

        // Force user to authenticate
        Auth.login().then(function () {
          return $state.go(toState.name, toParams);
        }).catch(function () {
          Socket.removeAllListeners();
          // return $state.go('overview');
        });
      } else if (!requireLogin && typeof $rootScope.entry.OPCO_ID == 'undefined') {
        Socket.removeAllListeners();
        $rootScope.entry.OPCO_ID = $rootScope.entry.getOpcoId();
      }

      // change OPCO_ID if active opco is TAG and toState is not applicable for TAG
      if (toState.name !== 'changeRequests' && toState.name !== 'datoTable' && toState.name !== 'datoInfo' && toState.name !== 'metricTable' && toState.name !== 'metricInfo' && toState.name.indexOf('incident') === -1 && toState.name.indexOf('overview') === -1 && $rootScope.entry.OPCO_ID === 0 && toState.name !== 'taskTable' && toState.name !== 'harvestSummary' && toState.name !== 'balancedScorecard') {
        // timeout to avoid loop
        $timeout(function () {
          if ($rootScope.entry.currentUser.userOpcoId) {
            $rootScope.entry.OPCO_ID = $rootScope.entry.currentUser.userOpcoId;
          } else {
            $rootScope.entry.OPCO_ID = $rootScope.entry.getOpcoId();
          }
        }, 200);
      }

    });

    $rootScope.entry.getCounters = function () {
      Lookup.lookup('getCounters', $rootScope.entry.currentUser.userOpcoId)
        .then(function (data) {
          $rootScope.entry.counters = data;
        });
    };

    // Initial call to getCounters
    $timeout(function () {
      $rootScope.entry.getCounters();
    }, 1500);

    // Set socket listener for counter refresh
    Socket.on(('counters:update:' + $rootScope.entry.currentUser.userOpcoId), function () {
      $rootScope.entry.getCounters();
    });

    // AUTO REFRESH parameters - insert logic here
    // $interval(function () {
    // 	Lookup.lookup('getCounters', $rootScope.entry.currentUser.userOpcoId)
    // 	.then(function (data) {
    // 		$rootScope.entry.counters = data;
    //   });	
    // },60000);

  }
]);