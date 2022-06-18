'use strict';

var express = require('express');
var controller = require('./stakeholder-report.controller');
var webtoken = require("../../utils/webtoken");

var router = express.Router();

router.get('/public-report', webtoken, controller.getPublicReport);
router.get('/verify-token/:key', controller.verifyToken);
router.get('/controls', webtoken, controller.getStakeholderReportControls);
router.get('/linked-controls', webtoken, controller.getStakeholderReportLinkedControls);
router.get('/:reportId', webtoken, controller.getStakeholderReport);
router.get('/', webtoken, controller.getStakeholderReports);

router.post('/token', webtoken, controller.getToken);
router.post('/link-controls', webtoken, controller.linkStakeholderReportControls);
router.post('/unlink-controls', webtoken, controller.unlinkStakeholderReportControls);
router.post('/', webtoken, controller.postStakeholderReport);

router.delete('/:reportId', webtoken, controller.deleteStakeholderReport);

module.exports = router;
