var http = require("http");
var httpOptions = {
  hostname: "localhost",
  port: 3000,
  path: "/",
  method: 'POST',
  headers:{
    "Content-Type":"application/json",
    "charset":"UTF-8"
  }
};

exports.request = function(url, param, callback) {
	httpOptions.path = url;

	var req = http.request(httpOptions, function(res) {
		console.log('STATUS: ' + res.statusCode);
		res.setEncoding('utf8');
		var body = "";
		res.on('data', function(chunk) {
			body += chunk;
		});

		res.on('end', function() {
			callback(null, body);
		});
	});

	req.on('error', function(e) {
		callback(e.message, null);
	});

	req.write(JSON.stringify(param));
	req.end();
};