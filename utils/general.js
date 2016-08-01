var request = require('request');
var memory = require('../memory.js');
var training = require('../memory.js');

var genUtilMethods = {
	isEmpty: function (inpObject) {
		if ((inpObject === undefined) || (inpObject === null)) {
			return true;
		} else {
			return false;
		}
	}
};


module.exports = genUtilMethods;