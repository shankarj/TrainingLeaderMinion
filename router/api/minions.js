var express = require('express');
var router = express.Router();
var database = require('../../database.js');
var request = require('request');
var memory = require('../../memory.js');
var minionUtil = require('../../utils/minion.js');
var genUtils = require('../../utils/general.js');
var config = require('../../config.js');

router.post('/create/', function (req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)) {
		var response = { status: "error", message: "One or more required params not provided for create minion." };
		res.json(response);
	} else {
		var port = memory.createMinionProcess(res);
		sleep.sleep(1);
		var minionId = memory.getMyId() + ":" + port;
		minionUtil.healthCheck(minionId, res);
	}
});


router.post('/minionofsession/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body.sessionid))) {
		var response = { status: "error", message: "One or more required params not provided to get minion of a session." };
		res.json(response);
	} else {
		var minionId = memory.getMinionWithTrainingSession(req.body.sessionid);
		var presentMode = null;

		if (minionId == null) {
			minionId = memory.getMinionWithRunningSession(req.body.sessionid);
			if (minionId != null) {
				presentMode = "running";
			}
		} else {
			presentMode = "training";
		}

		if (presentMode == null) {
			res.json({ status: "success", message: { "minionid": minionId, "sessionid": req.body.sessionid, "presentinsession": presentMode } });
		}
	}
});

router.post('/list/', function (req, res, next) {
	var minionIds = memory.getAllMinionIds();
	res.json({ status: "success", minions: minionIds });
});

router.post('/all/', function (req, res, next) {
	var minionDetails = memory.getAllMinionDetails();
	res.json({ status: "sucess", "miniondetails": minionDetails });
});

router.post('/details/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body.minionid))) {
		var response = { status: "error", message: "One or more required params not provided to get details of minion." };
		res.json(response);
	} else {
		var minionJson = memory.getMinionDetails(genUtils.isEmpty(req.body.minionid));

		if (null == minionJson){
			return ({status: "error", message: "Given minion id not found."});
		}else{
			return ({status: "success", message: minionJson});
		}
	}
});

router.post('/delete/', function (req, res, next) {
	return ({status: "error", message: "Method not implemented yet."});
});