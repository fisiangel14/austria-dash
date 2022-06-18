/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/mm-controls              ->  index
 */

'use strict';

exports.getIndex = getIndex;
exports.getOverview = getOverview;
exports.getControlEscalationNotes = getControlEscalationNotes;
exports.getReRun = getReRun;
exports.getRunhistory = getRunhistory;
exports.getControlResultsForDay = getControlResultsForDay;
exports.getControlMontior = getControlMontior;
exports.getMoneyMapStatus = getMoneyMapStatus;
exports.getOpenAlarms = getOpenAlarms;

exports.postNewControl = postNewControl;
exports.sendMoneyMapRequest = sendMoneyMapRequest;
exports.postAudit = postAudit;
exports.postAuditAll = postAuditAll;
exports.postMoneyMapStatus = postMoneyMapStatus;

exports.deleteControlResult = deleteControlResult;
exports.deleteReRun = deleteReRun;

var db = require("../../utils/db");
var mailer = require("../../utils/mailer");

var _ = require("underscore");
var moment = require('moment');
var async = require("async");

function getIndex(req, res, next) {
  var opcoId = req.decoded.id;
  res.json({
    "opcoId": opcoId,
    "success": true
  });
}

function getOverview(req, res, next) {
  db.query(`select 
							t.DATE RUN_FOR_DATE,
							t.DAY_OF_WEEK,
							p.PROCESSNAME,
							o.OPCO_ID,
							p.RULE_TYPE,
							mr.STARTRUNDATE,
							mr.RUN_DURATION,
							case 
								when q.OPCO_ID is not null then 'Y'
								else 'N'
							end RECALCULATE,
							mr.PROCESSID,
							mr.DS_A, 
							mr.DS_B, 
							mr.RECORDSFETCHED_A, 
							mr.RECORDSFETCHED_B, 
							mr.RECORDSMATHCED_A, 
							mr.RECORDSMATHCED_B, 
							mr.DISC_COUNT_A, 
							mr.DISC_COUNT_B, 
							mr.ERRORLEVEL_A, 
							mr.ERRORLEVEL_B, 
							mr.TREND_A, 
							mr.TREND_B,
							mr.KPI_COUNT,
							case 
								when a.STATUS = 'Closed' then 0 
								else mr.KPI_ALARM_LEVEL
							end KPI_ALARM_LEVEL,
							a.STATUS ALARM_STATUS,
							i.STATUS INCIDENT_STATUS,
							a.ALARM_ID,
							a.ASSIGNED_TO,
							a.INCIDENT_ID,					
							mr.KPI_JSON,
							mr.VERSION,
              case 
                when o.OPCO_ID = 36 then t.AUT
                when o.OPCO_ID = 37 then t.BGR
                when o.OPCO_ID = 38 then t.BLR
                when o.OPCO_ID = 39 then t.HRV
                when o.OPCO_ID = 40 then t.SVN
                when o.OPCO_ID = 41 then t.SRB
                when o.OPCO_ID = 42 then t.MKD
              end HOLIDAY
						from AMX_TIME_DAY t
            cross join (select ? OPCO_ID) o
						cross join (select distinct PROCESSNAME, RULE_TYPE from mm_ma_runhistory_sum where OPCO_ID=? and RUN_FOR_DATE between ? and ?) p
						left join mm_ma_runhistory_sum mr on mr.RUN_FOR_DATE = t.DATE and mr.PROCESSNAME = p.PROCESSNAME and mr.RULE_TYPE = p.RULE_TYPE and mr.OPCO_ID=o.OPCO_ID
						left join mm_control_rerun_queue q on q.RUN_FOR_DATE = t.DATE and q.PROCESSNAME = p.PROCESSNAME and q.RULE_TYPE = p.RULE_TYPE and q.ACTION='R' and q.OPCO_ID=o.OPCO_ID
						left join amx_alarm a on a.OPCO_ID = o.OPCO_ID and a.SOURCE = 'CONTROL' and a.OBJECT_ID = mr.PROCESSNAME and a.OBJECT_DATE = t.DATE
						left join amx_incident i on i.OPCO_ID = o.OPCO_ID and i.INCIDENT_ID = a.INCIDENT_ID
						where t.DATE between ? and ?
						order by 5,3,1`,
    [Number(req.query.opcoId), Number(req.query.opcoId), req.query.fromDate, req.query.toDate, req.query.fromDate, req.query.toDate],
    function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row);
      }
    });
}


