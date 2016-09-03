var genUtils = require('./utils/general.js');
var config = require('./config.js');
var process = require('child_process');

// Leader id.
var myId = "localhost:8081";

// Details of all the minions running in the host. 
var minionDetails = [
    {
        "minionId": "localhost:8082",
        "trainingSessions": ["sampleSession"],
        "runningSessions": []
    },
    {
        "minionId": "localhost:8083",
        "trainingSessions": ["sampleSession2"],
        "runningSessions": []
    },
    {
        "minionId": "localhost:8084",
        "trainingSessions": [],
        "runningSessions": ["sampleSession3"]
    }
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
        for (var minionJson in minionDetails) {
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
    createMinionProcess: function (sessionId, res) {
        var highestPort = 0;

        minionDetails.forEach(function (minionJson) {
            var port = parseInt(minionJson["minionId"].split(":")[1]);
            highestPort = port > highestPort ? port : highestPort;
        });

        var minionPort = highestPort == 0 ? config[process.env.environment].startingMinionPort : highestPort + 1;
        var minionProcessPath = __dirname.replace("TrainingLeaderMinion", "TrainingMinion/");

        process.spawn("python3", [minionProcessPath + "server.py", minionPort], { encoding: 'utf8' });

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
