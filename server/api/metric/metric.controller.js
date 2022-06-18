'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postApiEndpoint = postApiEndpoint;
exports.getApiEndpoint = getApiEndpoint;
var db = require("../../utils/db");
var _und = require("underscore");
var moment = require('moment');
var async = require("async");
var math = require('mathjs');
var mailer = require("../../utils/mailer");

function postApiEndpoint(req, res, next) {
  var io = req.app.get('socketio');

  if (req.params.apiEndpoint === "postMetricFlashUpdate") {
    db.query("update AMX_METRIC_CATALOGUE set NOTES = ?, IMPLEMENTED=?, TASKLIST_DONE=? where METRIC_ID = ? and OPCO_ID =?", [req.body.NOTES, req.body.IMPLEMENTED, req.body.TASKLIST_DONE, req.body.METRIC_ID, req.body.OPCO_ID], function (err, row) {
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
  } else if (req.params.apiEndpoint === "recalculateMetric") {

    var metric = req.body;

    var getDatoValue = function (inDato, metric, callback) {

      var inPeriod, inPeriod1, inPeriod2, inPeriod3, inPeriod4;
      var daysInMonth, daysInMonth1, daysInMonth2, daysInMonth3;
      var divisor;
      var myResults = [];

      //Not derived dato
      if (inDato.length === 4) {
        db.query("select ? IN_DATO, 1 DIVISOR, a.* from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE = ? and a.BILL_CYCLE = ? and a.PERIODICITY_ID = ?",
          [inDato, inDato.substr(1, 3), metric.OPCO_ID, metric.DATE, metric.BILL_CYCLE, metric.PERIODICITY_ID],
          function (err, row) {
            if (err) console.log(err);
            for (var i = 0; i < row.length; i++) {
              myResults.push(row[i]);
            }
            callback(myResults);
          });
      }

      //d1 - The daily Dato value of the day before
      else if (inDato.length === 6 && metric.PERIODICITY_ID === 1 && inDato.indexOf("d1") > 0) {
        inPeriod = moment(metric.DATE).subtract(1, 'days').format('YYYY-MM-DD');
        db.query("select ? IN_DATO, 1 DIVISOR, a.* from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE = ? and a.PERIODICITY_ID = ?",
          [inDato, inDato.substr(1, 3), metric.OPCO_ID, inPeriod, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);
          });
      }

      //d2 - The sum of the Dato values for period between (sysdate-7) and sysdate
      else if (inDato.length === 6 && metric.PERIODICITY_ID === 1 && inDato.indexOf("d2") > 0) {
        inPeriod1 = moment(metric.DATE).subtract(6, 'days').format('YYYY-MM-DD');
        //inPeriod2 = moment(metric.DATE).subtract(1, 'days').format('YYYY-MM-DD');
        inPeriod2 = moment(metric.DATE).format('YYYY-MM-DD');
        //stmt = db.prepare("select ? IN_DATO, 1 DIVISOR, a.* from AMX_FILE_DATO a where a.DATO_ID = ? and a.OPCO_ID = ? and a.PERIOD between ? and ?");
        db.query("select ? IN_DATO, a.OPCO_ID, a.DATO_ID, a.LOB_ID, a.REGION_ID, a.TECHNOLOGY_ID, a.SERVICE_ID, a.PERIODICITY_ID, a.BILL_CYCLE, 1 DIVISOR, sum(a.VALUE) VALUE from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE between ? and ?  and a.PERIODICITY_ID = ? group by a.OPCO_ID, a.DATO_ID, a.LOB_ID, a.REGION_ID, a.TECHNOLOGY_ID, a.SERVICE_ID, a.PERIODICITY_ID, a.BILL_CYCLE",
          [inDato, inDato.substr(1, 3), metric.OPCO_ID, inPeriod1, inPeriod2, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);
          });
      }

      //d3 - The sum of the Dato values for period between (sysdate-8) and (sysdate-1)
      else if (inDato.length === 6 && metric.PERIODICITY_ID === 1 && inDato.indexOf("d3") > 0) {
        //inPeriod1 = moment(metric.DATE).subtract(28, 'days').format('YYYY-MM-DD');
        inPeriod1 = moment(metric.DATE).subtract(7, 'days').format('YYYY-MM-DD');
        inPeriod2 = moment(metric.DATE).subtract(1, 'days').format('YYYY-MM-DD');
        //stmt = db.prepare("select ? IN_DATO, 1 DIVISOR, a.* from AMX_FILE_DATO a where a.DATO_ID = ? and a.OPCO_ID = ? and a.PERIOD between ? and ?");
        db.query("select ? IN_DATO, a.OPCO_ID, a.DATO_ID, a.LOB_ID, a.REGION_ID, a.TECHNOLOGY_ID, a.SERVICE_ID, a.PERIODICITY_ID, a.BILL_CYCLE, 1 DIVISOR, sum(a.VALUE) VALUE from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE between ? and ?  and a.PERIODICITY_ID = ? group by a.OPCO_ID, a.DATO_ID, a.LOB_ID, a.REGION_ID, a.TECHNOLOGY_ID, a.SERVICE_ID, a.PERIODICITY_ID, a.BILL_CYCLE",
          [inDato, inDato.substr(1, 3), metric.OPCO_ID, inPeriod1, inPeriod2, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);
          });
      }

      //d4 - The sum of the Dato values for days (sysdate-7) + (sysdate-14) + (sysdate-21) + (sysdate-28)
      else if (inDato.length === 6 && metric.PERIODICITY_ID === 1 && inDato.indexOf("d4") > 0) {
        inPeriod1 = moment(metric.DATE).subtract(28, 'days').format('YYYY-MM-DD');
        inPeriod2 = moment(metric.DATE).subtract(21, 'days').format('YYYY-MM-DD');
        inPeriod3 = moment(metric.DATE).subtract(14, 'days').format('YYYY-MM-DD');
        inPeriod4 = moment(metric.DATE).subtract(7, 'days').format('YYYY-MM-DD');

        db.query("select ? IN_DATO, 1 DIVISOR, a.* from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE in (?, ?, ?, ?) and a.PERIODICITY_ID = ?",
          [inDato, inDato.substr(1, 3), metric.OPCO_ID, inPeriod1, inPeriod2, inPeriod3, inPeriod4, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);
          });
      }

      //d7 - The Dato value of days (sysdate-7)
      else if (inDato.length === 6 && metric.PERIODICITY_ID === 1 && inDato.indexOf("d7") > 0) {
        inPeriod1 = moment(metric.DATE).subtract(7, 'days').format('YYYY-MM-DD');

        db.query("select ? IN_DATO, 1 DIVISOR, a.* from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE = ? and a.PERIODICITY_ID = ?",
          [inDato, inDato.substr(1, 3), metric.OPCO_ID, inPeriod1, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);
          });
      }

      //m1 - Value of the monthly dato divided by days of the month
      else if (inDato.length === 6 && (metric.PERIODICITY_ID === 3 || metric.PERIODICITY_ID === 5) && inDato.indexOf("m1") > 0) {
        daysInMonth = moment(metric.DATE).daysInMonth();
        db.query("select ? IN_DATO, ? DIVISOR, a.* from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE = ? and a.BILL_CYCLE = ? and a.PERIODICITY_ID = ?",
          [inDato, daysInMonth, inDato.substr(1, 3), metric.OPCO_ID, metric.DATE, metric.BILL_CYCLE, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);
          });
      }

      //m2 - Value of the monthly Dato for the month before
      else if (inDato.length === 6 && (metric.PERIODICITY_ID === 3 || metric.PERIODICITY_ID === 5) && inDato.indexOf("m2") > 0) {
        inPeriod = moment(metric.DATE).subtract(1, 'month').format('YYYY-MM-DD');
        db.query("select ? IN_DATO, 1 DIVISOR, a.* from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE = ? and a.BILL_CYCLE = ? and a.PERIODICITY_ID = ?",
          [inDato, inDato.substr(1, 3), metric.OPCO_ID, inPeriod, metric.BILL_CYCLE, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);
          });
      }

      //m3 - Sum of the values of the past 3 months without taking in acount the current month divided by the sum of the number of days in those 3 months
      else if (inDato.length === 6 && (metric.PERIODICITY_ID === 3 || metric.PERIODICITY_ID === 5) && inDato.indexOf("m3") > 0) {
        inPeriod1 = moment(metric.DATE).subtract(3, 'month').format('YYYY-MM-DD');
        daysInMonth1 = moment(metric.DATE).subtract(3, 'month').daysInMonth();

        inPeriod2 = moment(metric.DATE).subtract(2, 'month').format('YYYY-MM-DD');
        daysInMonth2 = moment(metric.DATE).subtract(2, 'month').daysInMonth();

        inPeriod3 = moment(metric.DATE).subtract(1, 'month').format('YYYY-MM-DD');
        daysInMonth3 = moment(metric.DATE).subtract(1, 'month').daysInMonth();

        divisor = daysInMonth3 + daysInMonth2 + daysInMonth1;

        db.query("select ? IN_DATO, ? DIVISOR, a.* from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE in (?, ?, ?) and a.BILL_CYCLE = ? and a.PERIODICITY_ID = ?",
          [inDato, divisor, inDato.substr(1, 3), metric.OPCO_ID, inPeriod1, inPeriod2, inPeriod3, metric.BILL_CYCLE, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);

          });
      }

      //m4 - Monthly average of the daily Dato e.g. sum(Dato_1 to Dato_31 ) / 31
      else if (inDato.length === 6 && metric.PERIODICITY_ID === 1 && inDato.indexOf("m4") > 0) {
        inPeriod1 = moment(metric.DATE).subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        inPeriod2 = moment(metric.DATE).subtract(1, 'month').endOf('month').format('YYYY-MM-DD');

        //not used - I'll divide by the count of found records - should be the same
        daysInMonth = moment(metric.DATE).subtract(1, 'month').daysInMonth();

        db.query("select ? IN_DATO, a.OPCO_ID, a.DATO_ID, a.LOB_ID, a.REGION_ID, a.TECHNOLOGY_ID, a.SERVICE_ID, a.PERIODICITY_ID, a.BILL_CYCLE, count(*) DIVISOR, sum(a.VALUE) VALUE from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE between ? and ? and a.PERIODICITY_ID = ? group by a.OPCO_ID, a.DATO_ID, a.LOB_ID, a.REGION_ID, a.TECHNOLOGY_ID, a.SERVICE_ID, a.PERIODICITY_ID, a.BILL_CYCLE",
          [inDato, inDato.substr(1, 3), metric.OPCO_ID, inPeriod1, inPeriod2, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);

          });
      }

      //m5 - Monthly average of the daily Dato for previous month (like M4 but for month before)
      else if (inDato.length === 6 && metric.PERIODICITY_ID === 1 && inDato.indexOf("m5") > 0) {
        inPeriod1 = moment(metric.DATE).subtract(2, 'month').startOf('month').format('YYYY-MM-DD');
        inPeriod2 = moment(metric.DATE).subtract(2, 'month').endOf('month').format('YYYY-MM-DD');

        //not used - I'll divide by the count of found records - should be the same
        daysInMonth = moment(metric.DATE).subtract(2, 'month').daysInMonth();

        db.query("select ? IN_DATO, a.OPCO_ID, a.DATO_ID, a.LOB_ID, a.REGION_ID, a.TECHNOLOGY_ID, a.SERVICE_ID, a.PERIODICITY_ID, a.BILL_CYCLE, count(*) DIVISOR, sum(a.VALUE) VALUE from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE between ? and ? and a.PERIODICITY_ID = ? group by a.OPCO_ID, a.DATO_ID, a.LOB_ID, a.REGION_ID, a.TECHNOLOGY_ID, a.SERVICE_ID, a.PERIODICITY_ID, a.BILL_CYCLE",
          [inDato, inDato.substr(1, 3), metric.OPCO_ID, inPeriod1, inPeriod2, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);

          });
      }

      //m6 - Value of the monthly dato divided by days of the month for the month before (like M1 but for month before)
      else if (inDato.length === 6 && (metric.PERIODICITY_ID === 3 || metric.PERIODICITY_ID === 5) && inDato.indexOf("m6") > 0) {
        inPeriod = moment(metric.DATE).subtract(1, 'month').format('YYYY-MM-DD');
        daysInMonth = moment(metric.DATE).subtract(1, 'month').daysInMonth();
        db.query("select ? IN_DATO, ? DIVISOR, a.* from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE = ? and a.BILL_CYCLE = ? and a.PERIODICITY_ID = ?",
          [inDato, daysInMonth, inDato.substr(1, 3), metric.OPCO_ID, inPeriod, metric.BILL_CYCLE, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);

          });
      }

      //c1 - Value of the cycle Dato for the month before
      else if (inDato.length === 6 && (metric.PERIODICITY_ID === 3 || metric.PERIODICITY_ID === 5) && inDato.indexOf("c1") > 0) {

        inPeriod = moment(metric.DATE).subtract(Number(metric.CYCLE_FREQ), 'month').format('YYYY-MM-DD');
        db.query("select ? IN_DATO, 1 DIVISOR, a.* from AMX_FILE_DATO a join AMX_DATO_LAYOUT b on b.DATO_ID = a.DATO_ID and b.OPCO_ID = a.OPCO_ID and b.BILL_CYCLE = a.BILL_CYCLE and b.LOB_ID = a.LOB_ID and b.REGION_ID = a.REGION_ID and b.TECHNOLOGY_ID = a.TECHNOLOGY_ID and b.SERVICE_ID = a.SERVICE_ID and b.PERIODICITY_ID = a.PERIODICITY_ID where a.DATO_ID = ? and a.OPCO_ID = ? and a.DATE = ? and a.BILL_CYCLE = ? and a.PERIODICITY_ID = ?",
          [inDato, inDato.substr(1, 3), metric.OPCO_ID, inPeriod, metric.BILL_CYCLE, metric.PERIODICITY_ID],
          function (err, row) {

            if (err || typeof row === 'undefined' || row.length === 0) {
              console.log('Error:' + JSON.stringify(metric));
              console.log(err);
              myResults.push({
                "IN_DATO": inDato,
                "DIVISOR": 1,
                "FILE_ID": null,
                "OPCO_ID": metric.OPCO_ID,
                "DATO_ID": inDato.substr(1, 3),
                "LOB_ID": null,
                "REGION_ID": null,
                "TECHNOLOGY_ID": null,
                "SERVICE_ID": null,
                "PERIODICITY_ID": null,
                "PERIOD": metric.PERIOD,
                "DATE": metric.DATE,
                "BILL_CYCLE": metric.BILL_CYCLE,
                "VALUE": null,
                "FILE_ROWNUM": null,
                "ERROR_CODE": null,
                "CREATED": null
              });
            } else {
              for (var i = 0; i < row.length; i++) {
                myResults.push(row[i]);
              }
            }
            callback(myResults);

          });
      } else {
        myResults.push({
          "IN_DATO": inDato,
          "DIVISOR": 1,
          "FILE_ID": null,
          "OPCO_ID": metric.OPCO_ID,
          "DATO_ID": inDato.substr(1, 3),
          "LOB_ID": null,
          "REGION_ID": null,
          "TECHNOLOGY_ID": null,
          "SERVICE_ID": null,
          "PERIODICITY_ID": null,
          "PERIOD": metric.PERIOD,
          "DATE": metric.DATE,
          "BILL_CYCLE": metric.BILL_CYCLE,
          "VALUE": null,
          "FILE_ROWNUM": null,
          "ERROR_CODE": null,
          "CREATED": null
        });
        callback(myResults);
      }
    }; // callback function

    var myArray = [];
    var datosInFormula = [];
    var datoReg = /#([0-9]{3}([A-Za-z]{1}\d{1})?)/g;

    // parse formula and find all required datos
    while ((myArray = datoReg.exec(metric.FORMULA)) !== null) {
      datosInFormula.push(myArray[0]);
    }
    datosInFormula = _und.sortBy(_und.uniq(datosInFormula), function (e) {
      return -1 * e.length;
    });

    // ****
    // For each dato in metric formula 
    var myResults = [];
    async.forEach(datosInFormula,
      function (inDato, callbackDato) {
        getDatoValue(inDato, metric, function (data) {
          // console.log('call - fn: ' + inDato + ' ' + metric);
          // console.log(data);
          for (var i = 0; i < data.length; i++) {
            myResults.push(data[i]);
          }
          callbackDato();
        });
      },
      // finally
      function () {
        // console.log(myResults);

        //Group multiple dato dimensions
        var groups = _und.groupBy(myResults, 'IN_DATO');
        // console.log('Finally: ' + JSON.stringify(groups));

        //Calculate the sum per DATO_ID
        var sums = _und.map(groups, function (g, key) {
          return {
            IN_DATO: key,
            VAL: Number(_und.reduce(g, function (m, x) {
              return m + x.VALUE / x.DIVISOR;
            }, 0)).toFixed(2),
            CNT: _und.reduce(g, function (m, x) {
              return m + 1;
            }, 0)
          };
        });

        //Replace datos in formula 
        var strFormula = metric.FORMULA;
        var metricResult = 0;
        var metricResultError = null;

        _und.each(datosInFormula, function (datoInFormula) {

          var datoSum = _und.find(sums, function (sum) {
            return sum.IN_DATO === datoInFormula;
          });

          if (typeof datoSum === 'undefined') {
            datoSum = {
              IN_DATO: datoInFormula,
              VAL: 0
            };
          }

          // deal with the wrong weighted average  
          // when one dato in formula divide by number of dimensions 
          if (datosInFormula.length === 1) {
            datoSum.VAL = Number(datoSum.VAL) / Number(datoSum.CNT);
          }

          var datoResult = Number(datoSum.VAL);

          // strFormula = strFormula.replace(datoInFormula, datoResult);
          strFormula = strFormula.replace(new RegExp(datoInFormula, 'g'), datoResult);
        });

        // ...and calculate metric result
        try {
          metricResult = Number(math.eval(strFormula.trim())).toFixed(5);
          if (metricResult === 'Infinity' || metricResult === '-Infinity' || metricResult === 'NaN' || isNaN(metricResult)) {
            metricResultError = 'Error: ' + String(metricResult);
            metricResult = null;
          }
        } catch (e) {
          metricResult = null;
          metricResultError = 'Error: ' + e;
          console.log(strFormula + ' can not be calculated. Error: ' + e);
        }

        // insert into DB
        db.query("replace into AMX_METRIC_RESULT (METRIC_ID, OPCO_ID, PERIOD, PERIODICITY_ID, DATE, BILL_CYCLE, OBJECTIVE, TOLERANCE, JSON_DATO, JSON_DATO_SUMS, FORMULA, FORMULA_EVAL, VALUE, ERROR_CODE) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [metric.METRIC_ID,
            metric.OPCO_ID,
            metric.PERIOD,
            metric.PERIODICITY_ID,
            moment(metric.DATE).format('YYYY-MM-DD'),
            metric.BILL_CYCLE,
            metric.OBJECTIVE,
            metric.TOLERANCE,
            JSON.stringify(_und.sortBy(myResults, 'IN_DATO')),
            JSON.stringify(_und.sortBy(sums, 'IN_DATO')),
            metric.FORMULA,
            strFormula,
            metricResult,
            metricResultError
          ],
          function (err, row) {
            if (err) {
              console.log("DB Insert error:" + err);
              console.log(metric);
              // console.log(JSON.stringify(_und.sortBy(myResults, 'IN_DATO')));
              // callbackMetric({result: false});
            }

            // insert/delete alarm
            var description, link;
            if (metricResult > (metric.OBJECTIVE + metric.TOLERANCE) && metric.IMPLEMENTED === 'Y' && metric.TREND === 'N') {
              description = "Threshold exceeded by " + Number(Math.abs(1 - metricResult / (metric.OBJECTIVE + metric.TOLERANCE)) * 100).toFixed(2) + '% over Tolerance (' + metricResult + ' | ' + metric.OBJECTIVE + ' + ' + metric.TOLERANCE + ') for date ' + moment(metric.DATE).format("DD.MM.YYYY");
              link = "/metric-composite-result?opcoId=" + metric.OPCO_ID + "&metricId=" + metric.METRIC_ID + "&billCycle=" + metric.BILL_CYCLE + "&date=" + moment(metric.DATE).format("YYYY-MM-DD");
              db.query("replace into AMX_ALARM (OPCO_ID, SEVERITY_ID, SEVERITY, SOURCE, OBJECT_ID, OBJECT_DATE, OBJECT_VERSION, DESCRIPTION, LINK) values (?,?,?,?,?,?,?,?,?)",
                [metric.OPCO_ID, 3, 'ERROR', 'METRIC', metric.METRIC_ID, metric.DATE, metric.BILL_CYCLE, description, link]);
              mailer.sendMail(metric.OPCO_ID, [], moment().format("DD.MM.YYYY HH:mm:ss"), 'Error', 'METRIC', 'Metric ' + metric.METRIC_ID + ' tolerance threshold exceeded - ' + moment(metric.DATE).format("DD.MM.YYYY"), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);
            } else if (metricResult > (metric.OBJECTIVE + metric.TOLERANCE) && metric.IMPLEMENTED === 'Y' && metric.TREND === 'Y') {
              description = "Trend metric threshold exceeded by " + Number(Math.abs(1 - metricResult / (metric.OBJECTIVE + metric.TOLERANCE)) * 100).toFixed(2) + '% over Tolerance (' + metricResult + ' | ' + metric.OBJECTIVE + ') for date ' + moment(metric.DATE).format("DD.MM.YYYY");
              link = "/metric-composite-result?opcoId=" + metric.OPCO_ID + "&metricId=" + metric.METRIC_ID + "&billCycle=" + metric.BILL_CYCLE + "&date=" + moment(metric.DATE).format("YYYY-MM-DD");
              db.query("replace into AMX_ALARM (OPCO_ID, SEVERITY_ID, SEVERITY, SOURCE, OBJECT_ID, OBJECT_DATE, OBJECT_VERSION, DESCRIPTION, LINK) values (?,?,?,?,?,?,?,?,?)",
                [metric.OPCO_ID, 2, 'WARNING', 'METRIC', metric.METRIC_ID, metric.DATE, metric.BILL_CYCLE, description, link]);
              mailer.sendMail(metric.OPCO_ID, [], moment().format("DD.MM.YYYY HH:mm:ss"), 'Warning', 'METRIC', 'Metric ' + metric.METRIC_ID + ' objective threshold exceeded - ' + moment(metric.DATE).format("DD.MM.YYYY"), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);
            } else if (!metricResult && metricResultError && metric.IMPLEMENTED === 'Y') {
              description = "Metric calculation error - " + metricResultError + ". (" + strFormula + ') for date ' + moment(metric.DATE).format("DD.MM.YYYY");
              link = "/metric-composite-result?opcoId=" + metric.OPCO_ID + "&metricId=" + metric.METRIC_ID + "&billCycle=" + metric.BILL_CYCLE + "&date=" + moment(metric.DATE).format("YYYY-MM-DD");
              db.query("replace into AMX_ALARM (OPCO_ID, SEVERITY_ID, SEVERITY, SOURCE, OBJECT_ID, OBJECT_DATE, OBJECT_VERSION, DESCRIPTION, LINK) values (?,?,?,?,?,?,?,?,?)",
                [metric.OPCO_ID, 1, 'INFO', 'METRIC', metric.METRIC_ID, metric.DATE, metric.BILL_CYCLE, description, link]);
              mailer.sendMail(metric.OPCO_ID, [], moment().format("DD.MM.YYYY HH:mm:ss"), 'Info', 'METRIC', 'Metric ' + metric.METRIC_ID + ' calculation error - ' + moment(metric.DATE).format("DD.MM.YYYY"), '<b>Description: </b>' + description, 'http://vlreaap001.at.inside:9000/' + link);
            } else {
              // close alarm if exists
              db.query(`update AMX_ALARM set 
                                    STATUS=?, 
                                    NOTE = ?,
                                    ASSIGNED_TO=case when ASSIGNED_TO is not null then ASSIGNED_TO else ? end 
                                  where 1=1
                                    and STATUS!='Closed' 
                                    and OPCO_ID=? 
                                    and OBJECT_ID=? 
                                    and OBJECT_DATE=?
                                    and OBJECT_VERSION=?`,
                ['Closed', 'AUTO Closed - new result is below threshold', 'A1G RA Dashboard', metric.OPCO_ID, metric.METRIC_ID, metric.DATE, metric.BILL_CYCLE]);
            }

            if (err !== null) {
              console.log(err);
              res.json({
                success: false,
                error: err
              });
            } else {
              io.emit(('metric:new:' + req.body.OPCO_ID + ':' + req.body.METRIC_ID), {
                toast: 'New result received for metric "' + req.body.METRIC_ID + '", date ' + moment(req.body.DATE).format('DD.MM.YYYY')
              });
              res.json({
                success: true
              });
            }

            // callbackMetric({result: true});
          }
        ); // end: metric result insert
      } // end: finally function 
    ); // end: async for each dato

    // end metric calculate
  }
}

