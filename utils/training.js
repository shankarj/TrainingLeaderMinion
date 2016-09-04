var request = require('request');
var config = require('../config.js');
var memory = require('../memory.js');

var utilMethods = {
    postMinionCreationRoutineToTrain: function (minionId, sessionId, res) {
		var minionUrl = "http://" + minionId;
		var options = {
			url: minionUrl + "/minion/health/",
			method: 'GET',
		};

		request(options, function (error, response, body) {
			var result = { status: "", message: null };
			if (!error && response.statusCode == 200) {
				memory.createMinionInMemory(minionId);
				memory.addTrainingSessionToMinion(minionId, sessionId);
				utilMethods.callTrainOnMinion(minionId, sessionId, res);
			} else {
				result.status = "error";
				result.message = "Error while calling minion for health check.";
				res.json(result);
			}
		});
    },
	callTrainOnMinion: function (minionId, sessionId, res) {
		var minionUrl = "http://" + minionId;
		var options = {
			url: minionUrl + "/minion/train/" + sessionId,
			method: 'GET',
		};

		request(options, function (error, response, body) {
			var result = { status: "", message: null };
			if (!error && response.statusCode == 200) {
				result = body;
			} else {
				result.status = "error";
				result.message = "Error while calling training on the minion.";
			}

			res.json(result);
		});
	}
};

module.exports = utilMethods;