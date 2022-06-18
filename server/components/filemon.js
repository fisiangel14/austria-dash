var fs = require("fs");
var path = require("path");

var inputDir = "./shared/input";
var archiveDir = "./shared/archive";

var chokidar = require('chokidar');

var watcher = chokidar.watch(inputDir,{ignored: /[\/\\]\./, persistent: true, awaitWriteFinish: true, usePolling: true, interval: 5000});
var csv = require("fast-csv");
var db = require("../utils/db");

var moment = require('moment');
var async = require("async");

var mailer = require("../utils/mailer");


function lpad(str, length, padString) {
  while (str.length < length) {	
      str = padString + str;
  }
  return str;
}

function getDatoDate(tmpPeriod, tmpPeriodicity) {

	if (tmpPeriodicity === '1') {
		return moment(tmpPeriod, 'YYYYMMDD').format('YYYY-MM-DD');
	}
	else if (tmpPeriodicity === '3') {
		return moment(tmpPeriod, 'YYYYMM').format('YYYY-MM-DD');
	}
	else if (tmpPeriodicity === '5' && tmpPeriod.length > 7 && tmpPeriod.substr(0,2) === '20') {
		return moment(tmpPeriod.substr(0,6), 'YYYYMM').format('YYYY-MM-DD');
	}
	else if (tmpPeriodicity === '5') {
		return moment(tmpPeriod.substr(0,4), 'YYMM').format('YYYY-MM-DD');
	}
	else {
		return moment().format('YYYY-MM-DD');
	}
}

function getDatoBillCycle(tmpPeriod, tmpPeriodicity) {
	if (tmpPeriodicity === '5' && tmpPeriod.length > 7 && tmpPeriod.substr(0,2) === '20') {
		return tmpPeriod.substr(6);
	}
	else if (tmpPeriodicity === '5') {
		return tmpPeriod.substr(4);
	}
	else {
		return 0;
	}
}