function getApiEndpoint(req, res, next) {

  if (req.params.apiEndpoint === "getAllMetrics") {
    if (req.query.opcoId === '0') {
      db.query("select \n                  a.*,\n                  ifnull((SELECT sum(case when STATUS = 'Open - OPCO' then 1 else 0 end) from amx_task where OPCO_ID = a.OPCO_ID and SOURCE = 'METRIC' and (OBJECT_ID = a.METRIC_ID or DEPENDENCIES like concat('%',a.METRIC_ID,'%'))), 0) TASKS_OPCO,\n                  ifnull((SELECT sum(case when STATUS = 'Open - TAG' then 1 else 0 end) from amx_task where OPCO_ID = a.OPCO_ID and SOURCE = 'METRIC' and (OBJECT_ID = a.METRIC_ID or DEPENDENCIES like concat('%',a.METRIC_ID,'%'))), 0) TASKS_TAG,\n                  ifnull((SELECT sum(case when STATUS = 'Closed' then 1 else 0 end) from amx_task where OPCO_ID = a.OPCO_ID and SOURCE = 'METRIC' and (OBJECT_ID = a.METRIC_ID or DEPENDENCIES like concat('%',a.METRIC_ID,'%'))), 0) TASKS_CLOSED,\n                  cvc.CVG_RN_CNT, \n                  case\n                    when cvc.CVG_RN_CNT > 0 then 'Y'\n                    when cvc.CVG_RN_CNT = 0 then 'N'\n                  end IN_COVERAGE_MODEL,\n                  cvc.CTRL_COVERAGE,       \n                  cvc.CTRL_COVERAGE_OVERLAP              \n                from AMX_METRIC_CATALOGUE a\n                left join v_cvg_control cvc on cvc.control_id = a.cvg_control_id\n                order by a.AREA_ID, substr(replace(a.METRIC_ID, a.AREA_ID, '000'), -3, 3)", function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });
    } else {
      db.query("select \n                  a.*,\n                  ifnull((SELECT sum(case when STATUS = 'Open - OPCO' then 1 else 0 end) from amx_task where OPCO_ID = a.OPCO_ID and SOURCE = 'METRIC' and (OBJECT_ID = a.METRIC_ID or DEPENDENCIES like concat('%',a.METRIC_ID,'%'))), 0) TASKS_OPCO,\n                  ifnull((SELECT sum(case when STATUS = 'Open - TAG' then 1 else 0 end) from amx_task where OPCO_ID = a.OPCO_ID and SOURCE = 'METRIC' and (OBJECT_ID = a.METRIC_ID or DEPENDENCIES like concat('%',a.METRIC_ID,'%'))), 0) TASKS_TAG,\n                  ifnull((SELECT sum(case when STATUS = 'Closed' then 1 else 0 end) from amx_task where OPCO_ID = a.OPCO_ID and SOURCE = 'METRIC' and (OBJECT_ID = a.METRIC_ID or DEPENDENCIES like concat('%',a.METRIC_ID,'%'))), 0) TASKS_CLOSED,\n                  cvc.CVG_RN_CNT, \n                  case\n                    when cvc.CVG_RN_CNT > 0 then 'Y'\n                    when cvc.CVG_RN_CNT = 0 then 'N'\n                  end IN_COVERAGE_MODEL,\n                  cvc.CTRL_COVERAGE,\n                  cvc.CTRL_COVERAGE_OVERLAP                  \n                from AMX_METRIC_CATALOGUE a\n                left join v_cvg_control cvc on cvc.control_id = a.cvg_control_id                \n                where a.OPCO_ID = ? \n                order by a.AREA_ID, substr(replace(a.METRIC_ID, a.AREA_ID, '000'), -3, 3)", [req.query.opcoId], function (err, row) {
        if (err !== null) {
          console.log(err);
          next(err);
        } else {
          res.json(row);
        }
      });
    }
  } else if (req.params.apiEndpoint === "getMetricInfo") {
    db.query("select * from AMX_METRIC_CATALOGUE where opco_id = ? and metric_id = ?", [req.query.opcoId, req.query.metricId], function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row[0]);
      }
    });
  } else if (req.params.apiEndpoint === "getLastMetricResult") {
    db.query("select OPCO_ID, METRIC_ID, DATE, BILL_CYCLE from AMX_METRIC_RESULT where opco_id = ? and metric_id = ? order by date desc", [req.query.opcoId, req.query.metricId], function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row[0]);
      }
    });
  } else if (req.params.apiEndpoint === "getMetricResult") {
    db.query("select a.*, b.NAME, b.FREQUENCY, b.TREND from AMX_METRIC_RESULT a join AMX_METRIC_CATALOGUE b on b.OPCO_ID = a.OPCO_ID and b.METRIC_ID = a.METRIC_ID where a.OPCO_ID = ? and a.METRIC_ID = ? and a.BILL_CYCLE = ? and a.DATE = ?", [req.query.opcoId, req.query.metricId, req.query.billCycle, req.query.date], function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row[0]);
      }
    });
  } else if (req.params.apiEndpoint === "getMetricResultHistory") {
    db.query("\n            select * from (\n              select \n                a.RESULT_ID, a.METRIC_ID, a.OPCO_ID, a.PERIOD, a.PERIODICITY_ID, a.CNT, a.DATE, a.BILL_CYCLE, a.OBJECTIVE, a.TOLERANCE, a.JSON_DATO, a.JSON_DATO_SUMS, a.FORMULA, a.FORMULA_EVAL, a.VALUE, a.ERROR_CODE, a.RECALCULATE, a.MODIFIED, null REPLACED, \n                b.NAME, \n                b.FREQUENCY,\n                b.TREND\n              from AMX_METRIC_RESULT a \n              join AMX_METRIC_CATALOGUE b on 1=1\n                and b.OPCO_ID = a.OPCO_ID \n                and b.METRIC_ID = a.METRIC_ID \n              where 1=1 \n                and a.OPCO_ID = ? \n                and a.METRIC_ID = ? \n                and a.BILL_CYCLE = ? \n                and a.DATE = ?\n\n              union \n              \n              select \n                a.RESULT_ID, a.METRIC_ID, a.OPCO_ID, a.PERIOD, a.PERIODICITY_ID, a.CNT, a.DATE, a.BILL_CYCLE, a.OBJECTIVE, a.TOLERANCE, a.JSON_DATO, a.JSON_DATO_SUMS, a.FORMULA, a.FORMULA_EVAL, a.VALUE, a.ERROR_CODE, a.RECALCULATE, a.CALCULATED MODIFIED, a.REPLACED, \n                b.NAME, \n                b.FREQUENCY,\n                b.TREND\n              from AMX_METRIC_RESULT_HIST a \n              join AMX_METRIC_CATALOGUE b on 1=1\n                and b.OPCO_ID = a.OPCO_ID \n                and b.METRIC_ID = a.METRIC_ID \n              where 1=1 \n                and a.OPCO_ID = ? \n                and a.METRIC_ID = ? \n                and a.BILL_CYCLE = ? \n                and a.DATE = ?\n              ) a order by CNT desc\n              ", [req.query.opcoId, req.query.metricId, req.query.billCycle, req.query.date, req.query.opcoId, req.query.metricId, req.query.billCycle, req.query.date], function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row);
      }
    });
  } else if (req.params.apiEndpoint === "calculateMetric") {
    db.query(`insert into AMX_METRIC_RESULT (METRIC_ID, OPCO_ID, PERIODICITY_ID, PERIOD, DATE, BILL_CYCLE, RECALCULATE) 
                values(?,?,?,?,?,0,'Y')`,
      [req.query.metricId, req.query.opcoId, req.query.periodicityId, req.query.period, req.query.date],
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
  } else if (req.params.apiEndpoint === "getRelatedDatos") {
    db.query("select * from AMX_DATO_CATALOGUE \n            where 1=1\n              and OPCO_ID = ? \n              and DATO_ID in (select DATO_ID \n                                from AMX_METRIC_DATO_LINK where 1=1\n                                  and OPCO_ID = ?\n                                  and METRIC_ID = ?\n                              )", [req.query.opcoId, req.query.opcoId, req.query.metricId], function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row);
      }
    });
  } else if (req.params.apiEndpoint === "getRelatedMetrics") {
    db.query("select METRIC_ID, OPCO_ID, RELEVANT from AMX_METRIC_CATALOGUE\n            where 1=1\n                and AREA_ID in (select \n                                  AREA_ID \n                                from AMX_METRIC_CATALOGUE \n                                where 1=1\n                                  and METRIC_ID = ?\n                                  and OPCO_ID = ?)\n                and OPCO_ID = ?\n            order by substr(replace(METRIC_ID, AREA_ID, '000'), -3, 3)", [req.query.metricId, req.query.opcoId, req.query.opcoId], function (err, row) {
      if (err !== null) {
        console.log(err);
        next(err);
      } else {
        res.json(row);
      }
    });
  } else if (req.params.apiEndpoint === "updateRelatedDatos") {

    async.series([

        // delete row
        function (callback) {
          db.query("delete from AMX_METRIC_DATO_LINK where OPCO_ID = ? and METRIC_ID = ?", [req.query.opcoId, req.query.metricId], function (err) {
            callback();
          });
        },

        // parse formula and update AMX_METRIC_DATO_LINK 
        function (callback) {
          db.query("select FORMULA from AMX_METRIC_CATALOGUE where OPCO_ID = ? and METRIC_ID = ?", [req.query.opcoId, req.query.metricId], function (err, row) {
            if (row.length > 0) {
              row = row[0];
            } else {
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
                async.forEach(datos, function (dato, callback) {
                  db.query("insert into AMX_METRIC_DATO_LINK (OPCO_ID, METRIC_ID, DATO_ID) values (?, ?, ?)", [req.query.opcoId, req.query.metricId, dato], function (err, row) {
                    if (err) console.log(err);
                    callback();
                  });
                }, function (err) {
                  if (err) console.log(err);
                  callback();
                });
              },

              // update AMX_DATO_CATALOGUE forEach dato
              function (callback) {
                async.forEach(datos, function (dato, callback) {
                  db.query("select \n                              DATO_ID, \n                              OPCO_ID, \n                              group_concat(METRIC_ID  separator ', ') METRICS\n                            from AMX_METRIC_DATO_LINK\n                            where DATO_ID=? and OPCO_ID=?\n                            group by DATO_ID, OPCO_ID", [dato, req.query.opcoId], function (err, row) {
                    if (err) {
                      console.log(err);
                    }

                    if (row.length > 0) {
                      row = row[0];
                    } else {
                      row = {};
                    }
                    db.query("update AMX_DATO_CATALOGUE \n                              set METRICS = ?\n                              where OPCO_ID = ? and DATO_ID = ?", [row.METRICS, req.query.opcoId, dato], function (err, row) {
                      if (err) console.log(err);
                      callback();
                    });
                  });
                }, function (err) {
                  if (err) console.log(err);
                  callback();
                });
              },

              // update AMX_METRIC_CATALOGUE = 1 row
              function (callback) {
                db.query("select METRIC_ID, OPCO_ID, group_concat(DATO_ID  separator ', ') DATOS\n                        from AMX_METRIC_DATO_LINK\n                        where OPCO_ID = ? and METRIC_ID = ? \n                        group by METRIC_ID, OPCO_ID", [req.query.opcoId, req.query.metricId], function (err, row) {
                  if (row.length > 0) {
                    row = row[0];
                  } else {
                    row = {};
                  }

                  db.query("update AMX_METRIC_CATALOGUE \n                          set DATOS = ?\n                          where OPCO_ID = ? and METRIC_ID = ?", [row.DATOS, req.query.opcoId, req.query.metricId], function (err, row) {
                    if (err) console.log(err);
                    callback();
                  });
                });
              }
            ], function () {
              callback();
            }); // nested async series end
          });
        }
      ],

      //Finally 
      function (datos) {
        res.json({
          success: true
        });
      }); // main async series end

  } //updateRelatedDatos
  else {
    res.json({
      success: false,
      error: 'Method not found: ' + req.params.apiEndpoint
    });
  }
}
//# sourceMappingURL=metric.controller.js.map
