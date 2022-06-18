/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/changes              ->  index
 */

'use strict';

var db = require("../../utils/db");
var _und = require("underscore");
var moment = require('moment');
var mailer = require("../../utils/mailer");

// var async = require("async");

export function getApiEndpoint(req, res, next) {
  if (req.params.apiEndpoint === "getChangeRequests") {

    if (req.query.opcoId === '0') {
      db.query("select * from AMX_CHANGE_REQUEST where ARCHIVED = ? order by case when STATUS = 'Requested' then 1 else 2 end, CREATED desc",
        [req.query.archive],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            next(err);
          } else {
            res.json(row);
          }
        });
    } else {
      db.query("select * from AMX_CHANGE_REQUEST where OPCO_ID = ? and ARCHIVED = ? order by case when STATUS = 'Requested' then 1 else 2 end, CREATED desc",
        [req.query.opcoId, req.query.archive],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            next(err);
          } else {
            res.json(row);
          }
        });
    }

  }

  if (req.params.apiEndpoint === "getChangeRequestsForObject") {
    if (req.query.objectType === 'M') {
      db.query(`
						select distinct c.* from amx_metric_dato_link l
						join AMX_CHANGE_REQUEST c on c.opco_id = l.opco_id and c.OBJECT_ID in (l.metric_id, l.dato_id)
						where 1=1
							and l.OPCO_ID = ? 
						    and l.metric_id = ? 
						order by change_type desc, case when STATUS = 'Requested' then 1 else 2 end, c.CREATED desc      	
      	`,
        [req.query.opcoId, req.query.objectId],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            next(err);
          } else {
            res.json(row);
          }
        });
    } else {
      db.query("select * from AMX_CHANGE_REQUEST where OPCO_ID = ? and OBJECT_ID = ? order by case when STATUS = 'Requested' then 1 else 2 end, CREATED desc",
        [req.query.opcoId, req.query.objectId],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            next(err);
          } else {
            res.json(row);
          }
        });
    }

  }

}

