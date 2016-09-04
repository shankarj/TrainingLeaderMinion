var genUtils = require('./utils/general.js');
var config = require('./config.js');
var processes = require('child_process');

// Leader id.
var myId = "localhost:8081";

// Details of all the minions running in the host. 
var minionDetails = [
];

var memoryOperations = {
    getMyId: function () {
        return myId
    },
    getAllMinionIds: function () {
        var finalList = [];
        minionDetails.forEach(function (minionJson) {
            finalList.push(minionJson.minionId);
        });
        return finalList;
    },
    getIdleMinion: function () {
        for (var minionJson of minionDetails) {
            if (minionJson["trainingSessions"].length == 0) {
                return minionJson["minionId"];
            }
        }
    },
    getAllMinionDetails: function () {
        return minionDetails;
    },
    getMinionDetails: function (minionId) {
        var retVal = null;
        minionDetails.forEach(function (minionJson) {
            if (minionJson["minionId"] === minionId) {
                retVal = minionJson;
            }
        });

        return retVal;
    },
    createMinionProcess: function () {
        var highestPort = 0;

        minionDetails.forEach(function (minionJson) {
            var port = parseInt(minionJson["minionId"].split(":")[1]);
            highestPort = port > highestPort ? port : highestPort;
        });

        var minionPort = highestPort == 0 ? config[process.env.environment].startingMinionPort : highestPort + 1;
        var minionProcessPath = __dirname.replace("TrainingLeaderMinion", "TrainingMinion/");
        var minionId = myId.split(":")[0] + ":" + minionPort
        processes.spawn("python3", [minionProcessPath + "server.py", minionPort, minionId], { encoding: 'utf8' });

        return minionPort;
    },
    createMinionInMemory: function (minionId) {
        var newMinionJson = {
            "minionId": minionId,
            "trainingSessions": [],
            "runningSessions": []
        }
        minionDetails.push(newMinionJson);
    },
    addTrainingSessionToMinion: function (minionId, sessionId) {
        minionDetails.forEach(function (minionJson) {
            if (minionJson["minionId"] === minionId) {
                minionJson.trainingSessions.push(sessionId);
            }
        });
    },
    removeTrainingSessionFromLeader: function (minionId, sessionId) {
         for (var minionJson of minionDetails){ 
            if (minionJson["minionId"] === minionId) {
                var index = minionJson.trainingSessions.indexOf(sessionId);
                if (index != -1){
                    minionJson.trainingSessions.splice(index, 1);
                }
            }
        }
    },
    addRunningSessionToMinion: function (minionId, sessionId) {
        minionDetails.forEach(function (minionJson) {
            if (minionJson["minionId"] === minionId) {
                minionJson.runningSessions.push(sessionId);
            }
        });
    },
    getMinionWithTrainingSession: function (sessionId) {
        var minionId = null;
        minionDetails.forEach(function (minionJson) {
            minionJson.trainingSessions.forEach(function (tSessionId) {
                if (tSessionId === sessionId) {
                    minionId = minionJson.minionId;
                }
            });
        });

        return minionId;
    },
    getMinionWithRunningSession: function (sessionId) {
        var minionId = null;
        minionDetails.forEach(function (minionJson) {
            minionJson.runningSessions.forEach(function (rSessionId) {
                if (rSessionId === sessionId) {
                    minionId = minionJson.minionId;
                }
            });
        });

        return minionId;
    }


};


module.exports = memoryOperations;
