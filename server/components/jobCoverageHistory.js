var db = require("../utils/db");
var _und = require("underscore");
var async = require("async");


module.exports = function (callback){

	console.log('Starting jobCoverageHistory');

	async.series([
		function(cb) {
			console.log('Starting cvgRefreshControlCoverageAll');
			db.query('call cvgRefreshControlCoverageAll',
						[],
						function (err, row) {
							if (err) {
								console.log(err);
								cb(err);
							}
							else {
								console.log('Done');
								cb(null);
							}
						}
			);
		},		  
		function(cb) {
			console.log('Starting cvgRefreshRiskNodeCoverageAll...');
			db.query('call cvgRefreshRiskNodeCoverageAll',
			[],
			function (err, row) {
				if (err) {
								console.log(err);
								cb(err);
							}
							else {
								console.log('Done');
								cb(null)
							}
						}
						);
					},		  
		function(cb) {
			console.log('Starting CVG_HISTORY insert...');
			db.query(`	insert into CVG_HISTORY
						select 
							current_date() SNAPSHOT_DATE,
							pg.PRODUCT_GROUP_ID,
							ps.OPCO_ID, 
							pg.LOB, 
							pg.PRODUCT_GROUP, 
							ps.PRODUCT_SEGMENT_ID, 
							ps.PRODUCT_SEGMENT, 
							ps.VALUE PS_VALUE, 
							case when ifnull(cvgGetTotalOpcoValue(ps.OPCO_ID), 0) != 0 then abs(ps.VALUE) / cvgGetTotalOpcoValue(ps.OPCO_ID) * 100 else 0 end PS_TOTAL_VALUE_RATIO, 
							case when ifnull(cvgGetOpcoLobValue(ps.OPCO_ID, pg.LOB), 0) != 0 then abs(ps.VALUE) / cvgGetOpcoLobValue(ps.OPCO_ID, pg.LOB) * 100 else 0 end PS_LOB_VALUE_RATIO,
							case when ifnull(cvgGetProductGroupValue(ps.OPCO_ID, pg.PRODUCT_GROUP_ID), 0) then abs(ps.VALUE) / cvgGetProductGroupValue(ps.OPCO_ID, pg.PRODUCT_GROUP_ID) * 100 else 0 end PS_GROUP_VALUE_RATIO,
							cvgGetProductSegmentRiskCount(ps.PRODUCT_SEGMENT_ID) RISK_COUNT,
							cvgGetProductSegmentRPN(ps.PRODUCT_SEGMENT_ID) RPN_COUNT,
							cvgGetProductSegmentControlCount(ps.PRODUCT_SEGMENT_ID) CONTROL_COUNT,                
							cvgGetProductSegmentCoverage(ps.PRODUCT_SEGMENT_ID) COVERAGE
						from CVG_PRODUCT_GROUP pg 
						left join CVG_PRODUCT_SEGMENT ps on ps.PRODUCT_GROUP_ID = pg.PRODUCT_GROUP_ID
						where ps.OPCO_ID is not null
						order by pg.LOB, pg.PRODUCT_GROUP, ps.PRODUCT_SEGMENT`, 
						[],
						function (err, row) {
							if (err) {
								console.log(err);
								cb(err);
							}
							else {
								console.log('Done');
								cb(null);
							}
						}
			);
		}
	],
	function(err, results) {
		if (err) {
			console.log(err);
			callback({result: false});
		}
		else {
			console.log('Finished without errors');
			callback({result: true});
		}
	});

};