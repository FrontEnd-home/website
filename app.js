var path = require('path');
var express = require('express');
var morgan = require('morgan');
var app = express();
var routerController = require("./routes/controller").controller;

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.engine('jade', require('jade').__express);

//@see https://www.npmjs.com/package/morgan 日志格式参考这里format.
app.use(morgan('HTTP/:http-version :method :status :url :response-time ms :date :user-agent :referrer'));
app.use(express.static(__dirname + '/public'));

app.get(/^\/(index|home)?$/, routerController.index);
app.get(/^\/count$/, routerController.count);
app.all(/^\/ajax\/list$/, routerController.ajaxlist);
//app.get(/^\/add/, routerController.add);
app.get(/^\/\w+(\/)?(\w+)?$/, routerController.list);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});