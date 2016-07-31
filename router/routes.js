var viewsPath = './views/';
var apiPath = './api/';

module.exports = function(app){
//    app.use('/api/training', require(apiPath  + "training"));
//    app.use('/api/sandbox', require(apiPath  + "sandbox"));
//    app.use('/api/minions', require(apiPath  + "minions"));
    app.use('/api/config', require(apiPath  + "config"));   
}