function getControlEscalationNotes(req, res, next) {
  
  db.query(`select 
              ifnull(ESCALATION_NOTES, 'None') ESCALATION_NOTES
            FROM dfl_procedure p
            join dfl_control_catalogue cc on cc.procedure_id = p.procedure_id
            where p.OPCO_ID= ? and p.NAME = ?`,
    [Number(req.query.opcoId), req.query.processname],
    function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row[0]);
      }
    });

}


function getRunhistory(req, res, next) {
  db.query(`select 
							t.DATE RUN_FOR_DATE,
							t.DAY_OF_WEEK,
							p.PROCESSNAME,
							o.OPCO_ID,
							c.CONTROL_REF,
							c.STATUS_CODE,
							c.FREQUENCY,
							c.DESCRIPTION,
							mr.RULE_TYPE,
							mr.STARTRUNDATE,
							mr.RUN_DURATION,
							case 
								when q.OPCO_ID is not null then 'Y'
								else 'N'
							end RECALCULATE,
							mr.PROCESSID,
							mr.DS_A, 
							mr.DS_B, 
							mr.RECORDSFETCHED_A, 
							mr.RECORDSFETCHED_B, 
							mr.RECORDSMATHCED_A, 
							mr.RECORDSMATHCED_B, 
							mr.DISC_COUNT_A, 
							mr.DISC_COUNT_B, 
							mr.ERRORLEVEL_A, 
							mr.ERRORLEVEL_B, 
							mr.TREND_A, 
							mr.TREND_B,
							mr.KPI_COUNT,
							mr.KPI_ALARM_LEVEL,
							a.STATUS ALARM_STATUS,
							i.STATUS INCIDENT_STATUS,
							a.ALARM_ID,
							a.ASSIGNED_TO,
							a.INCIDENT_ID,							
							mr.KPI_JSON,
							mr.VERSION,
              case 
                when o.OPCO_ID = 36 then t.AUT
                when o.OPCO_ID = 37 then t.BGR
                when o.OPCO_ID = 38 then t.BLR
                when o.OPCO_ID = 39 then t.HRV
                when o.OPCO_ID = 40 then t.SVN
                when o.OPCO_ID = 41 then t.SRB
                when o.OPCO_ID = 42 then t.MKD
              end HOLIDAY              
						from AMX_TIME_DAY t
            cross join (select ? OPCO_ID) o            
						cross join (select ? PROCESSNAME) p            
						left join mm_ma_runhistory_sum mr on mr.RUN_FOR_DATE = t.DATE and mr.PROCESSNAME = p.PROCESSNAME and mr.OPCO_ID=o.OPCO_ID
						left join mm_control_rerun_queue q on q.RUN_FOR_DATE = t.DATE and q.PROCESSNAME = p.PROCESSNAME and q.ACTION='R' and q.OPCO_ID=o.OPCO_ID
						left join amx_alarm a on a.OPCO_ID = mr.OPCO_ID and a.SOURCE = 'CONTROL' and a.OBJECT_ID = mr.PROCESSNAME and a.OBJECT_DATE = t.DATE
						left join amx_incident i on i.OPCO_ID = mr.OPCO_ID and i.INCIDENT_ID = a.INCIDENT_ID						
						left join v_cvg_control c on c.CONTROL_NAME = p.PROCESSNAME and c.OPCO_ID = o.OPCO_ID
						where t.DATE between ? and ?
						order by 3,1 desc`,
    [Number(req.query.opcoId), req.query.processname, req.query.fromDate, req.query.toDate],
    function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row);
      }
    });
}

