/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/incidents              ->  index
 */


'use strict';

var db = require("../../utils/db");
var _und = require("underscore");
var moment = require("moment");

export function getApiEndpoint(req, res, next) {
  if (req.params.apiEndpoint === "getAllTasks") {

    if (req.query.opcoId === '0') {
      db.query("select * from AMX_TASK order by STATUS desc, CREATED desc",
        [],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            next(err);
          } else {
            res.json(row);
          }
        });
    } else {
      db.query("select * from AMX_TASK where OPCO_ID = ? order by STATUS desc, CREATED desc",
        [req.query.opcoId],
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

  if (req.params.apiEndpoint === "getObjectTasks") {
    db.query("select * from AMX_TASK where OPCO_ID in (?) and (OBJECT_ID like ? or DEPENDENCIES like ?)",
      [
        [0, req.query.opcoId], req.query.objectId, '%' + req.query.objectId + '%'
      ],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });
  }

  if (req.params.apiEndpoint === "getTaskInfo") {
    db.query("select * from AMX_TASK where TASK_ID = ?", [req.query.taskId],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row[0]);
        }
      });
  }

  if (req.params.apiEndpoint === "getUsers") {
    db.query("select USERNAME, EMAIL, MESSAGE_EMAIL from AMX_USER where OPCO_ID = ?", [req.query.opcoId],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });
  }

  if (req.params.apiEndpoint === "getMetrics") {
    db.query("select distinct METRIC_ID OBJECT_ID from AMX_METRIC_CATALOGUE where OPCO_ID like ?", [req.query.opcoId > 0 ? req.query.opcoId : '%'],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });
  }

  if (req.params.apiEndpoint === "getDependencies") {
    if (req.query.source === 'METRIC') {
      db.query("select DATOS DEPENDENCIES from AMX_METRIC_CATALOGUE where METRIC_ID=? and OPCO_ID like ?",
        [req.query.objectId, req.query.opcoId > 0 ? req.query.opcoId : '%'],
        function (err, row) {
          if (err !== null) {
            console.log(err);
            next(err);
          } else {
            res.json(row[0]);
          }
        });
    }
  }

}

export function postApiEndpoint(req, res, next) {
  var io = req.app.get('socketio');

  if (req.params.apiEndpoint === "postTask") {
    if (typeof req.body.TASK_ID !== "undefined") {
      db.query(`update AMX_TASK set 
	    						OPCO_ID=?, 
	    						SOURCE=?, 
	    						OBJECT_ID=?, 
	    						DEPENDENCIES=?, 
	    						DESCRIPTION=?, 
	    						STATUS=?, 
	    						ASSIGNED_TO=?, 
	    						NOTE=?, 
	    						MODIFIED=?, 
	    						MODIFIED_BY=?
	    					where TASK_ID=?`,
        [req.body.OPCO_ID,
          req.body.SOURCE,
          req.body.OBJECT_ID,
          req.body.DEPENDENCIES,
          req.body.DESCRIPTION,
          req.body.STATUS,
          req.body.ASSIGNED_TO,
          req.body.NOTE,
          req.body.MODIFIED ? moment(req.body.MODIFIED).format("YYYY-MM-DD HH:mm:ss") : moment().getDate(),
          req.body.MODIFIED_BY,
          req.body.TASK_ID
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
            res.json({
              success: true,
              taskId: row.insertId
            });
          }
        });
    } else {
      db.query(`insert into AMX_TASK 
	    					(	TASK_ID, 
	    						OPCO_ID, 
	    						SOURCE, 
	    						OBJECT_ID, 
	    						DEPENDENCIES, 
	    						DESCRIPTION, 
	    						STATUS, 
	    						ASSIGNED_TO, 
	    						NOTE, 
	    						STATUS_DATE, 
	    						STATUS_BY, 
	    						CREATED, 
	    						CREATED_BY, 
	    						MODIFIED, 
	    						MODIFIED_BY)
	    						values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [req.body.TASK_ID,
          req.body.OPCO_ID,
          req.body.SOURCE,
          req.body.OBJECT_ID,
          req.body.DEPENDENCIES,
          req.body.DESCRIPTION,
          req.body.STATUS,
          req.body.ASSIGNED_TO,
          req.body.NOTE,
          req.body.STATUS_DATE ? moment(req.body.STATUS_DATE).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.STATUS_BY,
          req.body.CREATED ? moment(req.body.CREATED).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.CREATED_BY,
          req.body.MODIFIED ? moment(req.body.MODIFIED).format("YYYY-MM-DD HH:mm:ss") : null,
          req.body.MODIFIED_BY
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
            res.json({
              success: true,
              taskId: row.insertId
            });
          }
        });
    }
  }

  if (req.params.apiEndpoint === "assignTask") {
    //If success - update change request fileds
    db.query("update AMX_TASK set ASSIGNED_TO=?, MODIFIED_BY=? where TASK_ID=?",
      [req.body.ASSIGNED_TO, req.body.MODIFIED_BY, req.body.TASK_ID],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit('counters:update:' + req.body.OPCO_ID);
          res.json({
            success: true
          });
        }
      });
  }

  if (req.params.apiEndpoint === "changeTaskStatus") {
    //If success - update change request fileds
    db.query("update AMX_TASK set STATUS=?, MODIFIED_BY=?, STATUS_BY=?, ASSIGNED_TO=? where TASK_ID=?",
      [req.body.STATUS, req.body.MODIFIED_BY, req.body.STATUS_BY, req.body.ASSIGNED_TO, req.body.TASK_ID],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit('counters:update:' + req.body.OPCO_ID);
          res.json({
            success: true
          });
        }
      });
  }

}

export function deleteTask(req, res, next) {
  var io = req.app.get('socketio');
  db.query('delete from AMX_TASK where TASK_ID = ?',
    [req.query.id],
    function (err, row) {
      if (err !== null) {
        console.log(err);
        res.json({
          success: false,
          error: err
        });
      } else {
        io.emit('counters:update:' + req.body.OPCO_ID);
        res.json({
          success: true
        });
      }
    });
}
