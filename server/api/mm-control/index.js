'use strict';

var express = require('express');
var controller = require('./mm-control.controller');

var router = express.Router();
var webtoken = require("../../utils/webtoken");

router.get('/overview', webtoken, controller.getOverview);
router.get('/control-escalation-notes', webtoken, controller.getControlEscalationNotes);
router.get('/runhistory', webtoken, controller.getRunhistory);
router.get('/results-for-day', webtoken, controller.getControlResultsForDay);
router.get('/monitor', webtoken, controller.getControlMontior);
router.get('/rerun', webtoken, controller.getReRun);
router.get('/open-alarms', webtoken, controller.getOpenAlarms);
router.get('/mm-status', webtoken, controller.getMoneyMapStatus);
router.get('/', webtoken, controller.getOverview);

router.post('/mm-status', webtoken, controller.postMoneyMapStatus);
router.post('/mm-send-request', webtoken, controller.sendMoneyMapRequest);
router.post('/audit', webtoken, controller.postAudit);
router.post('/audit-all', webtoken, controller.postAuditAll);
router.post('/new', webtoken, controller.postNewControl);
router.post('/', webtoken, controller.postNewControl);

router.delete('/rerun/:opcoId/:processName/:runForDate', webtoken, controller.deleteReRun);
router.delete('/:opcoId/:processId/:processName', webtoken, controller.deleteControlResult);

module.exports = router;
