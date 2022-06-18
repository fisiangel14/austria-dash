'use strict';

var express = require('express');
var controller = require('./dato.controller');

var router = express.Router();
var webtoken = require("../../utils/webtoken");

router.get('/:apiEndpoint', webtoken, controller.getApiEndpoint);
router.post('/:apiEndpoint', webtoken, controller.postApiEndpoint);
router.delete('/:apiEndpoint', webtoken, controller.deleteApiEndpoint);

module.exports = router;