export function postApiEndpoint(req, res, next) {
  var io = req.app.get('socketio');

  if (req.params.apiEndpoint === "postChangeRequest") {
    db.query("insert into AMX_CHANGE_REQUEST (OPCO_ID, CHANGE_TYPE, OBJECT_ID, OLD_OBJECT, NEW_OBJECT, CHANGES, REQUESTOR, APPROVER, STATUS, REQUESTOR_COMMENT) values (?,?,?,?,?,?,?,?,?,?)",
      [req.body.OPCO_ID,
        req.body.CHANGE_TYPE,
        req.body.OBJECT_ID,
        req.body.OLD_OBJECT,
        req.body.NEW_OBJECT,
        req.body.CHANGES,
        req.body.REQUESTOR,
        req.body.APPROVER,
        req.body.STATUS,
        req.body.REQUESTOR_COMMENT
      ],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit('counters:update:' + req.body.OPCO_ID);
          // Send mail
          mailer.sendMail(req.body.OPCO_ID, ['Group.Revenue.Assurance@a1.group'], moment().format("DD.MM.YYYY HH:mm:ss"), 'Info', 'CHANGE', 'Change request - ' + req.body.CHANGE_TYPE + ' ' + req.body.OBJECT_ID, '<b>Requested by: </b> ' + req.body.REQUESTOR + '<br>' + '<b>Changes: </b> ' + req.body.CHANGES + '<br>' + '<b>Requestor comment: </b> ' + req.body.REQUESTOR_COMMENT, 'http://vlreaap001.at.inside:9000/#/change-requests?archive=N&opcoId=' + req.body.OPCO_ID);

          res.json({
            success: true
          });
        }
      });
  }

  if (req.params.apiEndpoint === "approveChangeRequest") {
    //var newObj = req.body.NEW_OBJECT;

    if (req.body.CHANGE_TYPE === 'New dato') {
      //Insert into DATO catalogue
      db.query(`insert into AMX_DATO_CATALOGUE (DATO_ID, NAME, AREA_ID, METRICS, DESCRIPTION, RELEVANT, FREQUENCY, OPCO_ID, IMPLEMENTED, NOTES, START_DATE, END_DATE, AUTO_LAYOUT, NULLABLE, UNIT, PROCEDURE_ID) 
	      					values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [req.body.NEW_OBJECT.DATO_ID,
          req.body.NEW_OBJECT.NAME,
          req.body.NEW_OBJECT.AREA_ID,
          req.body.NEW_OBJECT.METRICS,
          req.body.NEW_OBJECT.DESCRIPTION,
          req.body.NEW_OBJECT.RELEVANT,
          req.body.NEW_OBJECT.FREQUENCY,
          req.body.NEW_OBJECT.OPCO_ID,
          req.body.NEW_OBJECT.IMPLEMENTED,
          req.body.NEW_OBJECT.NOTES,
          req.body.NEW_OBJECT.START_DATE ? moment(req.body.NEW_OBJECT.START_DATE).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.NEW_OBJECT.END_DATE ? moment(req.body.NEW_OBJECT.END_DATE).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.NEW_OBJECT.AUTO_LAYOUT,
          req.body.NEW_OBJECT.NULLABLE,
          req.body.NEW_OBJECT.UNIT,
          req.body.NEW_OBJECT.PROCEDURE_ID
        ],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            res.json({
              success: false,
              error: err
            });
          } else {
            //If success - update change request fileds
            db.query("update AMX_CHANGE_REQUEST set STATUS=?, APPROVER=?, APPROVER_COMMENT=? where CHANGE_ID=?",
              [req.body.STATUS,
                req.body.APPROVER,
                req.body.APPROVER_COMMENT,
                req.body.CHANGE_ID
              ],
              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  res.json({
                    success: false,
                    error: err
                  });
                } else {
                  io.emit('counters:update:' + req.body.OPCO_ID);
                  // Send mail
                  mailer.sendMail(req.body.OPCO_ID, ['Group.Revenue.Assurance@a1.group'], moment().format("DD.MM.YYYY HH:mm:ss"), 'Info', 'CHANGE', 'Change APPROVED - ' + req.body.CHANGE_TYPE + ' ' + req.body.OBJECT_ID, '<b>Requested by: </b> ' + req.body.REQUESTOR + '<br>' + '<b>Changes: </b> ' + JSON.stringify(req.body.CHANGES) + '<br>' + '<b>Requestor comment: </b> ' + req.body.REQUESTOR_COMMENT + '<br>' + '<br>' + '<b>Approver: </b> ' + req.body.APPROVER + '<br>' + '<b>Approver comment: </b> ' + req.body.APPROVER_COMMENT, 'http://vlreaap001.at.inside:9000/#/change-requests?archive=N&opcoId=' + req.body.OPCO_ID);
                  res.json({
                    success: true
                  });
                }
              });
          }
        }); //end "New dato" insert 

    } else if (req.body.CHANGE_TYPE === 'Edit dato') {
      //Insert into DATO catalogue
      db.query(`update AMX_DATO_CATALOGUE 
	      					set NAME=?, AREA_ID=?, METRICS=?, DESCRIPTION=?, RELEVANT=?, FREQUENCY=?, IMPLEMENTED=?, NOTES=?, START_DATE=?, END_DATE=?, AUTO_LAYOUT=?, NULLABLE=?, UNIT=?, PROCEDURE_ID=?
	      					where DATO_ID=? and OPCO_ID=?`,
        [
          req.body.NEW_OBJECT.NAME,
          req.body.NEW_OBJECT.AREA_ID,
          req.body.NEW_OBJECT.METRICS,
          req.body.NEW_OBJECT.DESCRIPTION,
          req.body.NEW_OBJECT.RELEVANT,
          req.body.NEW_OBJECT.FREQUENCY,
          req.body.NEW_OBJECT.IMPLEMENTED,
          req.body.NEW_OBJECT.NOTES,
          req.body.NEW_OBJECT.START_DATE ? moment(req.body.NEW_OBJECT.START_DATE).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.NEW_OBJECT.END_DATE ? moment(req.body.NEW_OBJECT.END_DATE).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.NEW_OBJECT.AUTO_LAYOUT,
          req.body.NEW_OBJECT.NULLABLE,
          req.body.NEW_OBJECT.UNIT,
          req.body.NEW_OBJECT.PROCEDURE_ID,

          req.body.NEW_OBJECT.DATO_ID,
          req.body.NEW_OBJECT.OPCO_ID
        ],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            res.json({
              success: false,
              error: err
            });
          } else {
            //If success - update change request fileds
            db.query("update AMX_CHANGE_REQUEST set STATUS=?, APPROVER=?, APPROVER_COMMENT=? where CHANGE_ID=?",
              [req.body.STATUS,
                req.body.APPROVER,
                req.body.APPROVER_COMMENT,
                req.body.CHANGE_ID
              ],
              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  res.json({
                    success: false,
                    error: err
                  });
                } else {
                  io.emit('counters:update:' + req.body.OPCO_ID);
                  // Send mail
                  mailer.sendMail(req.body.OPCO_ID, ['Group.Revenue.Assurance@a1.group'], moment().format("DD.MM.YYYY HH:mm:ss"), 'Info', 'CHANGE', 'Change APPROVED - ' + req.body.CHANGE_TYPE + ' ' + req.body.OBJECT_ID, '<b>Requested by: </b> ' + req.body.REQUESTOR + '<br>' + '<b>Changes: </b> ' + JSON.stringify(req.body.CHANGES) + '<br>' + '<b>Requestor comment: </b> ' + req.body.REQUESTOR_COMMENT + '<br>' + '<br>' + '<b>Approver: </b> ' + req.body.APPROVER + '<br>' + '<b>Approver comment: </b> ' + req.body.APPROVER_COMMENT, 'http://vlreaap001.at.inside:9000/#/change-requests?archive=N&opcoId=' + req.body.OPCO_ID);
                  res.json({
                    success: true
                  });
                }
              });
          }
        }); //end "Edit dato" insert 

    } else if (req.body.CHANGE_TYPE === 'New metric') {
      //Insert into METRIC catalogue
      db.query(`insert into AMX_METRIC_CATALOGUE (METRIC_ID, AREA_ID, NAME, DESCRIPTION, FORMULA, OBJECTIVE, TOLERANCE, DATOS, FREQUENCY, OPCO_ID, RELEVANT, START_DATE, END_DATE, TREND, NOTES, IMPLEMENTED) 
	      					values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          req.body.NEW_OBJECT.METRIC_ID,
          req.body.NEW_OBJECT.AREA_ID,
          req.body.NEW_OBJECT.NAME,
          req.body.NEW_OBJECT.DESCRIPTION,
          req.body.NEW_OBJECT.FORMULA,
          req.body.NEW_OBJECT.OBJECTIVE,
          req.body.NEW_OBJECT.TOLERANCE,
          req.body.NEW_OBJECT.DATOS,
          req.body.NEW_OBJECT.FREQUENCY,
          req.body.NEW_OBJECT.OPCO_ID,
          req.body.NEW_OBJECT.RELEVANT,
          req.body.NEW_OBJECT.START_DATE ? moment(req.body.NEW_OBJECT.START_DATE).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.NEW_OBJECT.END_DATE ? moment(req.body.NEW_OBJECT.END_DATE).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.NEW_OBJECT.TREND,
          req.body.NEW_OBJECT.NOTES,
          req.body.NEW_OBJECT.IMPLEMENTED
        ],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            res.json({
              success: false,
              error: err
            });
          } else {
            //If success - update change request fileds
            db.query("update AMX_CHANGE_REQUEST set STATUS=?, APPROVER=?, APPROVER_COMMENT=? where CHANGE_ID=?",
              [req.body.STATUS,
                req.body.APPROVER,
                req.body.APPROVER_COMMENT,
                req.body.CHANGE_ID
              ],
              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  res.json({
                    success: false,
                    error: err
                  });
                } else {
                  io.emit('counters:update:' + req.body.OPCO_ID);
                  mailer.sendMail(req.body.OPCO_ID, ['Group.Revenue.Assurance@a1.group'], moment().format("DD.MM.YYYY HH:mm:ss"), 'Info', 'CHANGE', 'Change APPROVED - ' + req.body.CHANGE_TYPE + ' ' + req.body.OBJECT_ID, '<b>Requested by: </b> ' + req.body.REQUESTOR + '<br>' + '<b>Changes: </b> ' + JSON.stringify(req.body.CHANGES) + '<br>' + '<b>Requestor comment: </b> ' + req.body.REQUESTOR_COMMENT + '<br>' + '<br>' + '<b>Approver: </b> ' + req.body.APPROVER + '<br>' + '<b>Approver comment: </b> ' + req.body.APPROVER_COMMENT, 'http://vlreaap001.at.inside:9000/#/change-requests?archive=N&opcoId=' + req.body.OPCO_ID);
                  res.json({
                    success: true
                  });
                }
              });
          }
        }); //end "New metric" insert 
    } else if (req.body.CHANGE_TYPE === 'Edit metric') {
      //Insert into METRIC catalogue
      db.query(`update AMX_METRIC_CATALOGUE 
	      					set AREA_ID=?, NAME=?, DESCRIPTION=?, FORMULA=?, OBJECTIVE=?, TOLERANCE=?, DATOS=?, FREQUENCY=?, RELEVANT=?, START_DATE=?, END_DATE=?, TREND=?, NOTES=?, IMPLEMENTED=?
	      					where METRIC_ID=? and OPCO_ID=?`,
        [
          req.body.NEW_OBJECT.AREA_ID,
          req.body.NEW_OBJECT.NAME,
          req.body.NEW_OBJECT.DESCRIPTION,
          req.body.NEW_OBJECT.FORMULA,
          req.body.NEW_OBJECT.OBJECTIVE,
          req.body.NEW_OBJECT.TOLERANCE,
          req.body.NEW_OBJECT.DATOS,
          req.body.NEW_OBJECT.FREQUENCY,
          req.body.NEW_OBJECT.RELEVANT,
          req.body.NEW_OBJECT.START_DATE ? moment(req.body.NEW_OBJECT.START_DATE).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.NEW_OBJECT.END_DATE ? moment(req.body.NEW_OBJECT.END_DATE).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.NEW_OBJECT.TREND,
          req.body.NEW_OBJECT.NOTES,
          req.body.NEW_OBJECT.IMPLEMENTED,

          req.body.NEW_OBJECT.METRIC_ID,
          req.body.NEW_OBJECT.OPCO_ID,
        ],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            res.json({
              success: false,
              error: err
            });
          } else {
            //If success - update change request fileds
            db.query("update AMX_CHANGE_REQUEST set STATUS=?, APPROVER=?, APPROVER_COMMENT=? where CHANGE_ID=?",
              [req.body.STATUS,
                req.body.APPROVER,
                req.body.APPROVER_COMMENT,
                req.body.CHANGE_ID
              ],
              function (err, row) {
                if (err !== null) {
                  console.log(err);
                  res.json({
                    success: false,
                    error: err
                  });
                } else {
                  io.emit('counters:update:' + req.body.OPCO_ID);
                  mailer.sendMail(req.body.OPCO_ID, ['Group.Revenue.Assurance@a1.group'], moment().format("DD.MM.YYYY HH:mm:ss"), 'Info', 'CHANGE', 'Change APPROVED - ' + req.body.CHANGE_TYPE + ' ' + req.body.OBJECT_ID, '<b>Requested by: </b> ' + req.body.REQUESTOR + '<br>' + '<b>Changes: </b> ' + JSON.stringify(req.body.CHANGES) + '<br>' + '<b>Requestor comment: </b> ' + req.body.REQUESTOR_COMMENT + '<br>' + '<br>' + '<b>Approver: </b> ' + req.body.APPROVER + '<br>' + '<b>Approver comment: </b> ' + req.body.APPROVER_COMMENT, 'http://vlreaap001.at.inside:9000/#/change-requests?archive=N&opcoId=' + req.body.OPCO_ID);
                  res.json({
                    success: true
                  });
                }
              });
          }
        }); //end "New metric" insert 
    } else {
      res.json({
        success: false,
        error: {
          code: "Unknown change request type. I'm confused..."
        }
      });
    }

  }

  if (req.params.apiEndpoint === "rejectChangeRequest") {
    //If success - update change request fileds
    db.query("update AMX_CHANGE_REQUEST set STATUS=?, APPROVER=?, APPROVER_COMMENT=? where CHANGE_ID=?",
      [req.body.STATUS,
        req.body.APPROVER,
        req.body.APPROVER_COMMENT,
        req.body.CHANGE_ID
      ],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit('counters:update:' + req.body.OPCO_ID);
          // Send mail
          mailer.sendMail(req.body.OPCO_ID, ['Group.Revenue.Assurance@a1.group'], moment().format("DD.MM.YYYY"), 'Info', 'CHANGE', 'Change REJECTED - ' + req.body.CHANGE_TYPE + ' ' + req.body.OBJECT_ID, '<b>Requested by: </b> ' + req.body.REQUESTOR + '<br>' + '<b>Changes: </b> ' + JSON.stringify(req.body.CHANGES) + '<br>' + '<b>Requestor comment: </b> ' + req.body.REQUESTOR_COMMENT + '<br>' + '<br>' + '<b>Approver: </b> ' + req.body.APPROVER + '<br>' + '<b>Approver comment: </b> ' + req.body.APPROVER_COMMENT, 'http://vlreaap001.at.inside:9000/#/change-requests?archive=N&opcoId=' + req.body.OPCO_ID);
          res.json({
            success: true
          });
        }
      });
  }

  if (req.params.apiEndpoint === "archiveChangeRequest") {
    //If success - update change request fileds
    db.query("update AMX_CHANGE_REQUEST set ARCHIVED='Y' where CHANGE_ID=?",
      [req.body.CHANGE_ID],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          res.json({
            success: true
          });
        }
      });
  }
}