var processFile = function (file, callbackFile) {
		console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - Start processing file " + file);
		fs.stat(file, function(err, stat){
			var fileHeader = {};
			var fileContent = [];
			var fileLines = [];

				fileHeader.fullFileName = file;
				fileHeader.baseFileName = path.basename(file);
				fileHeader.archiveFileName = path.join(archiveDir, path.basename(file));
				fileHeader.opcoId = fileHeader.baseFileName.substr(12,2);
				fileHeader.fileSize = stat.size;
				fileHeader.fileNameDate = moment(fileHeader.baseFileName.substr(15,8), "YYYYMMDD").format("YYYY-MM-DD HH:mm:ss");
				fileHeader.fileModifyDate = moment(stat.mtime).format("YYYY-MM-DD HH:mm:ss");
				fileHeader.fileStatus = 1;

				var rownum = 0;

				csv
				.fromPath(file, {delimiter: "@", ignoreEmpty:true})
				.on("error", function(error){
					rownum++;
					console.log(error);
				})
				.on("data", function(data){
					rownum++;
          data = data[0].split(' ').join('|').split('|');

					// if header
					if (rownum === 1) {
						if (data.length === 3) {
							fileHeader.fileHeaderDistinctRows = Number(data[1]);
							fileHeader.fileHeaderDate = moment(data[2], "YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss");
							return;
						}
						else {
							fileHeader.fileStatus = 0;
						}
					}
					// if footer
					else if (data.length === 2) {
						fileHeader.fileHeaderRows = Number(data[1]);
						return;
					}
					// bad record
					else if (data.length !== 8) {
						fileHeader.fileStatus = 0;
						return;
					}
					else {
						var fileLine = {};
						fileLine.DATO_ID = data[0] && lpad(data[0], 3, "0");
						fileLine.VALUE = data[1] && data[1].trim();
						fileLine.LOB_ID = data[2] && data[2].trim();
						fileLine.REGION_ID = data[3] && data[3].trim();
						fileLine.TECHNOLOGY_ID = data[4] && data[4].trim();
						fileLine.SERVICE_ID = data[5] && data[5].trim();
						fileLine.PERIODICITY_ID = data[6] && data[6].trim();
						fileLine.PERIOD = data[7] && data[7].trim();
						fileLine.FILE_ROWNUM = rownum;
						fileLine.OPCO_ID = fileHeader.opcoId;
						fileLine.DATE = getDatoDate(fileLine.PERIOD, String(fileLine.PERIODICITY_ID));
						fileLine.BILL_CYCLE = getDatoBillCycle(fileLine.PERIOD, String(fileLine.PERIODICITY_ID));

						fileLines.push(fileLine);				
					}

				})
				.on("finish", function(){
					//Move file to archive
					fs.rename(fileHeader.fullFileName, path.join(archiveDir, fileHeader.baseFileName), 
						function() {
							console.log("File moved to archive: " + path.join(archiveDir, fileHeader.baseFileName));
					});

					fileHeader.totalRows = rownum - 2;
					//Update Filelog
					db.query('insert into AMX_FILE_LOG (OPCO_ID, FILE_NAME, FILE_SIZE, FILE_NAME_DATE, FILE_HEADER_DATE, FILE_MODIFY_DATE, FILE_HEADER_DISTINCT_DATOS, FILE_HEADER_ROWS, TOTAL_ROWS, STATUS) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
						[fileHeader.opcoId, fileHeader.baseFileName, fileHeader.fileSize, fileHeader.fileNameDate, fileHeader.fileHeaderDate, fileHeader.fileModifyDate, fileHeader.fileHeaderDistinctRows, fileHeader.fileHeaderRows, fileHeader.totalRows,  fileHeader.fileStatus], 
						function (err, row) {

							if (err) {
								console.log(err)
							}

							fileHeader.fileId = row.insertId;

							if (fileHeader.fileStatus) {

								var insertCount = 0;
								async.parallel(
									[
										//Layout in parallel
										function(callback) {
											async.forEach(fileLines, 
											  function (fileRow, callbackFilerow) {
													// If new layout insert layout record
													db.query("insert ignore into AMX_DATO_LAYOUT (DATO_ID, LOB_ID, REGION_ID, TECHNOLOGY_ID, SERVICE_ID, PERIODICITY_ID, OPCO_ID, FROM_FILE_ID, BILL_CYCLE) values (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
														[fileRow.DATO_ID, fileRow.LOB_ID, fileRow.REGION_ID, fileRow.TECHNOLOGY_ID, fileRow.SERVICE_ID, fileRow.PERIODICITY_ID, fileHeader.opcoId, fileHeader.fileId, fileRow.BILL_CYCLE], 
														function (layoutErr, layoutRow) {
															

															if (layoutErr) {
																console.log("Layout error:" + layoutErr);
																console.log(JSON.stringify(fileRow));
															}

															if (layoutRow.insertId > 0) {
																// console.log(layoutRow);
																// save layout in log
																db.query('update AMX_FILE_LOG set NEW_LAYOUT = NEW_LAYOUT + 1 where FILE_ID = ?', 
																	[fileHeader.fileId], function (err, row) {
																		if (err) {
																			console.log(err);
																		}

																		// generate alarms - new Layout
																		var description, link, version;
																		version = fileRow.LOB_ID + '|' + fileRow.REGION_ID + '|' + fileRow.TECHNOLOGY_ID + '|' + fileRow.SERVICE_ID + '|' + fileRow.PERIODICITY_ID;
																		description = "New dato layout received in file '" + fileHeader.baseFileName + "'. Please configure delays and check layout parameters: " + "LOB_ID=" + fileRow.LOB_ID + ", REGION_ID=" + fileRow.REGION_ID + ", TECHNOLOGY_ID=" + fileRow.TECHNOLOGY_ID + ", SERVICE_ID=" + fileRow.SERVICE_ID + ", PERIODICITY_ID=" + fileRow.PERIODICITY_ID + ", BILL_CYCLE=" + fileRow.BILL_CYCLE;
																		link = "/dato-info/" + fileHeader.opcoId + "/" + fileRow.DATO_ID;
																		db.query("replace into AMX_ALARM (OPCO_ID, SEVERITY_ID, SEVERITY, SOURCE, OBJECT_ID, OBJECT_DATE, OBJECT_VERSION, DESCRIPTION, LINK) values (?,?,?,?,?,?,?,?,?)",
																			[fileHeader.opcoId, 1, 'Info', 'DATO', fileRow.DATO_ID, fileRow.DATE, version, description, link]);
																		// Send mail
																		mailer.sendMail(fileHeader.opcoId, [], moment().format("DD.MM.YYYY HH:mm:ss"), 'Info', 'DATO', 'New dato layout for Dato #' + fileRow.DATO_ID + ' - ' + moment(fileRow.DATE).format("DD.MM.YYYY"), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);

																	});
															} 
															callbackFilerow();
															
													});
												}, 
											  function(err){
													if (err) {
														console.log(err);
													}
											    callback();
											  }
											);
										},
										// Row in parallel
										function(callback) {
											async.forEach(fileLines,
												function (fileRow, callbackFilerow) {

													db.query("replace into AMX_FILE_DATO (DATO_ID, LOB_ID, REGION_ID, TECHNOLOGY_ID, SERVICE_ID, PERIODICITY_ID, OPCO_ID, PERIOD, VALUE, FILE_ID, FILE_ROWNUM, DATE, BILL_CYCLE) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
														[fileRow.DATO_ID, fileRow.LOB_ID, fileRow.REGION_ID, fileRow.TECHNOLOGY_ID, fileRow.SERVICE_ID, fileRow.PERIODICITY_ID, fileHeader.opcoId, fileRow.PERIOD, fileRow.VALUE?fileRow.VALUE:null, fileHeader.fileId, fileRow.FILE_ROWNUM, fileRow.DATE, fileRow.BILL_CYCLE],
														function (insertErr, insertRow) {

															if (insertErr) {
																console.log(insertErr);
																console.log(fileRow);

																// generate alarm 
																var description, link, version;
																version = fileRow.LOB_ID + '|' + fileRow.REGION_ID + '|' + fileRow.TECHNOLOGY_ID + '|' + fileRow.SERVICE_ID + '|' + fileRow.PERIODICITY_ID;
																description = "Dato error: '" + insertErr;
																link = '/dato-result/' + fileHeader.opcoId + '/' + fileRow.DATO_ID + '?month=' + moment(fileRow.DATE).format("YYYY-MM");
																db.query("replace into AMX_ALARM (OPCO_ID, SEVERITY_ID, SEVERITY, SOURCE, OBJECT_ID, OBJECT_DATE, OBJECT_VERSION, DESCRIPTION, LINK) values (?,?,?,?,?,?,?,?,?)",
																	[fileHeader.opcoId, 3, 'Error', 'DATO', fileRow.DATO_ID, fileRow.DATE, version, description, link]);
																// Send mail
																mailer.sendMail(fileHeader.opcoId, [], moment().format("DD.MM.YYYY HH:mm:ss"), 'Error', 'DATO', 'Error in Dato #' + fileRow.DATO_ID + ' - ' + moment(fileRow.DATE).format("DD.MM.YYYY"), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);

															}
															else {
																insertCount += 1;
															}

															callbackFilerow();
													});

												}, 
											  function(err){
													if (err) {
														console.log(err);
													}
											    callback();
											  }
											);
										}
									],
									// finally - update file log and move the file to archive
									function () {
										db.query('update AMX_FILE_LOG set SUCCESS_ROWS = ? where FILE_ID = ?', 
											[insertCount, fileHeader.fileId], 
											function(err, row) {
												if (err) {
													console.log(err);
												}

												//Alarms 
												db.query(`select d.*, f.FILE_NAME,
																	case 
																		when dc.DATO_ID is null then concat('Dato: #', d.DATO_ID, ' does not exist in dato catalogue')
																		when lob.LOB_ID is null then concat('Wrong LOB_ID: ', d.LOB_ID)
																		when tec.TECHNOLOGY_ID is null then concat('Wrong TECHNOLOGY_ID: ', d.TECHNOLOGY_ID)
																		when ser.SERVICE_ID is null then concat('Wrong SERVICE_ID: ', d.SERVICE_ID)
																		when per.PERIODICITY_ID is null then concat('Wrong PERIODICITY_ID: ', d.PERIODICITY_ID)
																		when d.DATE = 'Invalid date' then concat('Invalid periodicity value or period format. PERIOD: ', d.PERIOD, ' value does not correspond to defined PERIODICITY_ID: ', d.PERIODICITY_ID)
																		when dc.FREQUENCY ='C' and d.PERIODICITY_ID in (1,3) then concat('Dato periodicity missmatch. Expected Cycle based Dato (PERIODICITY_ID = 5), but provided PERIODICITY_ID is ', d.PERIODICITY_ID, '. Please correct either Dato definition or provide Dato with expected PERIODICITY_ID.')
																		when dc.FREQUENCY ='M' and d.PERIODICITY_ID in (1,5) and dc.DATO_ID != '149' then concat('Dato periodicity missmatch. Expected Monthly Dato (PERIODICITY_ID = 3), but provided PERIODICITY_ID is ', d.PERIODICITY_ID, '. Please correct either Dato definition or provide Dato with expected PERIODICITY_ID.')
																		when dc.FREQUENCY ='D' and d.PERIODICITY_ID in (3,5) and dc.DATO_ID != '149' then concat('Dato periodicity missmatch. Expected Daily Dato (PERIODICITY_ID = 1), but provided PERIODICITY_ID is ', d.PERIODICITY_ID, '. Please correct either Dato definition or provide Dato with expected PERIODICITY_ID.')
																		when bc.BILL_CYCLE is null and dc.FREQUENCY = 'C' then concat('Wrong BILL_CYCLE: ', d.BILL_CYCLE, '. Bill cycle should be numeric and defined in the list of bill cycles')
																		when bc.BILL_CYCLE is null and dc.FREQUENCY !='C' then concat('Dato periodicity missmatch. Provided dato PERIODICITY_ID: ', d.PERIODICITY_ID, ' value does not correspond to Dato frequency definition FREQUENCY=', dc.FREQUENCY, '. Please correct Dato definition or provide Dato with expected PERIODICITY_ID.')
																	end ALARM_DESCRIPTION
																	from AMX_FILE_DATO d
																	join AMX_FILE_LOG f on f.FILE_ID = d.FILE_ID
																	left join AMX_DATO_CATALOGUE dc on dc.OPCO_ID = d.OPCO_ID and dc.DATO_ID = d.DATO_ID
																	left join AMX_LOB lob on lob.LOB_ID = d.LOB_ID
																	left join AMX_TECHNOLOGY tec on tec.TECHNOLOGY_ID = d.TECHNOLOGY_ID
																	left join AMX_SERVICE ser on ser.SERVICE_ID = d.SERVICE_ID
																	left join AMX_PERIODICITY per on per.PERIODICITY_ID = d.PERIODICITY_ID
																	left join AMX_BILL_CYCLE bc on bc.OPCO_ID = case when dc.FREQUENCY='C' then dc.OPCO_ID else 0 end and bc.BILL_CYCLE = d.BILL_CYCLE
																	where 1=1
																		and d.FILE_ID = ?
																		and (dc.DATO_ID is null 
																			or lob.LOB_ID is null 
																			or tec.TECHNOLOGY_ID is null 
																			or ser.SERVICE_ID is null 
																			or per.PERIODICITY_ID is null 
																			or bc.BILL_CYCLE is null 
																			or (dc.FREQUENCY ='C' and d.PERIODICITY_ID in (1,3))
																			or (dc.FREQUENCY ='M' and d.PERIODICITY_ID in (1,5) and dc.DATO_ID != '149') 
																			or (dc.FREQUENCY ='D' and d.PERIODICITY_ID in (3,5) and dc.DATO_ID != '149'))`,
																	[fileHeader.fileId],
												function (err, rows) {

													if (err) {
														console.log(err);
													}

													async.forEach(rows,
														function (row, callback) {
															// generate alarms - new Layout
															var description, link, version;
															version = row.LOB_ID + '|' + row.REGION_ID + '|' + row.TECHNOLOGY_ID + '|' + row.SERVICE_ID + '|' + row.PERIODICITY_ID;
															description = row.ALARM_DESCRIPTION + '. (File: ' + row.FILE_NAME + ', #Line: ' + row.FILE_ROWNUM + ')';
															link = '/dato-result/' + row.OPCO_ID + '/' + row.DATO_ID + '?month=' + moment(row.DATE).format("YYYY-MM");
															db.query("replace into AMX_ALARM (OPCO_ID, SEVERITY_ID, SEVERITY, SOURCE, OBJECT_ID, OBJECT_DATE, OBJECT_VERSION, DESCRIPTION, LINK) values (?,?,?,?,?,?,?,?,?)",
																[row.OPCO_ID, 3, 'Error', 'DATO', row.DATO_ID, row.DATE, version, description, link],
																function (err) {
																	mailer.sendMail(row.OPCO_ID, [], moment().format("DD.MM.YYYY HH:mm:ss"), 'Error', 'DATO', 'Dato ' + row.DATO_ID + ' error - ' + moment(row.DATE).format("DD.MM.YYYY"), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);															
																	callback();
																});
															// Send mail
														},
														function() {
															
															callbackFile();
														}
														);

												});

										});

									}
								); // async parallel
							} // if 
							else {
								// filestatus is 0 - file ERROR
								var description, link, version;
								version = fileHeader.fileId;
								description = 'File header or content format problem. File loading was skipped i.e. no records were loaded even if some were recognized as ok! Please check the file and resubmit it in full again. (File: ' + fileHeader.baseFileName + ')';
								link = "/files/" + fileHeader.baseFileName;
								db.query("replace into AMX_ALARM (OPCO_ID, SEVERITY_ID, SEVERITY, SOURCE, OBJECT_ID, OBJECT_DATE, OBJECT_VERSION, DESCRIPTION, LINK) values (?,?,?,?,?,?,?,?,?)",
									[fileHeader.opcoId, 3, 'Error', 'FILE', fileHeader.fileId, moment(fileHeader.fileModifyDate).format('YYYY-MM-DD'), version, description, link],
									function (err) {
										mailer.sendMail(row.OPCO_ID, [], moment().format("DD.MM.YYYY HH:mm:ss"), 'Error', 'DATO', 'Dato ' + row.DATO_ID + ' error - ' + moment(row.DATE).format("DD.MM.YYYY"), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);															
									});
								callbackFile();
							}
					}); // load file in DB
				}); // CSV on finish
		}); // fstat
};

watcher.on("add", function(file) {	
			processFile(file, 
				function() { 
					console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - File processing finished " + file);
			  //  db.query("END");
				});
	}); // Watcher add

/*
	.on('change', function(file) {console.log('File', file, 'has been changed');})
	.on('unlink', function(file) {console.log('File', file, 'has been removed');})
	.on('error', function(error) {console.error('Error happened', error);})
*/

console.log("Monitoring directory: " + inputDir);