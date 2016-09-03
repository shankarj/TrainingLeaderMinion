var express = require('express');
var router = express.Router();
var request = require('request');
var memory = require('../../memory.js');
var minionUtil = require('../../utils/minion.js');
var genUtils = require('../../utils/general.js');
var config = require('../../config.js');
var sleep = require('sleep');

router.post('/create/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid))) {
		var response = { status: "error", message: "One or more required params not provided for create minion." };
		res.json(response);
	} else {
		var port = memory.createMinionProcess(res);
		sleep.sleep(1);
		var minionId = memory.getMyId().split(":")[0] + ":" + port;
		memory.createMinionInMemory(minionId);
		minionUtil.healthCheck(minionId, res);
	}
});


router.post('/minionofsession/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid))) {
		var response = { status: "error", message: "One or more required params not provided to get minion of a session." };
		res.json(response);
	} else {
		console.log("minionofsession: " + req.body.sessionid);
		var minionId = memory.getMinionWithTrainingSession(req.body.sessionid);
		var presentMode = null;

		console.log("from training sessions: " + minionId);
		if (minionId == null) {
			minionId = memory.getMinionWithRunningSession(req.body.sessionid);
			if (minionId != null) {
				presentMode = "running";
			}

			console.log("from running sessions: " + minionId);
		} else {
			presentMode = "training";
		}

		if (presentMode != null) {
			res.json({ status: "success", message: { "minionid": minionId, "sessionid": req.body.sessionid, "mode": presentMode } });
		}else{
			res.json({ status: "error", message: "session id not found"});
		}
	}
});

router.get('/list/', function (req, res, next) {
	console.log("received list minions call");
	var minionIds = memory.getAllMinionIds();
	res.json({ status: "success", minions: minionIds });
});

router.get('/all/', function (req, res, next) {
	var minionDetails = memory.getAllMinionDetails();
	res.json({ status: "success", "miniondetails": minionDetails });
});

router.post('/miniondetails/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.minionid))) {
		var response = { status: "error", message: "One or more required params not provided to get details of minion." };
		res.json(response);
	} else {
		var minionJson = memory.getMinionDetails(req.body.minionid);

		if (null == minionJson){
			res.json ({status: "error", message: "Given minion id not found."});
		}else{
			res.json ({status: "success", message: minionJson});
		}
	}
});

router.post('/delete/', function (req, res, next) {
	return ({status: "error", message: "Method not implemented yet."});
});

module.exports = router;