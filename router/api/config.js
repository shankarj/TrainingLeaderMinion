var express = require('express');
var request = require('request');
var memory = require('../../memory.js');

var router = express.Router();

router.get('/test/', function(req, res, next) {
	console.log("here");
});

module.exports = router;