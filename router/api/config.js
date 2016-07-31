var express = require('express');
var request = require('request');
var memory = require('../../memory.js');

var router = express.Router();

router.get('/test/', function(req, res, next) {
	console.log("here");
	var port = memory.createMinionProcess(res);
	memory.createMinionInMemory(port);
	var minionId = memory.getMyId() + ":" + port;
	memory.addTrainingSessionToMinion(minionId, "sampleTrainingSession");
	res.json ({ status: "success", message: "Executed minion process create.", port: port });
});

module.exports = router;