var schedule = require('node-schedule');
var moment = require("moment");

/*
*
*
*   5:15
*
*   Updates implemented datos
*/
var updateImplementedDatos = require('./jobUpdateImplementedDatos');
var ruleUpdateImplementedDatos = new schedule.RecurrenceRule();
ruleUpdateImplementedDatos.hour = 5;
ruleUpdateImplementedDatos.minute = 15;

var jobUpdateImplementedDatos = schedule.scheduleJob(ruleUpdateImplementedDatos, function () {
    console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobUpdateImplementedDatos' Started");
    updateImplementedDatos(function (data) {
        if (data.result) {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobUpdateImplementedDatos' Finished");
        }
        else {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobUpdateImplementedDatos' Error " + data.error);
        }
    });
});

/*
*
*
*   5:20
*
*   Update metric related datos
*/
var updateAllRelatedDatos = require('./jobUpdateAllRelatedDatos');
var ruleUpdateAllRelatedDatos = new schedule.RecurrenceRule();
ruleUpdateAllRelatedDatos.hour = 5;
ruleUpdateAllRelatedDatos.minute = 30;

var jobUpdateAllRelatedDatos = schedule.scheduleJob(ruleUpdateAllRelatedDatos, function () {
    console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobUpdateAllRelatedDatos' Started");
    updateAllRelatedDatos(function (data) {
        if (data.result) {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobUpdateAllRelatedDatos' Finished!");
        }
        else {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobUpdateAllRelatedDatos' Error:" + data.error);
        }
    });
});

/*
*
*
*   
*
*   Send mail all missing datos
*/
var sendMailLateDatos = require('./jobSendMailLateDatos');
var rulesendMailLateDatos = new schedule.RecurrenceRule();
rulesendMailLateDatos.dayOfWeek = [1, 2, 3, 4, 5];
rulesendMailLateDatos.hour = 15;
rulesendMailLateDatos.minute = 15;

var jobSendMailLateDatos = schedule.scheduleJob(rulesendMailLateDatos, function () {
    console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobSendMailLateDatos' Started");
    sendMailLateDatos(function (data) {
        if (data.result) {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobSendMailLateDatos' Finished!");
        }
        else {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobSendMailLateDatos' Error:" + data.error);
        }
    });
});


/*
*
*
*   *:1, *:31
*
*   Schedule metric calculation for Metrics having updated Datos
*/
var scheduleMetricHavingNewDatoValues = require('./jobScheduleMetricHavingNewDatoValues');
var ruleScheduleMetricHavingNewDatoValues = new schedule.RecurrenceRule();
//ruleScheduleMetricHavingNewDatoValues.hour = 12;
ruleScheduleMetricHavingNewDatoValues.minute = [1, 16, 31, 46];

var jobScheduleMetricHavingNewDatoValues = schedule.scheduleJob(ruleScheduleMetricHavingNewDatoValues, function () {
    console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobScheduleMetricHavingNewDatoValues' Started");
    scheduleMetricHavingNewDatoValues(function (data) {
        if (data.result) {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobScheduleMetricHavingNewDatoValues' Finished!");
        }
        else {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobScheduleMetricHavingNewDatoValues' Error: " + data.error);
        }
    });
});

/*
*
*
*   *:5, *:35
*
*   Calculate due metrics
*/
var calculateMetrics = require('./jobCalculateMetrics');
var ruleCalculateMetrics = new schedule.RecurrenceRule();
ruleCalculateMetrics.minute = [5, 20, 35, 50];

var jobCalculateMetrics = schedule.scheduleJob(ruleCalculateMetrics, function () {
    console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobCalculateMetrics' Started");
    calculateMetrics(function (data) {
        if (data.result) {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobCalculateMetrics' Finished");
        }
        else {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobCalculateMetrics' Error " + data.error);
        }
    });
});

/*
*
*
*   Daily @ 5:30
*
*   Exports Risk Coverage
*/
var coverageHistory = require('./jobCoverageHistory');
var ruleCoverageHistory = new schedule.RecurrenceRule();
ruleCoverageHistory.hour = 5;
ruleCoverageHistory.minute = 30;

var jobCoverageHistory = schedule.scheduleJob(ruleCoverageHistory, function () {
    console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobMonthlyCoverageHistory' Started");
    coverageHistory(function (data) {
        if (data.result) {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobCoverageHistory' Finished");
        }
        else {
            console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - 'jobCoverageHistory' Error " + data.error);
        }
    });
});