function getControlResultsForDay(req, res, next) {
  db.query(`select 
							r.*,
							c.CONTROL_REF,
							c.STATUS_CODE,
							c.FREQUENCY,
							c.DESCRIPTION,
							case 
								when q.OPCO_ID is not null then 'Y'
								else 'N'
							end RECALCULATE,
							a.STATUS ALARM_STATUS,
							i.STATUS INCIDENT_STATUS,
              case 
                when r.OPCO_ID = 36 then t.AUT
                when r.OPCO_ID = 37 then t.BGR
                when r.OPCO_ID = 38 then t.BLR
                when r.OPCO_ID = 39 then t.HRV
                when r.OPCO_ID = 40 then t.SVN
                when r.OPCO_ID = 41 then t.SRB
                when r.OPCO_ID = 42 then t.MKD
              end HOLIDAY
						from mm_ma_runhistory_all r
						left join v_cvg_control c on c.CONTROL_NAME = r.PROCESSNAME and c.OPCO_ID = r.OPCO_ID
						left join mm_control_rerun_queue q on q.RUN_FOR_DATE = r.RUN_FOR_DATE and q.PROCESSNAME = r.PROCESSNAME and q.ACTION='R' and q.OPCO_ID = r.OPCO_ID
						left join amx_alarm a on a.OPCO_ID = r.OPCO_ID and a.SOURCE = 'CONTROL' and a.OBJECT_ID = r.PROCESSNAME and a.OBJECT_DATE = r.RUN_FOR_DATE
						left join amx_incident i on i.OPCO_ID = r.OPCO_ID and i.INCIDENT_ID = a.INCIDENT_ID
            left join amx_time_day t on t.DATE = r.RUN_FOR_DATE
						where r.OPCO_ID=? and r.PROCESSNAME = ? and r.RUN_FOR_DATE = ? 
						order by r.STARTRUNDATE desc`,
    [Number(req.query.opcoId), req.query.processname, req.query.runForDate],
    function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row);
      }
    });
}

function getControlMontior(req, res, next) {
  db.query(`select 
							mr.*, 
							t.DAY_OF_WEEK,
							a.STATUS ALARM_STATUS,
							i.STATUS INCIDENT_STATUS,
							a.ALARM_ID,
							a.ASSIGNED_TO,
							a.INCIDENT_ID                            
						from mm_ma_runhistory_all mr
						left join amx_alarm a on a.OPCO_ID = mr.OPCO_ID and a.SOURCE = 'CONTROL' and a.OBJECT_ID = mr.PROCESSNAME and a.OBJECT_DATE = mr.RUN_FOR_DATE
						left join amx_incident i on i.OPCO_ID = mr.OPCO_ID and i.INCIDENT_ID = a.INCIDENT_ID						
						left join AMX_TIME_DAY t on t.DATE = mr.RUN_FOR_DATE
						where mr.OPCO_ID = ? and STARTRUNDATE between ? and DATE_ADD(?, INTERVAL 1 DAY)
						order by STARTRUNDATE desc`,
    [Number(req.query.opcoId), req.query.toDate, req.query.toDate],
    function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row);
      }
    });
}

function getMoneyMapStatus(req, res, next) {
	db.query(`select 
        PROCESSNAME,
        RULE_TYPE,
				DATE_FORMAT(RUN_FOR_DATE, '%Y-%m-%d') RUN_FOR_DATE,
				ACTION,
				PROCESSID,
				STATUS,
				CREATED
			from mm_control_rerun_queue  
      where OPCO_ID = ?
      order by CREATED desc`,
      [Number(req.query.opcoId)],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          res.json(row);
        }
      });
}

function getReRun(req, res, next) {
  var opcoId = req.decoded.id;
  var io = req.app.get('socketio');

  if (opcoId) {
    // remove rules older than 2 hours to avoid stucked rules  
	db.query(`select 
        PROCESSNAME,
        RULE_TYPE,
				DATE_FORMAT(RUN_FOR_DATE, '%Y-%m-%d') RUN_FOR_DATE,
				ACTION,
				PROCESSID,
				STATUS,
				CREATED
			from mm_control_rerun_queue  
			where OPCO_ID = ?`,
      [opcoId],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          db.query(`delete from mm_control_rerun_queue where OPCO_ID = ?`, [opcoId], function (err, row) {
            if (row.affectedRows > 0) {
              io.emit('control:monitor:' + opcoId);
            }
          });
          // db.query(`delete from mm_control_rerun_queue where OPCO_ID = ? and CREATED < date_sub(current_timestamp(), INTERVAL 1 hour)`, [opcoId]);
          // db.query(`delete from mm_control_rerun_queue where OPCO_ID = ? and ACTION != 'R'`, [opcoId]);
          // db.query(`update mm_control_rerun_queue set STATUS=? where OPCO_ID = ? and ACTION = 'R'`, ['S2', opcoId]);
          res.json(row);
        }
      });
  } else {
    res.json({
      success: false,
      error: 'Wrong OPCO_ID'
    });
  }
}

