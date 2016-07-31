var genUtilMethods = {
	isEmpty : function(inpObject){
		if ((inpObject === undefined) || (inpObject === null)){
			return true;
		}else{
			return false;
		}
	}
};


module.exports = genUtilMethods;