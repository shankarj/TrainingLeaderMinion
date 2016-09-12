var express = require('express');
var request = require('request');
var memory = require('../../memory.js');
var trainingUtil = require('../../utils/training.js');
var genUtils = require('../../utils/general.js');
var config = require('../../config.js');
var sleep = require('sleep');

var router = express.Router();

router.post('/notifydone/', function(req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid)) || (genUtils.isEmpty(req.body.minionid))){
		var response = { status : "error", message : "One or more required params not provided for notifydone."};
		res.json(response);
	}else{
		memory.addRunningSessionToMinion(req.body.minionid, req.body.sessionid);
		memory.removeTrainingSessionFromMinion(req.body.minionid, req.body.sessionid);

		var minionUrl = "http://" + config[process.env.environment].gruId;
		var options = {
			url: minionUrl + "/api/training/notifydone/",
			method: 'POST',
			json: {
				"sessionid": req.body.sessionid,
				"leaderid": memory.getMyId(),
				"minionid": req.body.minionid,
				"parent_id": req.body.parent_id,
				"project_name": req.body.project_name,
				"network_structure": req.body.network_structure,
				"network_conns": req.body.network_conns,
				"create_new_snapshot": req.body.create_new_snapshot
			}
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

router.post('/start/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid))) {
		var response = { status: "error", message: "One or more required params not provided for run." };
		res.json(response);
	} else {
		var minionId = memory.getIdleMinion();
		if (minionId == null) {
			// Create a new minion process
			var port = memory.createMinionProcess();
			sleep.sleep(1);

			// Ping for health, create training in memory and call train on the actual minion.
			var newMinionId = memory.getMyId().split(":")[0] + ":" + port;
			trainingUtil.postMinionCreationRoutineToTrain(newMinionId, req.body.sessionid, res);
		} else {
			trainingUtil.callTrainOnMinion(minionId, req.body.sessionid, res);
		}
	}
});

router.post('/pause/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid))) {
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
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid))) {
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
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid))) {
		var response = { status: "error", message: "One or more required params not provided for delete." };
		res.json(response);
	} else {
		var minionId = memory.getMinionWithTrainingSession(req.body.sessionid);

		if (minionId != null){
			// Error. The service is being trained somewhere already.
			res.json({ status : "error", message : "This service is being trained already. Delete it before issuing a new training request."});
		}else{
			// If session is already running in a minion then delete it locally and at the minion.
			minionId = memory.getMinionWithRunningSession(req.body.sessionid);
			
			if (minionId != null){
				var minionUrl = "http://" + minionId;
				var options = {
					url: minionUrl + "/minion/delete/" + req.body.sessionid,
					method: 'GET',
				};

				request(options, function (error, response, body) {
					var result = { status: "", message: null };
					if (!error && response.statusCode == 200) {
						var resJson = JSON.parse(body);
						if (resJson.status == "success"){
							// Remove from running sessions in minion
							memory.removeRunningSessionFromMinion(minionId, req.body.sessionid);
							result.status = "success";
						}else{
							result.status = "error";
						}
						result.message = resJson.message;
					} else {
						result.status = "error";
						result.message = "Error while contacting minion to delete the running session " + req.body.sessionid;
					}
					res.json(result);
				});
			}else{
				res.json({ status: "error", message: "Could not find minion running the given session id." });
			}
		}
		
	}
});

module.exports = router;