function getOpenAlarms(req, res, next) {
  var opcoId = req.decoded.id;
  if (opcoId) {
    db.query(`SELECT 
                a.OBJECT_ID PROCESSNAME,
                p.RULE_TYPE, 
								DATE_FORMAT(a.OBJECT_DATE, '%Y-%m-%d') RUN_FOR_DATE
              FROM amx_alarm a
              left join (select distinct 
                            PROCESSNAME, 
                            RULE_TYPE 
                          from mm_ma_runhistory_sum 
                          where OPCO_ID=? and RUN_FOR_DATE > DATE_ADD(curdate(), INTERVAL - 181 DAY) ) p on p.PROCESSNAME = a.OBJECT_ID
							where a.OBJECT_DATE > DATE_ADD(curdate(), INTERVAL - 181 DAY) and a.STATUS != 'Closed' and a.SOURCE = 'CONTROL' and a.OPCO_ID=?`,
      [Number(opcoId), Number(opcoId)],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });
  } else {
    res.json({
      success: false,
      error: 'Wrong OPCO_ID'
    });
  }
}

function postNewControl(req, res, next) {
  var opcoId = req.decoded.id;
  var io = req.app.get('socketio');
  var severityId = isNaN(req.body.KPI_ALARM_LEVEL) ? 0 : Number(req.body.KPI_ALARM_LEVEL);
  var severity = '';

  if (opcoId) {

    db.query(`REPLACE INTO mm_ma_runhistory_all (OPCO_ID, RULE_TYPE, PROCESSID, PROCESSNAME, RUN_FOR_DATE, STARTRUNDATE, RUN_DURATION, RUN_FROM, RUN_TO, DS_A, DS_B, RECORDSFETCHED_A, RECORDSFETCHED_B, RECORDSMATHCED_A, RECORDSMATHCED_B, DISC_COUNT_A, DISC_COUNT_B, ERRORLEVEL_A, ERRORLEVEL_B, TREND_A, TREND_B, KPI_COUNT, KPI_ALARM_LEVEL, KPI_JSON) 
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [opcoId, req.body.RULE_TYPE, req.body.PROCESSID, req.body.PROCESSNAME, req.body.RUN_FOR_DATE, req.body.STARTRUNDATE, req.body.RUN_DURATION, req.body.RUN_FROM, req.body.RUN_TO, req.body.DS_A, req.body.DS_B, req.body.RECORDSFETCHED_A, req.body.RECORDSFETCHED_B, req.body.RECORDSMATHCED_A, req.body.RECORDSMATHCED_B, req.body.DISC_COUNT_A, req.body.DISC_COUNT_B, req.body.ERRORLEVEL_A, req.body.ERRORLEVEL_B, req.body.TREND_A, req.body.TREND_B, req.body.KPI_COUNT, req.body.KPI_ALARM_LEVEL, JSON.stringify(req.body.KPI_JSON)],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          db.query(`REPLACE INTO mm_ma_runhistory_sum (OPCO_ID, RULE_TYPE, PROCESSID, PROCESSNAME, RUN_FOR_DATE, STARTRUNDATE, RUN_DURATION, RUN_FROM, RUN_TO, DS_A, DS_B, RECORDSFETCHED_A, RECORDSFETCHED_B, RECORDSMATHCED_A, RECORDSMATHCED_B, DISC_COUNT_A, DISC_COUNT_B, ERRORLEVEL_A, ERRORLEVEL_B, TREND_A, TREND_B, KPI_COUNT, KPI_ALARM_LEVEL, KPI_JSON) 
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [opcoId, req.body.RULE_TYPE, req.body.PROCESSID, req.body.PROCESSNAME, req.body.RUN_FOR_DATE, req.body.STARTRUNDATE, req.body.RUN_DURATION, req.body.RUN_FROM, req.body.RUN_TO, req.body.DS_A, req.body.DS_B, req.body.RECORDSFETCHED_A, req.body.RECORDSFETCHED_B, req.body.RECORDSMATHCED_A, req.body.RECORDSMATHCED_B, req.body.DISC_COUNT_A, req.body.DISC_COUNT_B, req.body.ERRORLEVEL_A, req.body.ERRORLEVEL_B, req.body.TREND_A, req.body.TREND_B, req.body.KPI_COUNT, req.body.KPI_ALARM_LEVEL, JSON.stringify(req.body.KPI_JSON)],
            function (err, row) {
              if (err !== null) {
                console.log(err);
              }
            });

          io.emit(('control:new:' + opcoId), {
            toast: 'New result for "' + req.body.PROCESSNAME + '", date ' + moment(req.body.RUN_FOR_DATE).format('DD.MM.YYYY'),
            processid: req.body.PROCESSID
          });
          io.emit(('control:new:' + opcoId + ':' + req.body.PROCESSNAME), {
            toast: 'New result just received for date ' + moment(req.body.RUN_FOR_DATE).format('DD.MM.YYYY'),
            processid: req.body.PROCESSID
          });
          res.json({
            success: true
          });
        }
      });

    // If result is alarm compose the required alarm fileds
    if (severityId > 0) {
      // severity
      if (severityId >= 3) {
        severityId = 3;
        severity = 'ERROR';
      } else if (severityId === 2) {
        severity = 'WARNING';
      } else {
        severity = 'INFO';
      }
      // description
      var description = '';
      _.each(req.body.KPI_JSON, function (kpi) {
        if (Number(kpi.ALARM_LEVEL) > 0) {
          description = description + (description.length > 0 ? ', ' : '') + 'Alarm level: ' + kpi.ALARM_LEVEL + '. ' + kpi.KPI_TYPE + ' (' + kpi.KPI_TYPE_DESC + ') = ' + kpi.KPI_VALUE + kpi.KPI_VALUE_UNIT;
        }
      });
      // link
      var link = '/control-results-day?opcoId=' + opcoId + '&processname=' + req.body.PROCESSNAME + '&runForDate=' + moment(req.body.RUN_FOR_DATE).format('YYYY-MM-DD');
    }

    // Check if alarm exists
    db.query(`select * from AMX_ALARM 
							where OPCO_ID = ? and OBJECT_ID = ? and OBJECT_DATE = ? limit 1`,
      [opcoId,
        req.body.PROCESSNAME,
        moment(req.body.RUN_FOR_DATE).format('YYYY-MM-DD')
      ],
      function (err, alarm) {
        var existingAlarm = {};
        if (alarm.length > 0) {
          existingAlarm = alarm[0];
        }

        // Closed alarm exists and new result is also an alarm
        if (typeof existingAlarm.ALARM_ID !== 'undefined' && severityId > 0 && existingAlarm.STATUS === 'Closed') {
          db.query(`update AMX_ALARM set 
															NOTE = ?,
															STATUS = ?,
															DESCRIPTION = ?,
															SEVERITY_ID = ?,
															SEVERITY = ?
														where ALARM_ID = ?`,
            ['Reopened based on new control result (PID:' + req.body.PROCESSID + ' from ' + moment(req.body.STARTRUNDATE).format('DD.MM.YYYY HH:mm:ss') + ')',
              'In progress',
              description,
              severityId,
              severity,
              existingAlarm.ALARM_ID
            ],
            function (err, row) {
              if (!err) {
                mailer.sendMail(opcoId, [], moment().format("DD.MM.YYYY HH:mm:ss"), severity, 'CONTROL', 'Re-opened alarm for control '  + existingAlarm.OBJECT_ID + ' for ' + moment(existingAlarm.OBJECT_DATE).format('YYYY-MM-DD'), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);
                io.emit(('alarm:update:' + opcoId), 'Alarm for "' + req.body.PROCESSNAME + '" was re-opened');
              }
            }
          );
        }
        // Open alarm exists and new result is also an alarm
        else if (typeof existingAlarm.ALARM_ID !== 'undefined' && severityId > 0 && existingAlarm.STATUS !== 'Closed') {
          db.query(`update AMX_ALARM set 
															NOTE = ?,
															DESCRIPTION = ?,
															SEVERITY_ID = ?,
															SEVERITY = ?
														where ALARM_ID = ?`,
            ['Last control result still above threshold (PID:' + req.body.PROCESSID + ' from ' + moment(req.body.STARTRUNDATE).format('DD.MM.YYYY HH:mm:ss') + ')',
              description,
              severityId,
              severity,
              existingAlarm.ALARM_ID
            ],
            function (err, row) {
              if (!err) {
                io.emit(('alarm:update:' + opcoId), 'Update on alarm for "' + req.body.PROCESSNAME + '" received');
              }
            }
          );
        }
        // Open alarm exists and new result is not an alarm
        else if (typeof existingAlarm.ALARM_ID !== 'undefined' && severityId === 0 && existingAlarm.STATUS !== 'Closed') {
          db.query(`update AMX_ALARM set 
															NOTE = ?,
															STATUS = ?,
															ASSIGNED_TO=case when ASSIGNED_TO is not null then ASSIGNED_TO else ? end
														where ALARM_ID = ?`,
            ['AUTO Closed - last result is below threshold (PID:' + req.body.PROCESSID + ' from ' + moment(req.body.STARTRUNDATE).format('DD.MM.YYYY HH:mm:ss') + ')',
              'Closed',
              'A1G Dashboard',
              existingAlarm.ALARM_ID
            ],
            function (err, row) {
              if (!err) {
                io.emit(('alarm:update:' + opcoId), 'Alarm for "' + req.body.PROCESSNAME + '" was automatically closed');
              }
            }
          );
        }
        // No alarm exists and new result is an alarm
        else if (typeof existingAlarm.ALARM_ID === 'undefined' && severityId > 0) {
          db.query(`replace into AMX_ALARM (
															OPCO_ID, 
															SEVERITY_ID, 
															SEVERITY, 
															SOURCE, 
															OBJECT_ID, 
															OBJECT_DATE, 
															DESCRIPTION, 
															LINK
														) 
														values (?,?,?,?,?,?,?,?)`,
            [opcoId,
              severityId,
              severity,
              'CONTROL',
              req.body.PROCESSNAME,
              moment(req.body.RUN_FOR_DATE).format('YYYY-MM-DD'),
              description,
              link
            ],
            function (err, row) {
              if (!err) {
                mailer.sendMail(opcoId, [], moment().format("DD.MM.YYYY HH:mm:ss"), severity, 'CONTROL', 'Alarm for control ' + req.body.PROCESSNAME + ' for ' + moment(req.body.RUN_FOR_DATE).format('YYYY-MM-DD'), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);
                io.emit(('alarm:update:' + opcoId), 'New alarm for "' + req.body.PROCESSNAME + '", (ID: ' + row.insertId + ')');
              }
            }
          );
        }

      }
    );


  } else {
    res.json({
      success: false,
      error: 'Wrong OPCO_ID'
    });
  }
}

