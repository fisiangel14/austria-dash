'use strict';
(function(){

class LookupTablesComponent {
  constructor($scope, View, Lookup, Entry, ConfirmModal) {
    $scope.entry = Entry;
    $scope.currDate = moment().format('YYYYMMDD');

    $scope.reglasFile = [];
    $scope.reglasFile.lines = null;
    $scope.reglasFile.header = ['ID_DATO_IN','DIAS_DESFASE_IN','ID_LINEANEGOCIO_IN','ID_REGION_IN','ID_PERIODO_IN','ID_TECNOLOGIA_IN','ID_SERVICIO_IN'];

    $scope.finetuneStatusFile = [];
    $scope.finetuneStatusFile.lines = null;
    $scope.finetuneStatusFile.header = ['OPCO_ID', 'COUNTRY', 'OPCO_NAME', 'METRIC_ID', 'RELEVANT', 'NAME', 'DESCRIPTION', 'FREQUENCY', 'FORMULA', 'OBJECTIVE', 'TOLERANCE','STATUS', 'TASK_STATUS', 'TASK_DESCRIPTION / NOTES'];

    $scope.localEntry = { 'lookup': {} };

    //Systems lookup
    Lookup.lookup('getSystems').then(function (data) {
      $scope.localEntry.lookup.systems = data;
      $scope.localEntry.lookup.getSystemById = function (id) {
        if (typeof id === 'undefined' || isNaN(id)) { id = 0; }
        return _.find($scope.localEntry.lookup.systems, function (num) { return num.SYSTEM_ID == id; });
      };
    });			
    //Bill cycles lookup
    Lookup.lookup('getBillCycles').then(function (data) {
      $scope.localEntry.lookup.billCycles = data;
      $scope.localEntry.lookup.getBillCycleById = function (id) {
        if (typeof id === 'undefined' || isNaN(id)) { id = 0; }
        return _.find($scope.localEntry.lookup.billCycles, function (num) { return num.BILL_CYCLE_ID == id; });
      };
      $scope.localEntry.lookup.getBillCycleByOpcoId = function (opcoId) {
        if (typeof opcoId === 'undefined' || isNaN(opcoId)) { opcoId = 0; }
        return _.find($scope.localEntry.lookup.billCycles, function (num) { return num.OPCO_ID == opcoId; });
      };
    });
    //Contacts lookup
    Lookup.lookup('getContacts').then(function (data) {
      $scope.localEntry.lookup.contacts = data;
      $scope.localEntry.lookup.getContactById = function (id) {
        if (typeof id === 'undefined' || isNaN(id)) { id = 0; }
        return _.find($scope.localEntry.lookup.contacts, function (num) { return num.CONTACT_ID == id; });
      };
      $scope.localEntry.lookup.getContactByName = function (name) {
        return _.find($scope.localEntry.lookup.contacts, function (num) { return num.NAME === name && num.OPCO_ID == $scope.entry.currentUser.userOpcoId; });
      };
    });

    $scope.$watch('entry.OPCO_ID', function(){
        View.getReglasFile($scope.entry.OPCO_ID).then(function (data) {
          $scope.reglasFile.lines = data;
        }); 

        View.getFinetuneStatusFile($scope.entry.OPCO_ID).then(function (data) {
          $scope.finetuneStatusFile.lines = data;
        }); 
    });

    $scope.addSystem = function() {
      var system = {
        'NAME' : '',
        'DESCRIPTION' : '',
        'OPCO_ID' : $scope.entry.currentUser.userOpcoId
      };
      $scope.localEntry.lookup.systems.push(system);
      //$scope.saveSystem();
    };

    $scope.deleteSystem = function(systemId) {
      ConfirmModal('Are you sure you want to delete system "' + $scope.entry.lookup.getSystemById(systemId).NAME + '" ?')
      .then(function(confirmResult) {
        if (confirmResult) {
          Lookup.delete('system', systemId).then(function (data) {
            if (data.success){
                Entry.showToast('System "' + $scope.entry.lookup.getSystemById(systemId).NAME + '" deleted');
                $scope.localEntry.lookup.systems = _.reject($scope.localEntry.lookup.systems, function (num) {
                  return num.SYSTEM_ID === systemId;
                });
            }
            else {
              Entry.showToast('ERROR: Failed to delete system !' + $scope.entry.lookup.getSystemById(systemId).NAME + '<br><small>' + data.error.code + ', this system is still linked with a dato layout. Please remove all system references before deleting.</small>');
            }
          }); 
        }
      })
      .catch(function err() {
            Entry.showToast('Delete action canceled');
      });

    };

    $scope.saveSystem = function () {
      Lookup.postFlashUpdate('system', $scope.localEntry.lookup.systems)
      .then(function (data) {
        if (data.success){
          Entry.showToast('Changes saved');
          Lookup.lookup('getSystems').then(function (data) {
            $scope.localEntry.lookup.systems = data;
          });
        }
        else {
          switch (data.error.errno){
            default: Entry.showToast('Update failed. Error ' + data.error.code); break;
          }
        }
      });   
    };
    
    $scope.addContact = function() {
      var contact = {
        'NAME' : '',
        'EMAIL' : '',
        'CONTACT_TYPE' : 'P',
        'OPCO_ID' : $scope.entry.currentUser.userOpcoId
      };
      $scope.localEntry.lookup.contacts.push(contact);
      //$scope.saveContact();
    };

    $scope.deleteContact = function(contactId) {
      ConfirmModal('Are you sure you want to delete contact "' + $scope.localEntry.lookup.getContactById(contactId).NAME + '" ?')
      .then(function(confirmResult) {
        if (confirmResult) {
          Lookup.delete('contact', contactId).then(function (data) {
            if (data.success){
                Entry.showToast('Contact "' + $scope.localEntry.lookup.getContactById(contactId).NAME + '" deleted');
                $scope.localEntry.lookup.contacts = _.reject($scope.localEntry.lookup.contacts, function (num) {
                  return num.CONTACT_ID === contactId;
                });
            }
            else {
              Entry.showToast('Failed to delete contact ' + $scope.localEntry.lookup.getContactById(contactId).NAME + '. ' + data.error.code + ', this contact is still linked with a dato layout. Please remove all references before deleting.');
            }
          }); 
        }
      })
      .catch(function err() {
            Entry.showToast('Delete action canceled');
      }); 
    };

    $scope.saveContact = function () {
      Lookup.postFlashUpdate('contact', $scope.localEntry.lookup.contacts)
      .then(function (data) {
        if (data.success){
          Entry.showToast('Changes saved');
          Lookup.lookup('getContacts').then(function (data) {
            $scope.localEntry.lookup.contacts = data;
          });
        }
        else {
          switch (data.error.errno){
            default: Entry.showToast('Update failed. Error ' + data.error.code); break;
          }
        }
      });   
    };

    $scope.addCycle = function() {
    	var cycle = {
    		'BILL_CYCLE' : '',
    		'DESCRIPTION' : '',
    		'OPCO_ID' : $scope.entry.currentUser.userOpcoId
    	};
    	$scope.localEntry.lookup.billCycles.push(cycle);
    	//$scope.saveCycle();
    };

    $scope.deleteCycle = function(cycleId) {
      ConfirmModal('Are you sure you want to delete cycle "' + $scope.localEntry.lookup.getBillCycleById(cycleId).DESCRIPTION + '" ?')
      .then(function(confirmResult) {
        if (confirmResult) {
        	Lookup.delete('cycle', cycleId).then(function (data) {
      			if (data.success){
      					Entry.showToast('Bill cycle "' + $scope.localEntry.lookup.getBillCycleById(cycleId).BILL_CYCLE + '" deleted');
      			  	$scope.localEntry.lookup.billCycles = _.reject($scope.localEntry.lookup.billCycles, function (num) {
      			  		return num.BILL_CYCLE_ID === cycleId;
      			  	});
      			}
      			else {
      				Entry.showToast('Failed to delete bill cycle ' + $scope.localEntry.lookup.getBillCycleById(cycleId).BILL_CYCLE + '. <br><small>' + data.error.code + ', this cycle is still linked with a dato layout. Please remove all references before deleting.</small>');
      			}
      		}); 
        }
      })
      .catch(function err() {
            Entry.showToast('Delete action canceled');
      });   
    };

    $scope.saveCycle = function () {
      Lookup.postFlashUpdate('cycle', $scope.localEntry.lookup.billCycles)
      .then(function (data) {
        if (data.success){
  				Entry.showToast('Changes saved');
  				Lookup.lookup('getBillCycles').then(function (data) {
  			    $scope.localEntry.lookup.billCycles = data;
  			  });
        }
        else {
          switch (data.error.errno){
            default: Entry.showToast('Update failed. Error ' + data.error.code); break;
          }
        }
      });  	
    };
  }
}

angular.module('amxApp')
  .component('lookupTables', {
    templateUrl: 'app/amx/routes/lookupTables/lookupTables.html',
    controller: LookupTablesComponent
  });

})();
