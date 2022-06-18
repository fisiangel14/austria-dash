/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/alarms              ->  index
 */

'use strict';

var db = require("../../utils/db");
var mailer = require("../../utils/mailer");
var moment = require("moment");
var _und = require("underscore");

export function getApiEndpoint(req, res, next) {

  if (req.params.apiEndpoint === "getAlarms") {
    db.query(`
				select 
					a.ALARM_ID,
					a.OPCO_ID,
					a.SEVERITY_ID,
					a.SEVERITY,
					a.SOURCE,
					a.OBJECT_ID,
					a.OBJECT_DATE,
					a.OBJECT_VERSION,
					a.DESCRIPTION,
					a.LINK,
					a.STATUS,
					ifnull(a.ASSIGNED_TO, '') ASSIGNED_TO,
					a.NOTE,
					a.INCIDENT_ID,
					a.CREATED,
					a.MODIFIED,
					coalesce(m.FREQUENCY, d.FREQUENCY, 'D') FREQUENCY,
					ifnull(m.TREND, 'N') TREND,
          ifnull(coalesce(m.BUSINESS_ASSURANCE_DOMAIN, cc.BUSINESS_ASSURANCE_DOMAIN), '{}') BUSINESS_ASSURANCE_DOMAIN,
					coalesce(c.DESCRIPTION, m.DESCRIPTION, d.DESCRIPTION) OBJECT_DESCRIPTION,
          case 
            when a.OPCO_ID = 36 then t.AUT
            when a.OPCO_ID = 37 then t.BGR
            when a.OPCO_ID = 38 then t.BLR
            when a.OPCO_ID = 39 then t.HRV
            when a.OPCO_ID = 40 then t.SVN
            when a.OPCO_ID = 41 then t.SRB
            when a.OPCO_ID = 42 then t.MKD
          end HOLIDAY          
				from AMX_ALARM a
				left join amx_dato_catalogue d on d.opco_id = a.opco_id and d.dato_id = a.object_id and a.source = 'DATO' 
				left join amx_metric_catalogue m on m.opco_id = a.opco_id and m.metric_id = a.object_id and a.source = 'METRIC' 
				left join dfl_procedure c on c.opco_id = a.opco_id and c.name = a.object_id and c.type = 'C'
				left join dfl_control_catalogue cc on cc.PROCEDURE_ID = c.PROCEDURE_ID
        left join amx_time_day t on t.DATE = a.OBJECT_DATE
				where 
					a.OPCO_ID = ? 
					and (a.CREATED between ? and ? or a.OBJECT_DATE between ? and ? or a.MODIFIED between ? and ?)
        order by 
          case  
            when a.STATUS = 'Pending' then 1
            when a.STATUS = 'In progress' and a.INCIDENT_ID is null then 2
            when a.STATUS = 'In progress' and a.INCIDENT_ID is not null then 3
            when a.STATUS = 'Closed' then 4
            else 5
          end,
          a.CREATED desc,
          a.MODIFIED desc,
          a.OBJECT_DATE desc        
				`,
      [req.query.opcoId, req.query.fromDate, req.query.toDate, req.query.fromDate, req.query.toDate, req.query.fromDate, req.query.toDate],
      function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });
  }

  if (req.params.apiEndpoint === "getLinkedAlarms") {
    db.query("select * from AMX_ALARM where INCIDENT_ID = ?",
      [req.query.incidentId],
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

export function postApiEndpoint(req, res, next) {
  var io = req.app.get('socketio');

  if (req.params.apiEndpoint === "new") {

		var opcoId = req.decoded.id;
		var severityId = isNaN(req.body.ALARM_LEVEL)?0:Number(req.body.ALARM_LEVEL);
		var severity = 'ERROR';
		var description = req.body.ALARM_DESCRIPTION;
		var link = req.body.ALARM_LINK;

		if (severityId > 0) {
			// severity
			if (severityId >= 3) {
				severityId = 3;
				severity = 'ERROR';
			}
			else if (severityId === 2) {
				severity = 'WARNING';	
			}
			else {
				severity = 'INFO';	
			}
		}	

    if (opcoId) {

      // Check if alarm exists
      db.query(`select * from AMX_ALARM 
							where OPCO_ID = ? and OBJECT_ID = ? and OBJECT_DATE = ? limit 1`,
        [	opcoId,
          req.body.ALARM_OBJECT,
          moment(req.body.ALARM_DATE).format('YYYY-MM-DD')
        ],
        function (err, alarm) {

          if (err) {
            console.log(err);
            res.json({
              success: false,
              error: err
            });            
          }
          
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
															SEVERITY = ?,
															LINK=?
														where ALARM_ID = ?`,
              [	'Reopened based on new alarm received on ' + moment().format('DD.MM.YYYY HH:mm:ss'),
                'In progress',
                description,
                severityId,
								severity,
								link,
                existingAlarm.ALARM_ID
              ],
              function (err, row) {
                if (!err) {
                  if (Number(req.body.ALARM_EMAIL) >  0) {
                    mailer.sendMail(opcoId, [], moment().format("DD.MM.YYYY HH:mm:ss"), severity, req.body.ALARM_SOURCE.toUpperCase(), 'Re-opened alarm for ' + req.body.ALARM_SOURCE.toLowerCase() + ' ' + req.body.ALARM_OBJECT + ' for ' + moment(req.body.ALARM_DATE).format('YYYY-MM-DD'), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);
                  }                  
                  io.emit(('alarm:update:' + opcoId), 'Alarm for "' + req.body.ALARM_OBJECT + '" was re-opened');
                  io.emit('counters:update:' + opcoId);
									res.json({
										success: true
									});									
                }
                else {
                  console.log(err);
                  res.json({
                    success: false,
                    error: err
                  });                  
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
															SEVERITY = ?,
															LINK=?
														where ALARM_ID = ?`,
              ['Last alarm update on ' + moment().format('DD.MM.YYYY HH:mm:ss') + ')',
                description,
                severityId,
								severity,
								link,
                existingAlarm.ALARM_ID
              ],
              function (err, row) {
                if (!err) {
                  io.emit(('alarm:update:' + opcoId), 'Update for alarm "' + req.body.ALARM_OBJECT + '" received');
                  io.emit('counters:update:' + opcoId);
									res.json({
										success: true
									});									
                }
                else {
                  console.log(err);
                  res.json({
                    success: false,
                    error: err
                  });                  
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
              ['AUTO Closed - based on cancel request received on ' + moment().format('DD.MM.YYYY HH:mm:ss') + ')',
                'Closed',
                'A1G Dashboard',
                existingAlarm.ALARM_ID
              ],
              function (err, row) {
                if (!err) {
                  io.emit(('alarm:update:' + opcoId), 'Alarm for "' + req.body.ALARM_OBJECT + '" was automatically closed');
                  io.emit('counters:update:' + opcoId);
									res.json({
										success: true
									});									
                }
                else {
                  console.log(err);
                  res.json({
                    success: false,
                    error: err
                  });                  
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
							req.body.ALARM_LEVEL,
							severity,
							req.body.ALARM_SOURCE,
							req.body.ALARM_OBJECT,
							moment(req.body.ALARM_DATE).format('YYYY-MM-DD'),
							req.body.ALARM_DESCRIPTION,
							req.body.ALARM_LINK
						],
						function (err, row) {
							if (err) {
								console.log(err);
								res.json({
									success: false,
									error: err
								});
							} else {
                if (Number(req.body.ALARM_EMAIL) >  0) {
                  mailer.sendMail(opcoId, [], moment().format("DD.MM.YYYY HH:mm:ss"), severity, req.body.ALARM_SOURCE.toUpperCase(), 'Alarm for ' + req.body.ALARM_SOURCE.toLowerCase() + ' ' + req.body.ALARM_OBJECT + ' for ' + moment(req.body.ALARM_DATE).format('YYYY-MM-DD'), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);
                }
                io.emit(('alarm:update:' + opcoId), 'New alarm: "' + req.body.ALARM_OBJECT + '"!');
                io.emit('counters:update:' + opcoId);
								res.json({
									success: true
								});
							}
						});
					}
					// Something is missing
					else {
						res.json({
							success: false,
							error: 'Incomplete request'
						});						
					}
        }
      );
    } else {
      res.json({
        success: false,
        error: 'OPCO_ID Wrong'
      });
    }

  } else if (req.params.apiEndpoint === "updateAlarm") {

    db.query("update AMX_ALARM set OPCO_ID = ?, SEVERITY_ID = ?, SEVERITY = ?, SOURCE = ?, OBJECT_ID = ?, DESCRIPTION = ?, LINK = ?, STATUS = ?, ASSIGNED_TO = ?, NOTE = ?, INCIDENT_ID = ? where ALARM_ID = ?",
      [req.body.OPCO_ID,
        req.body.SEVERITY_ID,
        req.body.SEVERITY,
        req.body.SOURCE,
        req.body.OBJECT_ID,
        req.body.DESCRIPTION,
        req.body.LINK,
        req.body.STATUS,
        req.body.ASSIGNED_TO,
        req.body.NOTE,
        req.body.INCIDENT_ID,
        req.body.ALARM_ID
      ],
      function (err, row) {
        if (err) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit(('alarm:update:' + req.body.OPCO_ID), 'Alarm "' + req.body.ALARM_ID + '" updated. All changes saved!');
          if (req.body.SOURCE === 'CONTROL') {
            io.emit(('control:new:' + req.body.OPCO_ID + ':' + req.body.OBJECT_ID), {
              toast: 'Alarm asignment for control "' + req.body.OBJECT_ID + '" changed to ' + req.body.ASSIGNED_TO,
              processid: 0
            });
            io.emit(('control:new:' + req.body.OPCO_ID), {
              toast: 'Alarm asignment for control "' + req.body.OBJECT_ID + '" changed to ' + req.body.ASSIGNED_TO,
              processid: 0
            });
            io.emit('counters:update:' + req.body.OPCO_ID);
          }
          res.json({
            success: true
          });
        }
      });
  } else if (req.params.apiEndpoint === "assignAlarm") {

    db.query("update AMX_ALARM set STATUS = ?, ASSIGNED_TO = ? where ALARM_ID = ?",
      [req.body.STATUS,
        req.body.ASSIGNED_TO,
        req.body.ALARM_ID
      ],
      function (err, row) {
        if (err) {
          console.log(err);
          res.json({
            success: false,
            error: err
          });
        } else {
          io.emit('counters:update:' + req.body.OPCO_ID);
          io.emit(('alarm:update:' + req.body.OPCO_ID), 'Alarm "' + req.body.ALARM_ID + '" updated. All changes saved!');
          if (req.body.SOURCE === 'CONTROL') {
            io.emit(('control:new:' + req.body.OPCO_ID + ':' + req.body.OBJECT_ID), {
              toast: 'Alarm asignment for control "' + req.body.OBJECT_ID + '" changed to ' + req.body.ASSIGNED_TO,
              processid: 0
            });
            io.emit(('control:new:' + req.body.OPCO_ID), {
              toast: 'Alarm asignment for control "' + req.body.OBJECT_ID + '" changed to ' + req.body.ASSIGNED_TO,
              processid: 0
            });
          }
          if (req.body.sendEmailNotification) {
            var link = 'alarms?opcoId=' + req.body.OPCO_ID + '&month=' + moment(req.body.OBJECT_DATE).format("YYYY-MM") + '&filterText=' + req.body.ALARM_ID;
            mailer.sendMail(null, req.body.sendEmailNotificationTo, moment().format("DD.MM.YYYY HH:mm:ss"), 'Info', req.body.SOURCE.toUpperCase(), 'Alarm ' + req.body.SOURCE.toLowerCase() + ' ' + req.body.OBJECT_ID + ' for ' + moment(req.body.OBJECT_DATE).format("DD.MM.YYYY") + ' (ID#:' + req.body.ALARM_ID + ') reassigned', '<b>Assigned to: </b>' + req.body.ASSIGNED_TO + '<br><b>Assigned by: </b>' + req.body.sendEmailNotificationChangeBy, 'http://vlreaap001.at.inside:9000/' + link);
          }
          res.json({
            success: true
          });
        }
      });
  }

}