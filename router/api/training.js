var express = require('express');
var request = require('request');
var memory = require('../../memory.js');
var trainingUtil = require('../../utils/training.js');
var genUtils = require('../../utils/general.js');
var config = require('../../config.js');
var sleep = require('sleep');

var router = express.Router();

router.post('/start/', function (req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)) {
		var response = { status: "error", message: "One or more required params not provided for run." };
		res.json(response);
	} else {
		var minionId = memory.getIdleMinion();
		if (minionId == null) {
			// Create a new minion process
			var port = memory.createMinionProcess(res);
			sleep.sleep(1);

			// Ping for health, create training in memory and call train on the actual minion.
			var newMinionId = memory.getMyId() + ":" + port;
			trainingUtil.postMinionCreationRoutine(newMinionId, req.body.sessionid);
		} else {
			trainingUtil.callTrainOnMinion(minionId, req.body.sessionid);
		}
	}
});

router.post('/pause/', function (req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)) {
		var response = { status: "error", message: "One or more required params not provided for pause." };
		res.json(response);
	} else {
		var minionId = memory.getMinionWithTrainingSession(req.body.sessionid);

		var minionUrl = "http://" + minionId;
		var options = {
			url: minionUrl + "/minion/pause/" + req.body.sessionid,
			method: 'GET',
		};

		request(options, function (error, response, body) {
			var result = { status: "", message: null };
			if (!error && response.statusCode == 200) {
				result = body;
			} else {
				result.status = "error";
				result.message = body;
			}
			res.json(result);
		});
	}
});


router.post('/stop/', function (req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)) {
		var response = { status: "error", message: "One or more required params not provided for stop." };
		res.json(response);
	} else {
		var minionId = memory.getMinionWithTrainingSession(req.body.sessionid);

		var minionUrl = "http://" + minionId;
		var options = {
			url: minionUrl + "/minion/stop/" + req.body.sessionid,
			method: 'GET',
		};

		request(options, function (error, response, body) {
			var result = { status: "", message: null };
			if (!error && response.statusCode == 200) {
				result = body;
			} else {
				result.status = "error";
				result.message = body;
			}
			res.json(result);
		});
	}
});

router.post('/delete/', function (req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)) {
		var response = { status: "error", message: "One or more required params not provided for delete." };
		res.json(response);
	} else {
		var minionId = memory.getMinionWithTrainingSession(req.body.sessionid);

		var minionUrl = "http://" + minionId;
		var options = {
			url: minionUrl + "/minion/delete/" + req.body.sessionid,
			method: 'GET',
		};

		request(options, function (error, response, body) {
			var result = { status: "", message: null };
			if (!error && response.statusCode == 200) {
				result = body;
			} else {
				result.status = "error";
				result.message = body;
			}
			res.json(result);
		});
	}
});

module.exports = router;