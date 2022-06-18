var db = require("../utils/db");
var _und = require("underscore");

module.exports = function (callback){

	  console.log('Starting update.');
	  
		db.query(`update AMX_DATO_CATALOGUE
						set implemented = 'Y'
						where EXISTS (select distinct opco_id, dato_id from AMX_FILE_DATO where opco_id = AMX_DATO_CATALOGUE.OPCO_ID and dato_id = AMX_DATO_CATALOGUE.dato_id)`, 
						[],
						function (err, row) {
			      	if (err) console.log(err);
							db.query(`update AMX_DATO_CATALOGUE
											set implemented = 'N'
											where not EXISTS (select distinct opco_id, dato_id from AMX_FILE_DATO where opco_id = AMX_DATO_CATALOGUE.OPCO_ID and dato_id = AMX_DATO_CATALOGUE.dato_id)`, 
											[],
											function (err, row) {
					            	if (err) {
					            		console.log(err);
					            	}

			  								callback({result: true});
						  				}
						  );
	  });

	};