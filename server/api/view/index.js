'use strict';

var express = require('express');
var controller = require('./view.controller');

var router = express.Router();
var webtoken = require("../../utils/webtoken");

router.get('/', webtoken, controller.index);
router.get('/:apiEndpoint', webtoken, controller.getApiEndpoint);

module.exports = router;
