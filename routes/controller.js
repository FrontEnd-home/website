//默认路由都是index方法，扫描当前目录，根据文件名来确认路由文件
var fs = require("fs");
var path = require("path");
var cmd = path.dirname(__filename);
var routers = fs.readdirSync(cmd);
var controller = {};

routers.forEach(function(filename){
	if(filename && filename != "controller.js"){
		var extname = path.extname(filename);
		var basename = path.basename(filename, extname);
		controller[basename] = require(cmd + path.sep + filename).index;
	}
});

module.exports = {
	controller : controller
}