function sendMoneyMapRequest(req, res, next) {
  var io = req.app.get('socketio');
  console.log(req.body);

    if (req.body.ACTION === 'D' && req.body.PROCESSID !== 'N/A') {
      // delete control from A1G Dashboard result tables first
      db.query(`DELETE FROM mm_ma_runhistory_all WHERE OPCO_ID =? and PROCESSID = ?`, [req.body.OPCO_ID, req.body.PROCESSID]);
    }

    if (req.body.ACTION === 'R' && (req.body.STATUS?req.body.STATUS:'S1') === 'S1') {
      req.body.PROCESSID = 'N/A';
    }

    if (req.body.ACTION === 'S') {
      db.query(`update mm_control_rerun_queue set ACTION = 'S' where OPCO_ID = ? and PROCESSNAME = ? and RUN_FOR_DATE = ? and ACTION = 'R'`, 
      [req.body.OPCO_ID, req.body.PROCESSNAME, moment(req.body.RUN_FOR_DATE).format('YYYY-MM-DD')], 
      function(err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit(('control:new:' + req.body.OPCO_ID), {
            toast: '"Stop" request queued. "' + req.body.PROCESSNAME + '", date ' + moment(req.body.RUN_FOR_DATE).format('DD.MM.YYYY')
          });
          res.json({
            success: true
          });
        }
      });
    }
    else {
      db.query(`replace into mm_control_rerun_queue (OPCO_ID, PROCESSNAME, RULE_TYPE, PROCESSID, RUN_FOR_DATE, ACTION, STATUS) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.body.OPCO_ID, req.body.PROCESSNAME, req.body.RULE_TYPE, (req.body.PROCESSID?req.body.PROCESSID:'N/A'), moment(req.body.RUN_FOR_DATE).format('YYYY-MM-DD'), (req.body.ACTION?req.body.ACTION:'R'), (req.body.STATUS?req.body.STATUS:'S1')],
        function (err, row) {
          
          if (err !== null) {
            console.log(err);
            res.json({
              success: false,
              error: err
            });
          } else {
            io.emit(('control:new:' + req.body.OPCO_ID), {
              toast: 'Re-run request queued. "' + req.body.PROCESSNAME + '", date ' + moment(req.body.RUN_FOR_DATE).format('DD.MM.YYYY')
            });
            io.emit(('control:new:' + req.body.OPCO_ID + ':' + req.body.PROCESSNAME), {
              toast: 'Re-run request queued. "' + req.body.PROCESSNAME + '", date ' + moment(req.body.RUN_FOR_DATE).format('DD.MM.YYYY')
            });
            res.json({
              success: true
            });
          }
        });
    }
    

}

function deleteReRun(req, res, next) {
  var io = req.app.get('socketio');

  db.query(`delete from mm_control_rerun_queue where OPCO_ID=? and PROCESSNAME=? and RUN_FOR_DATE=?`,
    [req.params.opcoId, req.params.processName, moment(req.params.runForDate).format('YYYY-MM-DD')],
    function (err, row) {
      if (err !== null) {
        console.log(err);
        res.json({
          success: false,
          error: err
        });
      } else {
        io.emit(('control:new:' + req.params.opcoId), {
          toast: 'Removed from re-run queue "' + req.params.processName + '", date ' + moment(req.params.runForDate).format('DD.MM.YYYY')
        });
        io.emit(('control:new:' + req.params.opcoId + ':' + req.params.processName), {
          toast: 'Removed from re-run queue "' + req.params.processName + '", date ' + moment(req.params.runForDate).format('DD.MM.YYYY')
        });
        res.json({
          success: true
        });
      }
    });
}

function postMoneyMapStatus(req, res, next) {
  // Called from local Oracle DB to update list of rules running on MoneyMap side 
  var io = req.app.get('socketio');
  var opcoId = req.decoded.id;
  var changedRows = 0;

  async.each(req.body, function (element, callback) {
    db.query(`replace into mm_control_rerun_queue (OPCO_ID, PROCESSNAME, RULE_TYPE, PROCESSID, RUN_FOR_DATE, ACTION, STATUS, CREATED) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [opcoId, element.PROCESSNAME, (element.RULE_TYPE?element.RULE_TYPE:'U'), element.PROCESSID, moment(element.RUN_FOR_DATE).format('YYYY-MM-DD'), element.ACTION, element.STATUS, moment(element.CREATED).format('YYYY-MM-DD HH:mm:ss')],
      function(err, row) {
        changedRows += row.affectedRows;
        if (err) {
          console.log(err);
          callback(err);
        }
        else {
          callback();
        }
      });
  },
  // done 
  function (err) {
    if (err) {
      res.json({
        success: false,
        error: err
      });
    }
    else {
      if (changedRows) {
        io.emit('control:monitor:' + opcoId);
      }
      res.json({
        success: true
      });
    }
  });


}

