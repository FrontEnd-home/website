var gutil = require("gulp-util");
var PluginError = gutil.PluginError;
var through = require("through2");
//var path = require("path");
var uglifyHtml = require("./verdor/uglify-html");

module.exports = function(options) {

  options = options || {};
  var CONTENTS_RE = /([\S\s]*?)define\s*\(\s*function\s*\(.*?\)\s*\{([\S\s]+)\}\s*\)([\S\s]*?)/g;

  var stream = through.obj(function(file, enc, cb) {

    var seajsModule = {};

    var base = null;

    if (!file) {

      this.emit("error", new PluginError("gulp-seajs-transport-text", "files can not be empty"));

      return cb();

    } else if (file.isNull()) {

      //gutil.log(gutil.colors.cyan('warning:'),"files contents should't be null");

      return cb();

    } else if (file.isStream()) {

      this.emit("error", new PluginError("gulp-seajs-transport-text", "streaming not supported"));

      return cb();

    } else if (file.isBuffer()) {

      if (options.base) {

        base = path.join(file.cwd, options.base);

      } else {

        base = file.base;

      }

      //压缩html.
      var html = file.contents.toString();

      html = uglifyHtml(html, file.path);

      html = JSON.stringify(html);

      seajsModule.id = parseId(file.path, base);

      seajsModule.contents = html;

      var transportModule = parseTransportTemplate(seajsModule);



      file.contents = new Buffer(transportModule);

      this.push(file);

      cb();
    } else {

      return cb();
    }
  })

  return stream;
  /*
   得到模块ID,相对于某个base路径的
   filepath:/root/ab/c/d.js
   transportBase:/root/ab

   =>c/d
   */
  function parseId(filepath, transportBase) {
      //var extname = path.extname(filepath).slice(1);

      var id = filepath
          .replace(transportBase, "")//得到相对于base的路径
          .replace(/\\/g, "/")//将windows下的反斜线转成斜线
          .replace(/^\/|\.\w+$/g, "");//去掉路径最前面的斜杠和和后缀

      return "text!" + id;
  }
  /*
   生成transport化后的模块
   */
  function parseTransportTemplate(seajsModule) {
    return 'define("' + 
            seajsModule.id + 
            '", [], function(){return' + seajsModule.contents + '});'
  }
}