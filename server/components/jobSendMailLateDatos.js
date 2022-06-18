var db = require("../utils/db");
var _und = require("underscore");
var async = require("async");
var moment = require("moment");
var nodemailer = require('nodemailer');


module.exports = function (callback){

	  console.log('Starting procedure.');


		//SMTP config A1
		var smtpConfigA1 = {
		    host: 'smtp-relay.austria.local',
		    port: 25
		};					      


	  	db.query("select * from AMX_OPCO where OPCO_ID > 0 and  OPCO_ID < 99 order by OPCO_ID", 
	  		function(err, opcos) {

	    	if (err) {
	    		console.log(err);
	    	}

		    async.forEach(opcos, function(opco, callback) {

		        db.query(`
								select * from
								(
									select
									  dc.DATO_ID,
									  'D' FREQUENCY,
									  ifnull(d.BILL_CYCLE,0) BILL_CYCLE,  
									  DATE_FORMAT(t.DATE, '%d.%m.%Y') DATE,
									  ifnull(sys.NAME, 'N/A') SYSTEM_NAME,
									  ifnull(lob.NAME, 'N/A') LOB_NAME,
									  ifnull(tec.NAME, 'N/A') TECHNOLOGY_NAME,
									  ifnull(ser.NAME, 'N/A') SERVICE_NAME,
									  datediff(curdate(), t.DATE) - ifnull(dl.DELAY,2) DAYS_LATE
									from AMX_TIME_DAY t
									join AMX_DATO_CATALOGUE dc on 1=1
									left join V_DIM_DATO dd on 1=1
									  and dd.OPCO_ID = dc.OPCO_ID
									  and dd.DATO_ID = dc.DATO_ID
									  and dd.FREQUENCY = dc.FREQUENCY
									left join AMX_DATO_LAYOUT dl on 1=1
									  and dl.OPCO_ID = dc.OPCO_ID
									  and dl.DATO_ID = dc.DATO_ID
									  and case when dl.PERIODICITY_ID = 1 then '01' else substr(t.DATE, -2, 2) end = '01'
									left join AMX_SYSTEM sys on sys.SYSTEM_ID = dl.SYSTEM_ID
									left join AMX_LOB lob on lob.LOB_ID = dl.LOB_ID
									left join AMX_TECHNOLOGY tec on tec.TECHNOLOGY_ID = dl.TECHNOLOGY_ID
									left join AMX_SERVICE ser on ser.SERVICE_ID = dl.SERVICE_ID
									left join AMX_FILE_DATO d on 1=1
									  and d.OPCO_ID = dl.OPCO_ID 
									  and d.DATO_ID = dl.DATO_ID
									  and d.LOB_ID = dl.LOB_ID
									  and d.REGION_ID = dl.REGION_ID
									  and d.TECHNOLOGY_ID = dl.TECHNOLOGY_ID
									  and d.SERVICE_ID = dl.SERVICE_ID
									  and d.PERIODICITY_ID = dl.PERIODICITY_ID
									  and d.DATE = t.DATE
									left join AMX_FILE_LOG f on f.FILE_ID = d.FILE_ID
									where t.DATE BETWEEN date_sub(curdate(), interval 3 month) and curdate()
											and dc.START_DATE <= t.DATE
                      and dc.OPCO_ID = ?
									    and dc.RELEVANT = 'Y'
									    and dc.IMPLEMENTED = 'Y'
									    and dc.FREQUENCY = 'D'
										and d.FILE_ID is null 
									    and datediff(curdate(), t.DATE) - ifnull(dl.DELAY,2) > 1

									union 

									select
									  dc.DATO_ID,
									  dc.FREQUENCY,
									  ifnull(bc.BILL_CYCLE,0) BILL_CYCLE,  
									  DATE_FORMAT(t.DATE, '%d.%m.%Y') DATE,
									  ifnull(sys.NAME, 'N/A') SYSTEM_NAME,
									  ifnull(lob.NAME, 'N/A') LOB_NAME,
									  ifnull(tec.NAME, 'N/A') TECHNOLOGY_NAME,
									  ifnull(ser.NAME, 'N/A') SERVICE_NAME,
									  datediff(curdate(), t.DATE) - ifnull(dl.DELAY,2) - case when ifnull(bc.CYCLE_CLOSE_DAY, 0) = 0 then datediff(t.LAST_DATE, t.DATE) else ifnull(bc.CYCLE_CLOSE_DAY, 0) end DAYS_LATE
									from AMX_TIME_MONTH t
									join AMX_DATO_CATALOGUE dc on 1=1
									join AMX_BILL_CYCLE bc on 1=1
									  and bc.OPCO_ID = case when dc.FREQUENCY='C' then dc.OPCO_ID else 0 end
									  and (t.CALENDAR_MONTH * substr(bc.CYCLE_TYPE, 2, 1) + substr(bc.CYCLE_TYPE, 3, 1))%2 = 0
									left join AMX_DATO_LAYOUT dl on 1=1
									  and dl.OPCO_ID = dc.OPCO_ID
									  and dl.DATO_ID = dc.DATO_ID
									  and ifnull(dl.BILL_CYCLE, 0) = ifnull(bc.BILL_CYCLE, 0)
									left join AMX_SYSTEM sys on sys.SYSTEM_ID = dl.SYSTEM_ID
									left join AMX_LOB lob on lob.LOB_ID = dl.LOB_ID
									left join AMX_TECHNOLOGY tec on tec.TECHNOLOGY_ID = dl.TECHNOLOGY_ID
									left join AMX_SERVICE ser on ser.SERVICE_ID = dl.SERVICE_ID
									left join AMX_FILE_DATO d on 1=1
									  and d.DATE = t.DATE
									  and d.OPCO_ID = dl.OPCO_ID 
									  and d.DATO_ID = dl.DATO_ID
									  and d.LOB_ID = dl.LOB_ID
									  and d.REGION_ID = dl.REGION_ID
									  and d.TECHNOLOGY_ID = dl.TECHNOLOGY_ID
									  and d.SERVICE_ID = dl.SERVICE_ID
									  and d.PERIODICITY_ID = dl.PERIODICITY_ID
									  and ifnull(d.BILL_CYCLE, 0) = ifnull(dl.BILL_CYCLE, 0)
									left join AMX_FILE_LOG f on f.FILE_ID = d.FILE_ID
									where t.DATE BETWEEN date_sub(curdate(), interval 3 month) and curdate()
										and dc.START_DATE <= t.DATE                                    
										and dc.OPCO_ID = ?
									  and dc.RELEVANT = 'Y'
										and dc.IMPLEMENTED = 'Y'    
									  and dc.FREQUENCY in ('M', 'C')
										and d.FILE_ID is null 
									  and datediff(curdate(), t.DATE) - ifnull(dl.DELAY,2) - case when ifnull(bc.CYCLE_CLOSE_DAY, 0) = 0 then datediff(t.LAST_DATE, t.DATE) else ifnull(bc.CYCLE_CLOSE_DAY, 0) end > 1
								) d
								order by d.DATO_ID 
		        	`, 
		          [opco.OPCO_ID, opco.OPCO_ID], function (err, lateDatos) {

		          if (lateDatos.length) {

									// Mail options
									var htmlTemplate = '';
									var mailOptions = {};
									mailOptions.from = 'A1G RA Dashboard <Group.Revenue.Assurance@a1.group>';
							    mailOptions.cc = [];
	          			mailOptions.subject = '[A1G RA Dashboard][' + opco.OPCO_ID + ']: INFO - ' + 'Delayed datos ' + ' - ' + moment().format("DD.MM.YYYY");

									// HTML TEMPLATE
									htmlTemplate += `	<html><head>
																		<style type="text/css">
																		body 
																		{ 
																			line-height: 1em;font-family: "Verdana";font-size: 11px;
																		} 
																		h1
																		{
																		  line-height: 1em;font-family: "Verdana";font-size: 14px; margin-bottom: 10px;
																		}
																		#rounded-corner 
																		{ 
																			font-family: "Verdana";font-size: 10px;margin: 0px; width: 90%; text-align: center; border-collapse: collapse; 
																		} 
																		#rounded-corner th 
																		{ 
																			padding: 4px; font-weight: bold; font-size: 12px; border-left: 1px solid #FFFFE0; color: #FFF; background: #428BCA; 
																		}
																		tr.d1 td {
																			padding: 4px; font-size: 11px; background: #D0E2F2; border-top: 1px solid #FFFFE0; 
																		  border-left: 1px solid #FFFFE0; text-align: center;	color: #000;
																		}
																		tr.d0 td {
																			padding: 4px; font-size: 11px; background: #E7F1F8; border-top: 1px solid #FFFFE0; border-left: 1px solid #FFFFE0; 
																		  text-align: center; color: #000;
																		}
																		</style></head>
																		<body>
																	`;

									htmlTemplate += '<h1>Delayed datos (past 2 months)</h1>';
									htmlTemplate += '<table id="rounded-corner">';
									htmlTemplate += `
																	<tr>
																	  <th>Dato Id</th>
																	  <th>Date</th>
																	  <th>Frequency</th>
																	  <th>Bill cycle</th>  
																	  <th>System</th>
																	  <th>LoB</th>
																	  <th>Technology</th>
																	  <th>Service</th>
																	  <th>Days late</th>														
																	</tr>
																	`;

									lateDatos.forEach(function(element, index) {
										htmlTemplate += `
																		<tr class="d`+ ((index%2>0)?0:1) +`">
																		  <td align="center"><b>` + element.DATO_ID + `</b></td>
																		  <td align="center">` + element.DATE + `</td>
																		  <td align="center">` + element.FREQUENCY + `</td>
																		  <td align="center">` + (element.BILL_CYCLE?element.BILL_CYCLE:'') + `</td>
																		  <td align="left">` + element.SYSTEM_NAME + `</td>
																		  <td align="left">` + element.LOB_NAME + `</td>
																		  <td align="left">` + element.TECHNOLOGY_NAME + `</td>
																		  <td align="left">` + element.SERVICE_NAME + `</td>
																		  <td align="right">` + element.DAYS_LATE + `</td>
																		</tr>
																		`;									
									});
									
									htmlTemplate += '</table>';
									htmlTemplate += '</body></html>';

									mailOptions.html = htmlTemplate;

							    var mailResult = function(error, info){
							        if(error){
							           console.log(error);
							        }
							        else {
							          //callback({result: true});
							          console.log('Message sent: ' + info.response);
							        }
							    };

						      db.query("select MESSAGE_EMAIL EMAIL from AMX_USER where OPCO_ID = ? and MESSAGE_CONFIG like ?",
						        [opco.OPCO_ID, '%Info":"Y"%'], 
						        function(error, row) {
						          var mailTo = _und.uniq(_und.pluck(row, 'EMAIL'));
											mailOptions.to = mailTo;
						          nodemailer.createTransport(smtpConfigA1).sendMail(mailOptions, mailResult);
						        });

		          	}

		            callback();
		        });
		    	},
		    	// Finally
		    	function () { 
		    		console.log('Update finished.')
						callback({result: true});
		    	}
		    ); // end:async
	  	});
	};