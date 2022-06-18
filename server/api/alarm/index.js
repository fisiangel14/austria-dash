'use strict';

var express = require('express');
var controller = require('./alarm.controller');

var router = express.Router();
var webtoken = require("../../utils/webtoken");

router.get('/:apiEndpoint', webtoken, controller.getApiEndpoint);
router.post('/:apiEndpoint', webtoken, controller.postApiEndpoint);

module.exports = router;
