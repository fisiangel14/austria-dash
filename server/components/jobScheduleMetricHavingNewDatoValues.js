var db = require("../utils/db");
var _und = require("underscore");
var async = require("async");

module.exports = function (callback){

	  console.log('Starting update.');
	  
		db.query(`	select RESULT_ID from (
								-- dato changed after last metric result - recalculate for last 90 days
						    select distinct a.RESULT_ID
						    from AMX_METRIC_RESULT a
						    join AMX_METRIC_DATO_LINK b on 1=1
						        and b.METRIC_ID = a.METRIC_ID 
						        and b.OPCO_ID = a.OPCO_ID
						    join AMX_FILE_DATO c on 1=1
						        and c.OPCO_ID = a.OPCO_ID 
						        and c.DATO_ID = b.DATO_ID 
						        and c.DATE = a.DATE
						        and c.BILL_CYCLE = a.BILL_CYCLE
						    where a.MODIFIED < c.CREATED and datediff(curdate(), a.MODIFIED) < 90
						    
						    union

						    -- metric formula changed after last metric result - recalculate for last 90 days
						    select distinct b.RESULT_ID
						    from AMX_METRIC_CATALOGUE a
						    join AMX_METRIC_RESULT b on 1=1
						        and b.METRIC_ID = a.METRIC_ID 
						        and b.OPCO_ID = a.OPCO_ID
						    where b.MODIFIED < a.MODIFIED and b.MODIFIED > a.START_DATE and datediff(curdate(), b.MODIFIED) < 90
						  ) sub`,
					[],
					function (err, results) {
			    	if (err) console.log(err);
						
				    async.forEach(results,
				    	function(result, callback) {
			    			db.query("update AMX_METRIC_RESULT set RECALCULATE = 'Y' where RESULT_ID = ?",
			    				[result.RESULT_ID],
			    				function (err, row) {
			    					if (err) {
			    						console.log(err);
			    					}
			    					callback();
			    				});
				    	},
				    	// Finalize
				    	function () { 
	  						console.log('Update finished!');
								callback({result: true});
				    	}
				    );
					});


	};