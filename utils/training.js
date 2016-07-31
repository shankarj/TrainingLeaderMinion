var request = require('request');
var config = require('../config.js');
var memory = require('../memory.js');

var utilMethods = {
	deleteTrainingSession: function (sessionId, minionLeaderId, resObject) {
		var minionLeaderUrl = "http://" + minionLeaderId.split(":")[0] + ":" + config[process.env.environment].leaderMinionPort;
		var options = {
			url: minionLeaderUrl + "/delete/",
			method: 'POST',
			json: {
				"sessionid": sessionId,
				"authtoken": ""
			}
		};

		request(options, function (error, response, body) {
			var successDelete = false;
			if (!error && response.statusCode == 200) {
				successDelete = true;
			}

			var retMsg = successDelete ? "Deleted successfully : " + sessionId : "Delete failed : " + sessionId;
			resObject.json({ status: "success", message: retMsg });
		});
	},
	deleteAndCreateSession: function (sessionId, minionId, resObject, scheduleStrategy) {
		var minionLeaderUrl = "http://" + minionId.split(":")[0] + ":" + config[process.env.environment].leaderMinionPort;
		var options = {
			url: minionLeaderUrl + "/delete/",
			method: 'POST',
			json: {
				"sessionid": sessionId,
				"authtoken": ""
			}
		};

		request(options, function (error, response, body) {
			var successDelete = false;
			if (!error && response.statusCode == 200) {
				successDelete = true;
				utilMethods.createSession(sessionId, resObject, scheduleStrategy);
			}
		});
	},
	createSession: function (sessionId, resObject, scheduleStrategy) {
		var strategy = scheduleStrategy === undefined ? config[process.env.environment].trainingScheduleStrategy : scheduleStrategy;
		var choosenHost = memory.getBestFitHost();

		if (choosenHost == null) {
			resObject.json({ status: "error", message: "No minions available for training." });
		}

		var scheduleTraining = true;
		if ((choosenHost.trainingSessions.length >= choosenHost.maxMinionsCount) && (strategy != "force")) {
			scheduleTraining = false;
		}

		if (scheduleTraining) {
			var minionLeaderId = choosenHost.leaderId;
			var minionLeaderUrl = "http://" + minionLeaderId.split(":")[0] + ":" + config[process.env.environment].leaderMinionPort;
			var options = {
				url: minionLeaderUrl + "/start/",
				method: 'POST',
				json: {
					"sessionid": sessionId,
					"authtoken": ""
				}
			};

			request(options, function (error, response, body) {
				var successDelete = false;
				if (!error && response.statusCode == 200) {
					// Update model
					memory.addTrainingSessionToLeader(sessionId, minionLeaderId);
					resObject.end(body);
				} else {
					resObject.json({ status: "success", message: "Error while trying to contact minion for training." });
				}
			});
		} else {
			resObject.json({ status: "error", message: "No minions available for training. Try force scheduling." });
		}
	}
};

module.exports = utilMethods;