function postAudit(req, res, next) {
  var io = req.app.get('socketio');

  if (req.body.AUDIT_TYPE === '+E') {
    db.query(`update mm_ma_runhistory_all 
								set EXECUTOR = ?
								where OPCO_ID = ? and PROCESSID = ?`,
      [req.body.EXECUTOR, req.body.OPCO_ID, req.body.PROCESSID],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit(('audit:update:' + req.body.OPCO_ID + ':' + moment(req.body.STARTRUNDATE).format('YYYY-MM-DD')), {
            toast: 'Control executor ' + req.body.EXECUTOR + ' signed "' + req.body.PROCESSNAME + '", PID: ' + req.body.PROCESSID
          });
          res.json({
            success: true
          });
        }
      });
  } else if (req.body.AUDIT_TYPE === '+A') {
    db.query(`update mm_ma_runhistory_all 
								set APPROVER = ?
								where OPCO_ID = ? and PROCESSID = ?`,
      [req.body.APPROVER, req.body.OPCO_ID, req.body.PROCESSID],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit(('audit:update:' + req.body.OPCO_ID + ':' + moment(req.body.STARTRUNDATE).format('YYYY-MM-DD')), {
            toast: 'Control approver ' + req.body.APPROVER + ' signed "' + req.body.PROCESSNAME + '", PID: ' + req.body.PROCESSID
          });
          res.json({
            success: true
          });
        }
      });
  } else if (req.body.AUDIT_TYPE === '-E') {
    db.query(`update mm_ma_runhistory_all 
								set EXECUTOR = null
								where OPCO_ID = ? and PROCESSID = ?`,
      [req.body.OPCO_ID, req.body.PROCESSID],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit(('audit:update:' + req.body.OPCO_ID + ':' + moment(req.body.STARTRUNDATE).format('YYYY-MM-DD')), {
            toast: 'Control executor removed from control "' + req.body.PROCESSNAME + '", PID: ' + req.body.PROCESSID
          });
          res.json({
            success: true
          });
        }
      });
  } else if (req.body.AUDIT_TYPE === '-A') {
    db.query(`update mm_ma_runhistory_all 
								set APPROVER = null
								where OPCO_ID = ? and PROCESSID = ?`,
      [req.body.OPCO_ID, req.body.PROCESSID],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit(('audit:update:' + req.body.OPCO_ID + ':' + moment(req.body.STARTRUNDATE).format('YYYY-MM-DD')), {
            toast: 'Control approver removed from control "' + req.body.PROCESSNAME + '", PID: ' + req.body.PROCESSID
          });
          res.json({
            success: true
          });
        }
      });
  } else {
    res.json({
      success: false,
      error: 'Unknown audit action'
    });
  }
}

