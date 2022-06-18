var db = require("../utils/db");
var _und = require("underscore");
var async = require("async");

module.exports = function (callback){

	  console.log('Starting update.');
		var myRe = /#([0-9]{3})/g;

	  	db.query("select METRIC_ID, OPCO_ID, FORMULA from AMX_METRIC_CATALOGUE", 
	  		function(err, results) {

	    	if (err) {
	    		console.log(err);
	    	}

		    async.forEach(results,
		    	function(req, callbackMetric) {

///

								async.series([
						      
						      // delete row
						      function (callback) {
						        db.query("delete from AMX_METRIC_DATO_LINK where OPCO_ID = ? and METRIC_ID = ?", 
						          [req.OPCO_ID, req.METRIC_ID], function (err) {
						            callback();
						        });
						      },

						      // parse formula and update AMX_METRIC_DATO_LINK 
						      function (callback) {
						        db.query("select FORMULA from AMX_METRIC_CATALOGUE where OPCO_ID = ? and METRIC_ID = ?", 
						          [req.OPCO_ID, req.METRIC_ID], 
						          function (err, row) {
						          	if (row.length > 0) {
						          		row = row[0];
						          	}
						          	else {
						          		row = {};	
						          	}

						            var myRe = /#([0-9]{3})/g;
						            var datos = [];
						            var myArray = [];
						            while ((myArray = myRe.exec(row.FORMULA)) !== null) {
						              datos.push(myArray[1]);
						            }

						            async.series([
						              
						              // insert ferEach dato in AMX_METRIC_DATO_LINK
						              function (callback) {
						                async.forEach(datos, 
						                  function (dato, callback) {
						                    db.query("replace into AMX_METRIC_DATO_LINK (OPCO_ID, METRIC_ID, DATO_ID) values (?, ?, ?)", 
						                    [req.OPCO_ID, req.METRIC_ID, dato], 
						                    function (err, row){
						                      if (err) console.log(err);
						                      callback();
						                    });
						                  }, 
						                  function(err){
						                    if (err) console.log(err);
						                    callback();
						                  }
						                ); 
						              },
						              
						              // update AMX_DATO_CATALOGUE forEach dato
						              function (callback) {
						                async.forEach(datos, 
						                  function (dato, callback) {
						                    db.query(`select 
																					  a.DATO_ID, 
																					  a.OPCO_ID, 
																					  group_concat(a.METRIC_ID order by substr(replace(a.METRIC_ID, b.AREA_ID, '000'), -3, 3) separator ', ') METRICS
																					from AMX_METRIC_DATO_LINK a
																					left join amx_metric_catalogue b on b.metric_id = a.metric_id and b.opco_id = a.opco_id
																					where a.DATO_ID=? and a.OPCO_ID=?
																					group by a.DATO_ID, a.OPCO_ID`,
						                    [dato, req.OPCO_ID],
						                    function (err, row) {
						                      if (err) {
						                      	console.log(err);
						                      }

											          	if (row.length > 0) {
											          		row = row[0];
											          	}
											          	else {
											          		row = {};	
											          	}
						                      db.query(`update AMX_DATO_CATALOGUE 
						                              set METRICS = ?
						                              where OPCO_ID = ? and DATO_ID = ?`,
						                              [row.METRICS, req.OPCO_ID, dato],
						                      function (err, row) {
						                        if (err) console.log(err);
						                        callback();
						                      });
						                    })
						                  
						                  }, 
						                  function(err){
						                    if (err) console.log(err);
						                    callback();
						                  }
						                ); 
						              },

						              // update AMX_METRIC_CATALOGUE = 1 row
						              function (callback) {
						                db.query(`select METRIC_ID, OPCO_ID, group_concat(DATO_ID order by DATO_ID separator ', ') DATOS
						                        from AMX_METRIC_DATO_LINK
						                        where OPCO_ID = ? and METRIC_ID = ? 
						                        group by METRIC_ID, OPCO_ID`, 
						                [req.OPCO_ID, req.METRIC_ID], 
						                function (err, row) {
									          	if (row.length > 0) {
									          		row = row[0];
									          	}
									          	else {
									          		row = {};	
									          	}

						                  db.query(`update AMX_METRIC_CATALOGUE 
						                          set DATOS = ?
						                          where OPCO_ID = ? and METRIC_ID = ?`,
						                          [row.DATOS, req.OPCO_ID, req.METRIC_ID],
						                  function (err, row) {
						                    if (err) console.log(err);
						                    callback();
						                  });
						                });
						              }
						            ],
						            function() {
						              callback();
						            }); // nested async series end
						        });
						      }],

						      //Finally 
						      function(datos) {
						        callbackMetric(); 
						      }); // main async series end

///
		    	},
		    	// Finalize
		    	function () { 
		    		console.log('Update finished.')
						callback({result: true});
		    	}
		    ); // end:async
	  	});
	};