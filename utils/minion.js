var request = require('request');
var config = require('../config.js');
var memory = require('../memory.js');
var genUtils = require('../utils/general.js');

var utilMethods = {
    healthCheck: function (minionId, res) {
		var minionUrl = "http://" + minionId;
		var options = {
			url: minionUrl + "/minion/health/",
			method: 'GET',
		};

		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
                var result = { status: "", message: null };
                var jsonObj = JSON.parse(body);
                result.status = "success";
				result.message = jsonObj.message;
                res.json(result);
			} else {
				var result = { status: "", message: null };
				result.status = "error";
				result.message = "Error while calling minion for health check.";
				res.json(result);
			}
		});
	},
    getMinionList: function (minionId, res) {
        var minionLeaderId = minionId.split(":")[0];
        var minionLeaderUrl = "http://" + minionLeaderId + ":" + config[process.env.environment].leaderMinionPort;

        var options = {
            url: minionLeaderUrl + "/minionslist/",
            method: 'POST',
            json: {
                "minionid": minionLeaderId,
                "authtoken": ""
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.end(body);
            }
            else {
                res.json({ status: "success", message: retMsg });
            }
        });

    },
    getLeaderDetails: function (minionId, res) {
        var minionLeaderId = minionId.split(":")[0];
        var minionLeaderUrl = "http://" + minionLeaderId + ":" + config[process.env.environment].leaderMinionPort;

        var options = {
            url: minionLeaderUrl + "/details/",
            method: 'POST',
            json: {
                "minionid": minionLeaderId,
                "authtoken": ""
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.end(body);
            }
            else {
                res.json({ status: "success", message: retMsg });
            }
        });

    },
    deleteMinion: function (minionId, res) {
        var minionLeaderId = minionId.split(":")[0];
        var minionLeaderUrl = "http://" + minionLeaderId + ":" + config[process.env.environment].leaderMinionPort;

        var options = {
            url: minionLeaderUrl + "/delete/",
            method: 'POST',
            json: {
                "minionid": minionLeaderId,
                "authtoken": ""
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.end(body);
            }
            else {
                res.json({ status: "success", message: retMsg });
            }
        });

    },
    getMinionDetails: function (minionId, res) {
        var minionLeaderId = minionId.split(":")[0];
        var minionLeaderUrl = "http://" + minionLeaderId + ":" + config[process.env.environment].leaderMinionPort;

        var options = {
            url: minionLeaderUrl + "/miniondetails/",
            method: 'POST',
            json: {
                "minionid": minionLeaderId,
                "authtoken": ""
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.end(body);
            }
            else {
                res.json({ status: "success", message: retMsg });
            }
        });

    },
    getAllMinionDetails: function (res) {
        var allHostDetails = memory.getAllHostDetails();
        var finalResponse = {status: "", message: {}};
        var hasErrors = false;
        var totalReceived = 0;

        for (var hostJson in allHostDetails) {
            var minionLeaderId = hostJson.leaderId;
            var minionLeaderUrl = "http://" + minionLeaderId + ":" + config[process.env.environment].leaderMinionPort;

            var options = {
                url: minionLeaderUrl + "/miniondetails/",
                method: 'POST',
                json: {
                    "minionid": minionLeaderId,
                    "authtoken": ""
                }
            };

            request(options, function (error, response, body) {
                totalReceived += 1;

                if (!error && response.statusCode == 200) {
                    finalResponse.message[minionLeaderId] = body;
                }
                else {
                    finalResponse.message[minionLeaderId] = "error";
                    hasErrors = true;
                }

                if (totalReceived >= allHostDetails.length){
                    res.json(finalResponse);
                }
            });
        }

    },
    createWithForceSame: function (body, res) {
        var choosenHost = memory.getBestFitHost();
        var createdCount = 0;
        var numNeeded = body.count === undefined ? 1 : body.count;

        if (choosenHost == null) {
            resObject.json({ status: "error", message: "No host available for creating new minion." });
        }

        var finalResponse = {};
        var haveFailures = false;

        for (var i = 0; i < numNeeded; i++) {
            var minionLeaderId = choosenHost.leaderId;
            var minionLeaderUrl = "http://" + minionLeaderId.split(":")[0] + ":" + config[process.env.environment].leaderMinionPort;
            var options = {
                url: minionLeaderUrl + "/create/",
                method: 'POST',
                json: {
                    "sessionid": sessionId,
                    "authtoken": ""
                }
            };

            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    finalResponse["message"][createdCount] = body;
                } else {
                    var message = { status: "error", message: "Error while trying to contact host to create minion." };
                    finalResponse["message"][createdCount] = message;
                    haveFailures = true;
                }

                createdCount += 1;
                if (createdCount >= numNeeded) {
                    finalResponse["status"] = haveFailures ? "partial" : "success";
                    resObject.json(finalResponse);
                }
            });
        }
    },
    createWithNoForceSame: function (body, res) {
        var choosenHost = memory.getBestFitHost();
        var createdCount = 0;
        var numNeeded = body.count === undefined ? 1 : body.count;
        if (choosenHost == null) {
            resObject.json({ status: "error", message: "No host available for creating new minion." });
        }

        var finalResponse = {};
        var actualCreateCount = choosenHost.maxMinionsCount - choosenHost.trainingSessions.length;

        if (actualCreateCount <= 0) {
            resObject.json({ status: "error", message: "No host available for creating new minion with noforcesame strategy." });
        } else {
            actualCreateCount = numNeeded <= actualCreateCount ? numNeeded : actualCreateCount;

            var haveFailures = false;
            for (var i = 0; i < actualCreateCount; i++) {
                var proceedWithCreate = true;
                if ((choosenHost.trainingSessions.length >= choosenHost.maxMinionsCount) && (strategy != "force")) {
                    proceedWithCreate = false;
                }
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
                    if (!error && response.statusCode == 200) {
                        finalResponse["message"][createdCount] = body;
                    } else {
                        var message = { status: "error", message: "Error while trying to contact host to create minion." };
                        finalResponse["message"][createdCount] = message;
                        haveFailures = true;
                    }

                    createdCount += 1;
                    if (createdCount >= actualCreateCount) {
                        finalResponse["status"] = haveFailures ? "partial" : "success";
                        resObject.json(finalResponse);
                    }
                });
            }
        }
    },
    createWithForceDiff: function () {

    },
    createWithNoForceDiff: function () {

    },
};

module.exports = utilMethods;