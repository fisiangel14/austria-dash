/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/datos              ->  index
 */

'use strict';

var db = require("../../utils/db");
var _und = require("underscore");
var async = require("async");

// Gets a list of Datos
export function getApiEndpoint(req, res, next) {

  if (req.params.apiEndpoint === "getAllDatos") {
    if (req.query.opcoId === '0') {
      db.query('SELECT * FROM AMX_DATO_CATALOGUE ORDER BY dato_id', 
        function(err, row) {
          if(err !== null) {
            console.log(err);
            next(err);
          }
          else {
            res.json(row);
          }
      });
    }
    else {
      db.query('SELECT * FROM AMX_DATO_CATALOGUE where OPCO_ID = ? ORDER BY dato_id', 
        [req.query.opcoId],
        function(err, row) {
          if(err !== null) {
            console.log(err);
            next(err);
          }
          else {
            res.json(row);
          }
      });
    }  

  }

  if (req.params.apiEndpoint === "getNotLinkedDatos") {
    if (req.query.opcoId === '0') {
      db.query('SELECT distinct DATO_ID FROM AMX_DATO_CATALOGUE ORDER BY dato_id', 
        function(err, row) {
          if(err !== null) {
            console.log(err);
            next(err);
          }
          else {
            res.json(row);
          }
      });
    }
    else {
      db.query(`SELECT distinct DATO_ID FROM AMX_DATO_CATALOGUE 
                  where OPCO_ID = ? 
                  and DATO_ID not in (select name from dfl_procedure where type = 'T' and OPCO_ID = ?) 
                  and RELEVANT = 'Y'
                ORDER BY dato_id`, 
        [req.query.opcoId, req.query.opcoId],
        function(err, row) {
          if(err !== null) {
            console.log(err);
            next(err);
          }
          else {
            res.json(row);
          }
      });
    }  

  }

  if (req.params.apiEndpoint === "getDatoInfo") {	
    db.query("select * from AMX_DATO_CATALOGUE where OPCO_ID = ? and DATO_ID = ?", [req.query.opcoId, req.query.datoId], function(err, row) {
      if(err !== null) {
        console.log(err);
        next(err);
      }
      else {
        res.json(row[0]);
      }
    });
  }

  if (req.params.apiEndpoint === "getDatoLayout") {
    db.query("select * from AMX_DATO_LAYOUT where OPCO_ID = ? and DATO_ID = ? order by LOB_ID, TECHNOLOGY_ID, SERVICE_ID", 
      [req.query.opcoId, req.query.datoId], function(err, row) {
      if(err !== null) {
        console.log(err);
        next(err);
      }
      else {
        res.json(row);
      }
    });	
  }
}

export function postApiEndpoint(req, res, next) {

  //not relevant ?
  if (req.params.apiEndpoint === "postDatoChangeRequest") {
    db.query("insert into AMX_DATO_CHANGE (DATO_ID, NAME, AREA_ID, DESCRIPTION, RELEVANT, FREQUENCY, OPCO_ID, IMPLEMENTED, NOTES, CHANGE_NOTES, START_DATE, REQUESTOR, CHANGE_LOG, CHANGE_TYPE) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", 
              [ req.body.DATO_ID,
                req.body.NAME,
                req.body.AREA_ID,
                req.body.DESCRIPTION,
                req.body.RELEVANT,
                req.body.FREQUENCY,
                req.body.OPCO_ID,
                req.body.IMPLEMENTED,
                req.body.NOTES,
                req.body.CHANGE_NOTES,
                req.body.START_DATE,
                req.body.REQUESTOR,
                req.body.CHANGE_LOG,
                req.body.CHANGE_TYPE],
    function (err, row) {
      if(err !== null) {
        console.log(err);
        res.json({success: false, error: err});
      }
      else {
        res.json({success: true});
      }
    });
  }

  if (req.params.apiEndpoint === "postDatoFlashUpdate") {
    db.query("update AMX_DATO_CATALOGUE set IMPLEMENTED = ?, NOTES = ?, UNIT=? where DATO_ID = ? and OPCO_ID =?", 
      [req.body.IMPLEMENTED, req.body.NOTES, req.body.UNIT, req.body.DATO_ID, req.body.OPCO_ID], 
      function (err, row) {
        if(err !== null) {
          console.log(err);
          res.json({success: false, error: err});
        }
        else {
          res.json({success: true});
        }
      });
  }

  if (req.params.apiEndpoint === "postLayoutFlashUpdate") {

    //var stmt = db.prepare("update AMX_DATO_LAYOUT set SYSTEM_ID = ?, CONTACT_ID = ?, DELAY = ? where LAYOUT_ID = ? and (ifnull(SYSTEM_ID, 0) != ifnull(?, 0) or ifnull(CONTACT_ID, 0) != ifnull(?, 0) or ifnull(DELAY, 0) != ifnull(?, 0))");

    // _und.each(req.body, function (element, index, list) {
    //   db.query('update AMX_DATO_LAYOUT set SYSTEM_ID = ?, CONTACT_ID = ?, DELAY = ? where LAYOUT_ID = ? and (ifnull(SYSTEM_ID, 0) != ifnull(?, 0) or ifnull(CONTACT_ID, 0) != ifnull(?, 0) or ifnull(DELAY, 0) != ifnull(?, 0))', 
    //     [element.SYSTEM_ID, element.CONTACT_ID, element.DELAY, element.LAYOUT_ID, element.SYSTEM_ID, element.CONTACT_ID, element.DELAY],
    //     function(err, row) {
    //       if (err) console.log(err);
    //     });
    // });

    async.each(req.body, function (element, callback) {
      db.query('update AMX_DATO_LAYOUT set SYSTEM_ID = ?, CONTACT_ID = ?, DELAY = ? where LAYOUT_ID = ? and (ifnull(SYSTEM_ID, 0) != ifnull(?, 0) or ifnull(CONTACT_ID, 0) != ifnull(?, 0) or ifnull(DELAY, 0) != ifnull(?, 0))', 
        [element.SYSTEM_ID, element.CONTACT_ID, element.DELAY, element.LAYOUT_ID, element.SYSTEM_ID, element.CONTACT_ID, element.DELAY],
        function(err, row) {
          if (err) {console.log(err);}
          callback();
        });
    },
    // done 
    function () {
      res.json({success: true});
    });


  }

}

export function deleteApiEndpoint(req, res, next) {
  if (req.params.apiEndpoint === "deleteLayout") {
    db.query("delete from amx_dato_layout where layout_id = ?", 
      [req.query.id], function (err, row) {
      if(err !== null) {
        console.log(err);
        res.json({success: false, error: err});
      }
      else {
        res.json({success: true});
      }
    });
  }	
}

