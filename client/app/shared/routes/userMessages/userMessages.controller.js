'use strict';
(function(){

class UserMessagesComponent {
  constructor($scope, Auth, Entry, $cookies) {
	  $scope.entry = Entry;

	  $scope.saveMessageConfig = function () {
	    Auth.saveMessageConfig($scope.entry.currentUser).then(function (data) {
	      if (data.success) {
	        $cookies.put('userMessageConfig', JSON.stringify($scope.entry.currentUser.userMessageConfig), {expires: $scope.entry.getExpiryDate()});
	        Entry.showToast( 'Messaging preferences were successfully saved!');
	      }
	    });    
	  };
  }
}

angular.module('amxApp')
  .component('userMessages', {
    templateUrl: 'app/shared/routes/userMessages/userMessages.html',
    controller: UserMessagesComponent
  });

})();