function postAuditAll(req, res, next) {
  var io = req.app.get('socketio');

  if (req.body.action === '+E') {
    db.query(`update mm_ma_runhistory_all 
									set EXECUTOR = ?
								where 1=1
									and EXECUTOR is null
									and OPCO_ID = ? 
									and STARTRUNDATE between ? and DATE_ADD(?, INTERVAL 1 DAY)
									and KPI_ALARM_LEVEL >= ?
									and PROCESSNAME like ?`,
      [req.body.requestor, Number(req.body.opcoId), req.body.toDate, req.body.toDate, (req.body.alarmsOnly ? '1' : '0'), (req.body.processnameFilter ? '%' + req.body.processnameFilter + '%' : '%')],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit(('audit:update:' + req.body.opcoId + ':' + moment(req.body.toDate).format('YYYY-MM-DD')), {
            toast: 'Control executor ' + req.body.requestor + ' signed ' + row.changedRows + ' controls'
          });
          res.json({
            success: true
          });
        }
      });
  } else if (req.body.action === '+A') {
    db.query(`update mm_ma_runhistory_all 
									set APPROVER = ?
								where 1=1
									and APPROVER is null
									and OPCO_ID = ? 
									and STARTRUNDATE between ? and DATE_ADD(?, INTERVAL 1 DAY)
									and KPI_ALARM_LEVEL >= ?
									and PROCESSNAME like ?`,
      [req.body.requestor, Number(req.body.opcoId), req.body.toDate, req.body.toDate, (req.body.alarmsOnly ? '1' : '0'), (req.body.processnameFilter ? '%' + req.body.processnameFilter + '%' : '%')],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit(('audit:update:' + req.body.opcoId + ':' + moment(req.body.toDate).format('YYYY-MM-DD')), {
            toast: 'Control approver ' + req.body.requestor + ' signed ' + row.changedRows + ' controls'
          });
          res.json({
            success: true
          });
        }
      });
  } else {
    res.json({
      success: false,
      error: 'Unknown audit action'
    });
  }
}

