'use strict';

(function(){

class ProcedureInfoComponent {
  constructor($scope, Entry, $http, $state, $stateParams, Dato, ConfirmModal, Coverage, dflLinkDatasourceModal, Lookup, $uibModal) {
    $scope.entry = Entry;
    $scope.isDisabled = $scope.entry.isDisabled();
  	$scope.procedure = {};
  	$scope.coverage = [];
  	$scope.coverageStats = [];
  	$scope.subTypes = [];
  	$scope.schedules = [];
  	$scope.procedure.links = [];
		$scope.localEntry = { 'lookup': {} };
    $scope._und = _;

    // Get coverage info
    var getCoverageInfo = function() {

      Coverage.getControlDetails($scope.procedure.CVG_CONTROL_ID)
      .then(function (response) {
        $scope.coverage = response.results.RiskNodes;
        $scope.coverageStats = response.results.CoverageStats;

        if ($scope.coverage.length > 0) {
          var productSegmentId = 0;
          var riskId = 0;
          var active = 0;

          for (var i=0; i<$scope.coverage.length;i++) {
            if (productSegmentId == $scope.coverage[i].PRODUCT_SEGMENT_ID && riskId == $scope.coverage[i].RISK_ID) {
              active = active+1;
            }
            else {
              active = 0;
            }

            $scope.coverage[i].active = active;

            productSegmentId = $scope.coverage[i].PRODUCT_SEGMENT_ID;
            riskId = $scope.coverage[i].RISK_ID;							
          }
        }
      }, function (err) {
        // handle error
        console.log(err);
      });
    };

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

	  if ($stateParams.procedureId === undefined) {
	    $state.go('procedureTable', {opcoId: $scope.entry.OPCO_ID}, {reload: true});
	  }
	  else if ($stateParams.procedureId === 'newJob') {
	  	$scope.procedure.TYPE = 'J';
	  	$scope.procedure.TYPE_TEXT = 'Job';
	  	$scope.procedure.STATUS_CODE = 'A';
	  	$scope.procedure.OPCO_ID = $scope.entry.currentUser.userOpcoId;

			// Get subtypes list
			$http({
				method: 'GET',
				url: '/api/dfl-procedures/getProcedureSubTypesList',
				params: {opcoId: $scope.entry.currentUser.userOpcoId, type: $scope.procedure.TYPE}
			}).then(function (response) {
				$scope.subTypes = response.data;
			}, function (err) {
				// handle error
				console.log(err);
			});

		  // Get schedules
			$http({
				method: 'GET',
				url: '/api/dfl-procedures/getSchedules',
				params: {opcoId: $scope.procedure.OPCO_ID}
			}).then(function (response) {
				$scope.schedules = response.data;
			}, function (err) {
				// handle error
				console.log(err);
			});				
	  }
	  else if ($stateParams.procedureId === 'newDato') {
	  	$scope.procedure.TYPE = 'T';
	  	$scope.procedure.SUB_TYPE = 'AMX';
	  	$scope.procedure.TYPE_TEXT = 'Dato';
	  	$scope.procedure.STATUS_CODE = 'A';
	  	$scope.procedure.OPCO_ID = $scope.entry.currentUser.userOpcoId;

	    Dato.getNotLinkedDatos($scope.entry.currentUser.userOpcoId).then(function (data) {
	      $scope.datos = data;
	    });	

	    // Get schedules
			$http({
				method: 'GET',
				url: '/api/dfl-procedures/getSchedules',
				params: {opcoId: $scope.procedure.OPCO_ID}
			}).then(function (response) {
				$scope.schedules = response.data;
			}, function (err) {
				// handle error
				console.log(err);
			});

	  }	  
	  else if ($stateParams.procedureId === 'newControl') {
	  	$scope.procedure.TYPE = 'C';
	  	$scope.procedure.TYPE_TEXT = 'Control';
	  	$scope.procedure.STATUS_CODE = 'A';
	  	$scope.procedure.CONTROL_TYPE = 'Reconciliation';
	  	$scope.procedure.OPCO_ID = $scope.entry.currentUser.userOpcoId;
	  	$scope.procedure.START_DATE = null;
	  	$scope.procedure.LAST_REVIEW_DATE = null;
	  	$scope.procedure.END_DATE = null;

			// Get subtypes list
			$http({
				method: 'GET',
				url: '/api/dfl-procedures/getProcedureSubTypesList',
				params: {opcoId: $scope.entry.currentUser.userOpcoId, type: $scope.procedure.TYPE}
			}).then(function (response) {
				$scope.subTypes = response.data;
			}, function (err) {
				// handle error
				console.log(err);
			});

		  // Get schedules
			$http({
				method: 'GET',
				url: '/api/dfl-procedures/getSchedules',
				params: {opcoId: $scope.procedure.OPCO_ID}
			}).then(function (response) {
				$scope.schedules = response.data;
			}, function (err) {
				// handle error
				console.log(err);
			});

	  }
		else if ($stateParams.procedureId === 'newReport') {
	  	$scope.procedure.TYPE = 'S';
	  	$scope.procedure.TYPE_TEXT = 'Report solution';
	  	$scope.procedure.STATUS_CODE = 'A';
	  	$scope.procedure.SOX_RELEVANT = 'N';
	  	$scope.procedure.OPCO_ID = $scope.entry.currentUser.userOpcoId;

			// Get subtypes list
			$http({
				method: 'GET',
				url: '/api/dfl-procedures/getProcedureSubTypesList',
				params: {opcoId: $scope.entry.currentUser.userOpcoId, type: $scope.procedure.TYPE}
			}).then(function (response) {
				$scope.subTypes = response.data;
			}, function (err) {
				// handle error
				console.log(err);
			});

		  // Get schedules
			$http({
				method: 'GET',
				url: '/api/dfl-procedures/getSchedules',
				params: {opcoId: $scope.procedure.OPCO_ID}
			}).then(function (response) {
				$scope.schedules = response.data;
			}, function (err) {
				// handle error
				console.log(err);
			});
	  }	  
	  else {
			$http({
				method: 'GET',
				url: '/api/dfl-procedures/getProcedure',
				params: {procedureId: $stateParams.procedureId}
			}).then(function (response) {
				$scope.procedure = response.data;
				// console.log($scope.procedure);

				$scope.procedure.CONTROL_ASSERTION = JSON.parse($scope.procedure.CONTROL_ASSERTION);
				$scope.procedure.START_DATE = ($scope.procedure.START_DATE?moment($scope.procedure.START_DATE).toDate():null);
				$scope.procedure.END_DATE = ($scope.procedure.END_DATE?moment($scope.procedure.END_DATE).toDate():null);
				$scope.procedure.LAST_REVIEW_DATE = ($scope.procedure.LAST_REVIEW_DATE?moment($scope.procedure.LAST_REVIEW_DATE).toDate():null);
				$scope.procedure.BUSINESS_ASSURANCE_DOMAIN = JSON.parse($scope.procedure.BUSINESS_ASSURANCE_DOMAIN);

        $scope.activeBAs = JSON.stringify(_.keys(_.pick($scope.procedure.BUSINESS_ASSURANCE_DOMAIN, function(val, key, obj) {return val == 'Y';}))).replace(/[\[|\]]/g, '').replace(/,/g, ', ');

				// if edit dato
				if ($scope.procedure.TYPE === 'T') {
			    Dato.getNotLinkedDatos($scope.entry.currentUser.userOpcoId).then(function (data) {
			      $scope.datos = data;
			      $scope.datos.push({DATO_ID:$scope.procedure.NAME});
			    });	  			
				}

    		// update elastic fields
		    setTimeout (function () {
		      $scope.$broadcast('elastic:adjust');
		    }, 500); 

				// If procedure is from another OPCO, switch selected opco and disable editing
				if (Number($scope.procedure.OPCO_ID) !== $scope.entry.currentUser.userOpcoId) {
					$scope.entry.OPCO_ID = Number($scope.procedure.OPCO_ID);
					$scope.isDisabled = $scope.entry.isDisabled();
				}

				// Get subtypes list
				$http({
					method: 'GET',
					url: '/api/dfl-procedures/getProcedureSubTypesList',
					params: {opcoId: $scope.procedure.OPCO_ID, type: $scope.procedure.TYPE}
				}).then(function (response) {
					$scope.subTypes = response.data;
				}, function (err) {
					// handle error
					console.log(err);
				});

				// Get linked datasources
				$http({
					method: 'GET',
					url: '/api/dfl-procedures/getLinkedDatasources',
					params: {procedureId: $stateParams.procedureId, getDirection: 'A'}
				}).then(function (response) {
					$scope.procedure.links = response.data;
				}, function (err) {
					// handle error
					console.log(err);
				});

        // Get coverage info
        getCoverageInfo();

				// Get schedules
				$http({
					method: 'GET',
					url: '/api/dfl-procedures/getSchedules',
					params: {opcoId: $scope.procedure.OPCO_ID}
				}).then(function (response) {
					$scope.schedules = response.data;
				}, function (err) {
					// handle error
					console.log(err);
				});
				
			}, function (err) {
				// handle error
				console.log(err);
			});
	  }
		  
		var updateProcedure = function() {
				$http({
					method: 'POST',
					url: '/api/dfl-procedures/saveProcedure',
					data: $scope.procedure
				}).then(function (response) {
					if (!response.data.success) {	
						if (response.data.error.code === 'ER_DUP_ENTRY') {
							Entry.showToast('Save failed! Procedure with the same name and type already exists');
						}
						else {
							Entry.showToast('Save failed! Error ' + JSON.stringify(response.data.error));
						}					
					}

				}, function (err) {
					console.log(err);
				});				
		};

		$scope.datoChanged = function() {

	    Dato.getDatoInfo($scope.procedure.OPCO_ID, $scope.procedure.NAME).then(function (data) {
	      //$scope.dato = data;

	      $scope.procedure.DESCRIPTION = data.DESCRIPTION;
	    });
		};

		$scope.save = function() {
			if (!$scope.datoForm.$valid) {
	       Entry.showToast('Please enter all required fields!');
			}
			else {
				$http({
					method: 'POST',
					url: '/api/dfl-procedures/saveProcedure',
					data: $scope.procedure
				}).then(function (response) {
					if (response.data.success) {	
						Entry.showToast('All changes saved!');
						$state.go('procedureTable', {opcoId: $scope.procedure.OPCO_ID});
					}
					else {

							if (response.data.error.code === 'ER_DUP_ENTRY') {
								Entry.showToast('Save failed! Procedure with the same name and type already exists.');
							}
							else {
								Entry.showToast('Save failed! Error ' + JSON.stringify(response.data.error));
							}
													
					}

				}, function (err) {
					console.log(err);
				});		
			}
		};

		$scope.cancel = function() {
			$state.go('procedureTable', {opcoId: $scope.procedure.OPCO_ID});			
		};

		$scope.clone = function(){
			$scope.procedure.NAME = $scope.procedure.NAME + '_Clone';
			delete $scope.procedure.PROCEDURE_ID;
			$scope.procedure.links = [];
			
			// for (var i = 0; i<$scope.procedure.links.length; i++) {
			// 	delete $scope.procedure.links[i].PROCEDURE_ID;
			// }
		};

		$scope.delete = function() {

			var confirmationText = 'Are you sure you want to delete procedure "';
			if ($scope.procedure.TYPE === 'T') {
				confirmationText = 'Are you sure you want to unlink dato "';
			}

			ConfirmModal(confirmationText + $scope.procedure.NAME + '" ?')
			.then(function(confirmResult) {
				if (confirmResult) {
							$http({
								method: 'DELETE',
								url: '/api/dfl-procedures/deleteProcedure',
								params: {procedureId: $stateParams.procedureId}
							}).then(function (response) {
								if (response.data.success) {	
									Entry.showToast('Procedure deleted!');
									$state.go('procedureTable', {opcoId: $scope.procedure.OPCO_ID});			
								}
								else {
										Entry.showToast('Delete failed! Error ' + JSON.stringify(response.data.error));
								}				
							}, function (err) {
								// handle error
								console.log(err);
							});
						}
			})
			.catch(function(err) {
				Entry.showToast('Delete action canceled' + err);
			});   

		};

		$scope.linkDatasource = function (linkDirection) {

			// Prepare array with datasourceIds that are already linked to the "linkDirection" side 
			var hideDatasources = _.pluck(_.filter($scope.procedure.links, function(item) {return item.DIRECTION === linkDirection ;}), 'DATASOURCE_ID');

	    dflLinkDatasourceModal(hideDatasources).then(function (datasourceId) {
				$http({
					method: 'GET',
					url: '/api/dfl-datasources/getDatasource',
					params: {datasourceId: datasourceId}
				}).then(function (response) {
					var newLinkedDatasource = {};
					newLinkedDatasource = response.data;
		      newLinkedDatasource.PROCEDURE_ID = $scope.procedure.PROCEDURE_ID;
		      newLinkedDatasource.DIRECTION = linkDirection;
		      $scope.procedure.links.push(newLinkedDatasource);
		      
		      // Save datasource links if procedure update (not new or clone)
					if ($scope.procedure.PROCEDURE_ID) {
						updateProcedure();
	    			Entry.showToast('' + newLinkedDatasource.TYPE_TEXT +  ' "' + newLinkedDatasource.NAME + '" linked to ' + (linkDirection === 'I'?'Input':'Output') + '! All changes saved!'); 
					}
					else {
	    			Entry.showToast('' + newLinkedDatasource.TYPE_TEXT +  ' "' + newLinkedDatasource.NAME + '" linked to ' + (linkDirection === 'I'?'Input':'Output') + '! Changes need to be explicitely saved!'); 
					}

				}, function (err) {
					// handle error
					console.log(err);
				});
	    }).catch(function (err) {
	    	Entry.showToast('Error ' + err); 
	    });

		};

		$scope.unlinkDatasource = function(datasourceId, linkDirection) {
			// $scope.procedure.unlinks.push(_.filter($scope.procedure.links, function(item) {return item.DATASOURCE_ID == datasourceId && item.DIRECTION == linkDirection;}));

				$http({
					method: 'GET',
					url: '/api/dfl-datasources/getDatasource',
					params: {datasourceId: datasourceId}
				}).then(function (response) {
					
					var newUnLinkedDatasource = {};
					newUnLinkedDatasource = response.data;
					$scope.procedure.links = _.reject($scope.procedure.links, function(item) {return item.DATASOURCE_ID == datasourceId && item.DIRECTION == linkDirection;});
		      
		      // Save datasource links if procedure update (not new or clone)
					if ($scope.procedure.PROCEDURE_ID) {
						updateProcedure();
	    			Entry.showToast('' + newUnLinkedDatasource.TYPE_TEXT +  ' "' + newUnLinkedDatasource.NAME + '" un-linked from ' + (linkDirection === 'I'?'Input':'Output') + '! . All changes saved!'); 
					}
					else {
	    			Entry.showToast('' + newUnLinkedDatasource.TYPE_TEXT +  ' "' + newUnLinkedDatasource.NAME + '" un-linked from ' + (linkDirection === 'I'?'Input':'Output') + '! . Changes need to be explicitely saved!'); 
					}

				}, function (err) {
					// handle error
					console.log(err);
				});		
		};

		$scope.normalizeName = function(){
			$scope.procedure.NAME = $scope.procedure.NAME && $scope.procedure.NAME.replace(' ', '_');
		};

		$scope.getColor = function(str) {
			var colorHash = new window.ColorHash();
			return colorHash.hex(str);
		};

		$scope.riskNodeClick = function(riskNode) {
			$state.go('riskNodeTable', {productSegmentId: riskNode.PRODUCT_SEGMENT_ID, riskId: riskNode.RISK_ID, tabId: riskNode.active}, {reload: true});
		};

		$scope.riskNodeMappingDelete = function(riskNode) {
			// console.log('Risk Node:' + riskNode.RISK_NODE_ID, 'ControlID:' + $scope.procedure.CVG_CONTROL_ID);

			// ConfirmModal('Remove control "' + $scope.procedure.CONTROL_NAME + '" from risk node ' + riskNode.RISK_NODE_ID + ' ?')
			// .then(function(confirmResult) {
			// 	if (confirmResult) {
					$http({
						method: 'DELETE',
						url: '/api/dfl-procedures/riskNodeMappingDelete',
						params: {riskNodeId: riskNode.RISK_NODE_ID, controlId: $scope.procedure.CVG_CONTROL_ID}
					}).then(function (response) {
						if (response.data.success) {
							$scope.coverage = _.reject($scope.coverage, function(item) {
								return item.RISK_NODE_ID == riskNode.RISK_NODE_ID;
							});

              Entry.showToast('Control mapping removed. All changes saved!');
              getCoverageInfo();
						}
						else {
							Entry.showToast('Delete failed! Error ' + JSON.stringify(response.data.error));
						}				
					}, function (err) {
						// handle error
						console.log(err);
					});
			// 	}
			// })
			// .catch(function(err) {
			// 	Entry.showToast('Delete action canceled' + err);
			// });  

		};

		$scope.cloneControlToProductSegment = function(riskNode, hideRiskNodes) {
			var procedure = $scope.procedure;

			var linkControlCtrl = function($scope, $uibModalInstance, $http, hideRiskNodes, $filter, $timeout) {
				$scope.controls = [];
        $scope.loadFinished = false;
        $scope.parentRiskNode = riskNode;
	
				var loadData = function(){
					Coverage.getProductSegmentsForControlClone(procedure.OPCO_ID, riskNode.RISK_ID, riskNode.SYSTEM_ID)
					  .then(function(data){

						// Remove all items from returned list that are passed in hideRiskNodes array
						if (typeof hideRiskNodes !== 'undefined' && hideRiskNodes.length) {
							_.each(hideRiskNodes, function(hideRiskNode){
								data = _.reject(data, function(item) {
									return (item.PRODUCT_SEGMENT_ID == hideRiskNode.PRODUCT_SEGMENT_ID && riskNode.RISK_ID == hideRiskNode.RISK_ID) || !item.PRODUCT_SEGMENT_ID || !item.PS_HAS_RISK_AND_SYSTEM_FLAG;});
							});
						}

						$scope.productSegments = data;

						$scope.lobs = _.map(_.groupBy(data, 'LOB'), function(g) {
						  return { 
							  LOB: _.reduce(g, function(m,x) { return x.LOB; }, 0),
							  LOB_COUNT: _.reduce(g, function(m,x) { return m + 1; }, 0),
							  PS_VALUE: _.reduce(g, function(m,x) { return m + Math.abs(x.PS_VALUE); }, 0),
							  PS_TOTAL_VALUE_RATIO: _.reduce(g, function(m,x) { return m + x.PS_TOTAL_VALUE_RATIO; }, 0),
							  RISK_COUNT: _.reduce(g, function(m,x) { return m + x.RISK_COUNT; }, 0),
							  COVERAGE: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.PS_LOB_VALUE_RATIO/100; }, 0),
							  MEASURE_COVERAGE: _.reduce(g, function(m,x) { return m + x.MEASURE_COVERAGE; }, 0),
							};
						});
			  
						var total = _.map(_.groupBy(data, 'OPCO_ID'), function(g) {
						  return { 
							  LOB: _.reduce(g, function(m,x) { return 0; }, 0),
							  LOB_COUNT: _.reduce(g, function(m,x) { return m + 1; }, 0),
							  PS_VALUE: _.reduce(g, function(m,x) { return m + Math.abs(x.PS_VALUE); }, 0),
							  PS_TOTAL_VALUE_RATIO: _.reduce(g, function(m,x) { return m + x.PS_TOTAL_VALUE_RATIO; }, 0),
							  RISK_COUNT: _.reduce(g, function(m,x) { return m + x.RISK_COUNT; }, 0),
							  COVERAGE: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.PS_TOTAL_VALUE_RATIO/100; }, 0),
							  MEASURE_COVERAGE: _.reduce(g, function(m,x) { return m + x.MEASURE_COVERAGE; }, 0),
							};
						});
						$scope.lobs.push(total[0]);
			  
						$scope.productGroups = _.map(_.groupBy(data, 'PRODUCT_GROUP_ID'), function(g) {
						  return { 
							  LOB: _.reduce(g, function(m,x) { return x.LOB; }, 0),
							  PRODUCT_GROUP: _.reduce(g, function(m,x) { return x.PRODUCT_GROUP; }, 0),
							  PRODUCT_GROUP_ID: _.reduce(g, function(m,x) { return x.PRODUCT_GROUP_ID; }, 0),
							  LOB_COUNT: _.reduce(g, function(m,x) { return m + 1; }, 0),
							  PS_VALUE: _.reduce(g, function(m,x) { return m + Math.abs(x.PS_VALUE); }, 0),
							  PS_TOTAL_VALUE_RATIO: _.reduce(g, function(m,x) { return m + x.PS_TOTAL_VALUE_RATIO; }, 0),
							  RISK_COUNT: _.reduce(g, function(m,x) { return m + x.RISK_COUNT; }, 0),
							  COVERAGE: _.reduce(g, function(m,x) { return m + x.COVERAGE * x.PS_GROUP_VALUE_RATIO/100; }, 0),
							  MEASURE_COVERAGE: _.reduce(g, function(m,x) { return m + x.MEASURE_COVERAGE; }, 0),
							};
						});
			  
						if (_.size($scope.entry.searchProductSegment) > 0) {
						  $scope.filteredProductSegments = $filter('filter') ($scope.productSegments, $scope.entry.searchProductSegment);
						  $scope.groupFilteredProductSegments = _.groupBy($scope.filteredProductSegments, 'PRODUCT_GROUP_ID');          
						}
						else {
						  $scope.filteredProductSegments = $scope.productSegments;
						  $scope.groupFilteredProductSegments = _.groupBy($scope.filteredProductSegments, 'PRODUCT_GROUP_ID');          
						}
			  
					});
				  };
				  loadData();
			  
				$scope.selectProductSegment = function(ps) {
					if (ps.SELECTED === 'Y') {
						ps.SELECTED = 'N';
					}
					else {
						ps.SELECTED = 'Y';
					}
					$scope.updateSelected();
				};

				$scope.updateSelected = function() {
					$scope.selectedProductSegments = _.filter($scope.productSegments, function(elem) { return elem.SELECTED == 'Y';});
				};
	
				$scope.modalCancel = function () {
					$uibModalInstance.dismiss('User cancel');
				};
	
				$scope.submitProductSegments = function (productSegments) {
					$uibModalInstance.close(productSegments);
				};
	
			};
	
			var instance = $uibModal.open({
				templateUrl: 'app/coverage/routes/productSegmentTable/clone-control-to-product-segment-modal.html',
				controller: linkControlCtrl,
				size: 'lg',
				resolve: {'hideRiskNodes' : function() { return hideRiskNodes; }}
			});
	
			instance.result.then(function(data){

				// console.log({fromControlId: procedure.CVG_CONTROL_ID, fromProductSegmentId: riskNode.PRODUCT_SEGMENT_ID, toProductSegmentId: data});

				ConfirmModal('Copy risk mapping to "' + data.length + '" selected product segments ?')
				.then(function(confirmResult) {
					if (confirmResult) {

						$http({
							method: 'POST',
							url: '/api/dfl-procedures/cvgCloneControlToProductSegment',
							data: {fromControlId: procedure.CVG_CONTROL_ID, fromRiskNodeId: riskNode.RISK_NODE_ID, toProductSegment: data}
						}).then(function (response) {
							if (response.data.success) {
								$scope.entry.showToast('Control mappings copied successfully. All changes saved!');
								$state.go('procedureInfo', {procedureId: procedure.PROCEDURE_ID}, {reload: true});
							}
							else {
								$scope.entry.showToast('Save failed! Error ' + JSON.stringify(response.data.error));
							}
						}, function (err) {
							console.log(err);
						});	

					}
				})
				.catch(function(err) {
					Entry.showToast('Delete action canceled' + err);
				});  

			});			
		};

    $scope.toggleShowBA = function () {
      $scope.showBA = !$scope.showBA;
    };

		$scope.cvgMapControlFromReference = function(procedure) {

			var linkControlCtrl = function($scope, $uibModalInstance, $http, hideControls, $filter, $timeout) {
				$scope.controls = [];
				$scope.loadFinished = false;
	
				Coverage.getControls(procedure.OPCO_ID, procedure.SYSTEM_ID).then(function(data){   
					
					// Remove all items from returned list that are passed in hideControls array
					if (typeof hideControls !== 'undefined' && hideControls.length) {
						_.each(hideControls, function(hideControl){
							data = _.reject(data, function(item) {return item.CONTROL_ID == hideControl.CVG_CONTROL_ID;});
						});
					}
	
					$scope.controls = data;
					$scope.filteredControls = $filter('filter') ($scope.controls, $scope.entry.searchControl);
					$scope.loadFinished = true;
	
					// Pagination in controller
					$scope.pageSize = 10;
					$scope.currentPage = 1;
	
				});
	
				$scope.setCurrentPage = function(currentPage) {
						$scope.currentPage = currentPage;
				};
	
				// Watch filter change
				var timeoutControlFilterChange = function(newValue, oldValue){
							// remove filters with blank values
						$scope.entry.searchControl = _.pick($scope.entry.searchControl, function(value, key, object) {
							return value !== '' && value !== null;
						});
	
						if (_.size($scope.entry.searchControl) === 0) {
							delete $scope.entry.searchControl;
						}  
							
						$timeout(function(){
							$scope.filteredControls = $filter('filter') ($scope.controls, $scope.entry.searchControl);
							$scope.currentPage = 1;
						}, 400);
				};
				$scope.$watch('entry.searchControl', timeoutControlFilterChange, true);   
	
				$scope.removeAllFilters = function () {
					delete $scope.entry.searchControl;
				};
	
				$scope.removeFilter = function (element) {
					delete $scope.entry.searchControl[element];
					if (_.size($scope.entry.searchControl) === 0) {
						delete $scope.entry.searchControl;
					}
				};
	
				$scope.modalCancel = function () {
					$uibModalInstance.dismiss('User cancel');
				};
	
				$scope.selectControl = function (control) {
					$uibModalInstance.close(control);
				};
	
			};
	
			var instance = $uibModal.open({
				templateUrl: 'app/coverage/routes/riskNodeTable/link-control-to-risk-node-modal.html',
				controller: linkControlCtrl,
				size: 'lg',
				resolve: {'hideControls' : function() { return [procedure]; }}
			});
	
			instance.result.then(function(data){

				ConfirmModal('Copy risk mapping from control "' + data.CONTROL_NAME + '" ?')
				.then(function(confirmResult) {
					if (confirmResult) {

						$http({
							method: 'POST',
							url: '/api/dfl-procedures/cvgMapControlFromReference',
							data: {fromControlId: data.CONTROL_ID, toControlId: procedure.CVG_CONTROL_ID}
						}).then(function (response) {
							if (response.data.success) {
								$scope.entry.showToast('Control mappings copied successfully. All changes saved!');
								$state.go('procedureInfo', {procedureId: procedure.PROCEDURE_ID}, {reload: true});
							}
							else {
								$scope.entry.showToast('Save failed! Error ' + JSON.stringify(response.data.error));
							}
						}, function (err) {
							console.log(err);
						});	

					}
				})
				.catch(function(err) {
					Entry.showToast('Delete action canceled' + err);
				});   


				// $timeout(function() {
				// 	// select new control
				// 	var control = _.find(riskNode.CONTROLS, function(c) { return c.CONTROL_ID == data.CONTROL_ID; } );
				// 	control.SELECTED = 'Y';
				// 	$scope.riskNodeControlCheck(control, riskNode);
				// }, 800);

			});
		};		

	    //Datepickers
	    $scope.dp = {};
	    $scope.dp.status = {opened: false};

	    $scope.dp.open = function($event) {
	      $scope.dp.status.opened = true;
	    };

	    $scope.dp.dateOptions = {
	      formatYear: 'yyyy',
	      startingDay: 1
	    };
	    
	    $scope.dp1 = {};
	    $scope.dp1.status = {opened: false};

	    $scope.dp1.open = function($event) {
	      $scope.dp1.status.opened = true;
	    };

	    $scope.dp1.dateOptions = {
	      formatYear: 'yyyy',
	      startingDay: 1
	    };
	    
	    $scope.dp2 = {};
	    $scope.dp2.status = {opened: false};

	    $scope.dp2.open = function($event) {
	      $scope.dp2.status.opened = true;
	    };

	    $scope.dp2.dateOptions = {
	      formatYear: 'yyyy',
	      startingDay: 1
	    };
	    //Datepickers 

  }
}

angular.module('amxApp')
  .component('procedureInfo', {
    templateUrl: 'app/dataflow/routes/procedureInfo/procedureInfo.html',
    controller: ProcedureInfoComponent,
    controllerAs: 'procedureInfoCtrl'
  });

})();
