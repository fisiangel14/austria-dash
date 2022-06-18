'use strict';
const _ = require("underscore");
const db = require("../../utils/db");
const moment = require('moment');
const jwt = require('jsonwebtoken'); 
const config = require('../../config/environment');
const async = require("async");

// Gets a list of StakeholderReports
export function getStakeholderReports(req, res, next) {
	if (!req.query.opcoId) {
		return res.status(400).json({
			message: 'You must provide OPCO_ID parameter',
			success: false
		});
	}

	db.query(`SELECT 
							STAKEHOLDER_REPORT_ID,
					    OPCO_ID,
					    STAKEHOLDER_REPORT,
					    STAKEHOLDER_REPORT_DESCRIPTION,
					    HITS,
					    MODIFIED,
					    REPORT_CONTROL_RUNS,
					    REPORT_CONTROL_DESC,
							REPORT_INCIDENTS,
							(select count(*) from mm_stakeholder_report_control_link where STAKEHOLDER_REPORT_ID = r.STAKEHOLDER_REPORT_ID) CNT_CONTROLS
						FROM mm_stakeholder_report r
						WHERE OPCO_ID = ?
`, 
	[Number(req.query.opcoId)], 
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

export function getStakeholderReport(req, res, next) {

	db.query(`SELECT 
							STAKEHOLDER_REPORT_ID,
					    OPCO_ID,
					    STAKEHOLDER_REPORT,
					    STAKEHOLDER_REPORT_DESCRIPTION,
					    HITS,
					    MODIFIED,
					    REPORT_CONTROL_RUNS,
					    REPORT_CONTROL_DESC,
					    REPORT_INCIDENTS
						FROM mm_stakeholder_report
						WHERE STAKEHOLDER_REPORT_ID = ?
`,
		[req.params.reportId],
		function (err, row) {
			if (err !== null) {
				console.log(err);
				next(err);
			}
			else {
				if (row.length < 1) {
					return res.status(404).json({
						message: 'Report not found',
						success: false
					});
				}
				res.json(row[0]);
			}
		});
}

export function getToken(req, res, next) {
	var options = {};

	if (!req.body.stakeholderReportId) {
		return res.status(400).json({
			message: 'Invalid ReportID',
			success: false
		});
	}

	if (moment(req.body.validToDate).isValid()) {
		var validDuration = moment.duration(moment(req.body.validToDate).diff(moment()));
		options.expiresIn = Math.round(validDuration.asSeconds());
	}
	else {
		return res.status(400).json({
			message: 'Invalid expiration date',
			success: false
		});
	}

	// var payload = {
	// 	issuedBy: req.body.issuedBy,
	// 	stakeholderReportId: req.body.stakeholderReportId,
	// 	stakoholderReport: req.body.stakoholderReport,
	// 	filterFromDate: moment(req.body.filterFromDate).format('YYYY-MM-DD'),
	// 	filterToDate: moment(req.body.filterToDate).format('YYYY-MM-DD'),
	// 	validToDate: moment(req.body.validToDate).format('YYYY-MM-DD')
	// };

	var payload = {
		id: 'SRID:' + req.body.stakeholderReportId + ' / ' + req.body.issuedBy,
		stakeholderReportId: req.body.stakeholderReportId,
		opcoId: req.body.opcoId,
		filterFromDate: moment(req.body.filterFromDate).format('YYYY-MM-DD'),
		filterToDate: moment(req.body.filterToDate).format('YYYY-MM-DD')
	};

	jwt.sign(payload, config.secrets.wt, options, function(err, encoded) {
		if (err){
			return res.status(500).json({
				success: false,
				message: err
			});
		}
		else {
			res.status(200).json({
				success: true,
				message: 'Access token generated successfully',
				token: encoded,
				url: 'http://' + req.headers.host + '/public-report/' + encoded
			})
		}
	});

}

export function verifyToken(req, res, next) {

	jwt.verify(req.params.key, config.secrets.wt, function (err, decoded) {
		if (err) {
			return res.status(403).json({
				success: false,
				message: err
			});
		}
		else {
			res.status(200).json({
				success: true,
				message: 'Access token virified',
				token: decoded
			})
		}
	});

}

export function getPublicReport(req, res, next) {
	var params = req.decoded;
	
	async.parallel({
		'reportInfo': function (cb) {
			// Report information
			db.query(`select
									r.OPCO_ID,
									o.OPCO_NAME,
									o.COUNTRY,
									r.STAKEHOLDER_REPORT,
									r.REPORT_CONTROL_RUNS,
									r.REPORT_CONTROL_DESC,
									r.REPORT_INCIDENTS									
								from mm_stakeholder_report r
								join amx_opco o on o.OPCO_ID = r.OPCO_ID
								where 1=1
									and r.STAKEHOLDER_REPORT_ID = ?`,
				[params.stakeholderReportId],
				function (err, row) {
					if (err) {
						console.log(err);
						cb(err)
					}
					else {
						cb(null, row[0]);
					}
				});
		},
		'controlList': function (cb) {
			// Control results
			db.query(`select distinct
									c.CONTROL_REF, 
									c.CONTROL_TYPE, 
									c.CONTROL_TYPE_DESC, 
									c.CONTROL_NAME, 
									c.DESCRIPTION, 
									c.STATUS_CODE, 
									c.STATUS_CODE_TEXT, 
									c.START_DATE, 
									c.END_DATE, 
									c.FREQUENCY, 
									c.CVG_RN_CNT, 
									c.CTRL_COVERAGE, 
									c.CTRL_COVERAGE_OVERLAP,
									case when c.CONTROL_REF = rcl.CONTROL_REF then 'Y' else 'N' end REPORT_RELEVANT
								from mm_stakeholder_report r
								join amx_opco o on o.OPCO_ID = r.OPCO_ID
								left join mm_stakeholder_report_control_link rcl on rcl.STAKEHOLDER_REPORT_ID = r.STAKEHOLDER_REPORT_ID
								left join v_cvg_control c on c.OPCO_ID = r.OPCO_ID and c.CONTROL_TYPE = 'C' and (STATUS_CODE = 'A' or c.CONTROL_REF = rcl.CONTROL_REF)
								where 1=1
									and r.STAKEHOLDER_REPORT_ID = ?
								order by 14 desc`,
				[params.stakeholderReportId],
				function (err, row) {
					if (err) {
						console.log(err);
						cb(err)
					}
					else {
						cb(null, row);
					}
				});		
		},				
		'controlResultsCondensed': function (cb) {
			// Control results
			db.query(`select
									c.CONTROL_NAME PROCESSNAME,
									c.DESCRIPTION, 
									mr.RUN_FOR_DATE,
									mr.STARTRUNDATE,
									mr.RUN_DURATION,
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
									a.ALARM_ID,
									a.ASSIGNED_TO ALARM_ASSIGNED_TO,
									a.NOTE ALARM_NOTE,
									i.INCIDENT_ID,    
									i.STATUS INCIDENT_STATUS,
									mr.KPI_JSON,
									mr.VERSION
								from mm_stakeholder_report r
								join amx_opco o on o.OPCO_ID = r.OPCO_ID
								join mm_stakeholder_report_control_link rcl on rcl.STAKEHOLDER_REPORT_ID = r.STAKEHOLDER_REPORT_ID
								join v_cvg_control c on c.CONTROL_REF = rcl.CONTROL_REF
								join mm_ma_runhistory_sum mr on mr.PROCESSNAME = c.CONTROL_NAME and mr.OPCO_ID=r.OPCO_ID
								left join amx_alarm a on a.OPCO_ID = r.OPCO_ID and a.SOURCE = 'CONTROL' and a.OBJECT_ID = mr.PROCESSNAME and a.OBJECT_DATE = mr.RUN_FOR_DATE
								left join amx_incident i on i.OPCO_ID = mr.OPCO_ID and i.INCIDENT_ID = a.INCIDENT_ID
								where 1=1
									and r.STAKEHOLDER_REPORT_ID = ?
									and mr.RUN_FOR_DATE between ? and ?
								order by c.CONTROL_NAME, mr.RUN_FOR_DATE desc`,
				[params.stakeholderReportId, params.filterFromDate, params.filterToDate],
				function (err, row) {
					if (err) {
						console.log(err);
						cb(err)
					}
					else {
						cb(null, row);
					}
				});	
		},
		'controlResultsDays': function (cb) {
			// Control results
			db.query(`select
									c.CONTROL_NAME PROCESSNAME,
									ifnull(mr.RUN_FOR_DATE, t.DATE) RUN_FOR_DATE,
									mr.STARTRUNDATE,
									mr.RUN_DURATION,
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
									a.ALARM_ID,
									a.ASSIGNED_TO ALARM_ASSIGNED_TO,
									a.NOTE ALARM_NOTE,
									i.INCIDENT_ID,    
									i.STATUS INCIDENT_STATUS,
									mr.KPI_JSON,
									mr.VERSION
								from AMX_TIME_DAY t  
								cross join mm_stakeholder_report r
								join amx_opco o on o.OPCO_ID = r.OPCO_ID
								join mm_stakeholder_report_control_link rcl on rcl.STAKEHOLDER_REPORT_ID = r.STAKEHOLDER_REPORT_ID
								join v_cvg_control c on c.CONTROL_REF = rcl.CONTROL_REF
								left join mm_ma_runhistory_sum mr on mr.PROCESSNAME = c.CONTROL_NAME and mr.OPCO_ID=r.OPCO_ID and mr.RUN_FOR_DATE = t.DATE
								left join amx_alarm a on a.OPCO_ID = r.OPCO_ID and a.SOURCE = 'CONTROL' and a.OBJECT_ID = mr.PROCESSNAME and a.OBJECT_DATE = mr.RUN_FOR_DATE
								left join amx_incident i on i.OPCO_ID = mr.OPCO_ID and i.INCIDENT_ID = a.INCIDENT_ID
								where 1=1
									and t.DATE between ? and ?
									and r.STAKEHOLDER_REPORT_ID = ?
								order by c.CONTROL_NAME, t.DATE`,
				[params.filterFromDate, params.filterToDate, params.stakeholderReportId],
				function (err, row) {
					if (err) {
						console.log(err);
						cb(err)
					}
					else {
						cb(null, row);
					}
				});
		},
		'incidents': function (cb) {
			// Control results
			db.query(`select
							INCIDENT_ID,
							OPCO_ID,
							METRIC_ID,
							METRIC_DESCRIPTION,
							OPENING_DATE,
							END_DATE,
							CLOSING_DATE,
							STATUS_DATE,
							DUE_DATE,
							AREA,
							PROBLEM_DESCRIPTION,
							CLASIFICATION,
							ROOT_CAUSE,
							IMPACT_TYPE,
							IMPACT,
							RECOVERED,
							PREVENTED,
							CORRECTIVE_ACTION,
							RESPONSIBLE_TEAM,
							RESPONSIBLE_PERSON,
							RESPONSIBLE_DIRECTOR,
							STATUS,
							CREATED_BY,
							MODIFIED_BY,
							STATUS_BY,
							INC_NUMBER,
							NOTES,
							PROCEDURE_AMX_ID
						from amx_incident
						where INCIDENT_ID in (
							select 
								distinct i.INCIDENT_ID
							from mm_stakeholder_report r
							join mm_stakeholder_report_control_link rcl on rcl.STAKEHOLDER_REPORT_ID = r.STAKEHOLDER_REPORT_ID
							join v_cvg_control c on c.CONTROL_REF = rcl.CONTROL_REF
							join amx_incident i on i.OPCO_ID = r.OPCO_ID and i.METRIC_ID like concat('%', c.CONTROL_NAME, '%')
							where 1=1
							and ( 
									(ifnull(i.CLOSING_DATE, curdate()) between ? and ?) or
									(ifnull(i.OPENING_DATE, curdate()) between ? and ?) or
									(ifnull(i.END_DATE, curdate()) between ? and ?)
								)
							and r.STAKEHOLDER_REPORT_ID = ?
                            
                            union 
                            
							select 
								distinct a.INCIDENT_ID
							from mm_stakeholder_report r
							join mm_stakeholder_report_control_link rcl on rcl.STAKEHOLDER_REPORT_ID = r.STAKEHOLDER_REPORT_ID
							join v_cvg_control c on c.CONTROL_REF = rcl.CONTROL_REF
							join amx_alarm a on a.OPCO_ID = r.OPCO_ID and a.SOURCE = 'CONTROL' and a.OBJECT_ID = c.CONTROL_NAME
							where 1=1
							and ifnull(a.OBJECT_DATE, curdate()) between ? and ?
							and r.STAKEHOLDER_REPORT_ID = ?
						)
					order by STATUS desc, OPENING_DATE
					`,
				[params.filterFromDate, params.filterToDate, params.filterFromDate, params.filterToDate, params.filterFromDate, params.filterToDate, params.stakeholderReportId, params.filterFromDate, params.filterToDate, params.stakeholderReportId],
				function (err, row) {
					if (err) {
						console.log(err);
						cb(err)
					}
					else {
						cb(null, row);
					}
				});
		}		
	}, // final callback
		function (err, results) {
			if (!err) {
				db.query('update mm_stakeholder_report set hits=hits+1 where STAKEHOLDER_REPORT_ID=?', [params.stakeholderReportId], function(err){
					if (!err) {
						var io = req.app.get('socketio');
						io.emit(('stakeholderReport:hit:' + results.reportInfo.OPCO_ID), { toast: 'Stakeholder report "' + results.reportInfo.STAKEHOLDER_REPORT + '" just visited'});
					}
				});
				return res.status(200).json({
					message: 'Report generated success',
					results: results,
					params: params,
					success: true
				});
			}
			else {
				return res.status(500).json({
					message: 'Report generation failed',
					params: params,
					success: false
				})
			}
		}
	);

}

export function getStakeholderReportLinkedControls(req, res, next) {
	if (!req.query.reportId) {
		return res.status(400).json({
			message: 'You must provide Report ID parameter',
			success: false
		});
	}

	db.query(`SELECT c.* FROM mm_stakeholder_report_control_link l
						join v_cvg_control c on c.CONTROL_REF = l.CONTROL_REF
						where l.STAKEHOLDER_REPORT_ID = ?
		`,
		[req.query.reportId],
		function (err, row) {
			if (err !== null) {
				console.log(err);
				next(err);
			}
			else {
				res.json(row);
			}
		});
}

export function getStakeholderReportControls(req, res, next) {
	if (!req.query.reportId) {
		return res.status(400).json({
			message: 'You must provide Report ID parameter',
			success: false
		});
	}

	db.query(`select 
							c.*
						from mm_stakeholder_report r
						join v_cvg_control c on c.OPCO_ID = r.OPCO_ID and c.CONTROL_TYPE = 'C'
						where 1=1
							and r.STAKEHOLDER_REPORT_ID = ? 
							and c.CONTROL_REF not in (select CONTROL_REF from mm_stakeholder_report_control_link where STAKEHOLDER_REPORT_ID = ?)
		`,
		[req.query.reportId, req.query.reportId],
		function (err, row) {
			if (err !== null) {
				console.log(err);
				next(err);
			}
			else {
				res.json(row);
			}
		});
}

export function linkStakeholderReportControls(req, res, next) {
	if (!req.query.reportId) {
		return res.status(400).json({
			message: 'You must provide Report ID parameter',
			success: false
		});
	}

	async.forEach(req.body,
		function (control, callback) {
			db.query(`insert ignore into mm_stakeholder_report_control_link (STAKEHOLDER_REPORT_ID, CONTROL_REF) 
								values (?,?)`,
				[req.query.reportId, control.CONTROL_REF],
				function (err, row) {
					if (err) {
						console.log(err);
					}
					callback();
				});
		},
		function () {
			res.json({ success: true });
		});
}

export function unlinkStakeholderReportControls(req, res, next) {
	if (!req.query.reportId) {
		return res.status(400).json({
			message: 'You must provide Report ID parameter',
			success: false
		});
	}

	async.forEach(req.body,
		function (control, callback) {
			db.query(`delete from mm_stakeholder_report_control_link 
								where STAKEHOLDER_REPORT_ID=? and CONTROL_REF=?`,
				[req.query.reportId, control.CONTROL_REF],
				function (err, row) {
					if (err) {
						console.log(err);
					}
					callback();
				});
		},
		function () {
			res.json({ success: true });
		});
}

export function postStakeholderReport(req, res, next) {
	if (req.body.STAKEHOLDER_REPORT_ID) {
		// UPDATE
		db.query(`
		UPDATE mm_stakeholder_report
		set
			STAKEHOLDER_REPORT=?,
			STAKEHOLDER_REPORT_DESCRIPTION=?,
			REPORT_CONTROL_RUNS=?,
			REPORT_CONTROL_DESC=?,
			REPORT_INCIDENTS=?
		where STAKEHOLDER_REPORT_ID=?
		`,
			[	req.body.STAKEHOLDER_REPORT,
				req.body.STAKEHOLDER_REPORT_DESCRIPTION,
				req.body.REPORT_CONTROL_RUNS,
				req.body.REPORT_CONTROL_DESC,
				req.body.REPORT_INCIDENTS,
				req.body.STAKEHOLDER_REPORT_ID,
		],
			function (err, row) {
				if (err !== null) {
					console.log(err);
					next(err);
				}
				else {
					var io = req.app.get('socketio');
					io.emit(('stakeholderReport:' + req.body.OPCO_ID), { toast: 'New stakeholder report "' + req.body.STAKEHOLDER_REPORT + '" created' });
					res.json({ success: true, reportId: row.insertId });
				}
			});
	}
	else {
		// INSERT
		db.query(`
		INSERT INTO mm_stakeholder_report
			(OPCO_ID,
			STAKEHOLDER_REPORT,
			STAKEHOLDER_REPORT_DESCRIPTION,
			REPORT_CONTROL_RUNS,
			REPORT_CONTROL_DESC,
			REPORT_INCIDENTS)
		VALUES
			(?,?,?,?,?,?)
		`,
			[req.body.OPCO_ID,
			req.body.STAKEHOLDER_REPORT,
			req.body.STAKEHOLDER_REPORT_DESCRIPTION,
			req.body.REPORT_CONTROL_RUNS,
			req.body.REPORT_CONTROL_DESC,
			req.body.REPORT_INCIDENTS],
			function (err, row) {
				if (err !== null) {
					console.log(err);
					next(err);
				}
				else {
					var io = req.app.get('socketio');
					io.emit(('stakeholderReport:' + req.body.OPCO_ID), { toast: 'New stakeholder report "' + req.body.STAKEHOLDER_REPORT + '" created' });
					res.json({ success: true, reportId: row.insertId });
				}
			});
	}


}

export function deleteStakeholderReport(req, res, next) {

	db.query(`DELETE
						FROM mm_stakeholder_report
						WHERE STAKEHOLDER_REPORT_ID = ?
`, 
	[req.params.reportId], 
	function(err, row) {
		if(err !== null) {
			console.log(err);
			next(err);
		}
		else {
			if (row.affectedRows > 0) {
				var io = req.app.get('socketio');
				io.emit(('stakeholderReport:' + req.body.OPCO_ID), { toast: 'Stakeholder report ID:"' + req.params.reportId + '" deleted' });
			}
			res.json({
				message: 'Report deleted',
				success: true
			});
		}
	});
}

export function unlinkControl(req, res, next) {

	db.query(`DELETE
						FROM mm_stakeholder_report
						WHERE STAKEHOLDER_REPORT_ID = ?
`,
		[req.params.reportId],
		function (err, row) {
			if (err !== null) {
				console.log(err);
				next(err);
			}
			else {
				res.json(row);
			}
		});
}