function deleteControlResult(req, res, next) {
  var io = req.app.get('socketio');

  db.query(`DELETE FROM mm_ma_runhistory_all WHERE OPCO_ID =? and PROCESSID = ?`,
    [req.params.opcoId, req.params.processId],
    function (err, row) {
      if (err !== null) {
        console.log(err);
        res.json({
          success: false,
          error: err
        });
      } else {

        db.query(`replace into mm_control_rerun_queue (OPCO_ID, PROCESSNAME, RUN_FOR_DATE, PROCESSID, ACTION, STATUS) VALUES (?, ?, ?, ?, ?, ?)`,
          [req.params.opcoId, req.params.processName, moment('1970-01-01').format('YYYY-MM-DD'), req.params.processId, 'D', 'S1'],
          function (err, row) {
            if (err !== null) {
              console.log(err);
              res.json({
                success: false,
                error: err
              });
            } else {
			  io.emit(('control:new:' + req.params.opcoId + ':' + req.params.processName), {
				toast: 'Deleted control "' + req.params.processName + '", PID: "' + req.params.processId + '"',
				processid: req.params.processId
			  });
			  io.emit(('control:new:' + req.params.opcoId), {
				toast: 'Deleted control "' + req.params.processName + '", PID: "' + req.params.processId + '"',
				processid: req.params.processId
			  });
              res.json({
                success: true
              });
            }
          });

      }
    });


}