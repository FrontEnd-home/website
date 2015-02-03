define("routes",[],function(require,exports,module){
	//@see https://github.com/FrontEnd-home/wiki/blob/master/frontend.md
	var routes = [{
			name: "index",
			match: /^\/(index|index.html)?/i
		},{
			name: "list",
			match: /^\/list\/[\s\S]+/i
		}, {
			name: "tags",
			match: /^\/tags\/[\s\S]+/i
		}, {
			name: "search",
			match: /^\/q\/[\s\S]+/i
		}, {
			name: "golbal_objects",
			match: /^\/golbal_objects\/[\s\S]+/i
		}];
	return routes;
});
define("pageModels",["model"],function(require,exports,module){
	var model = require("model");
	var host = "http://localhost";
	//创建模型的基础方法.
	var createModel = function(url, opt){
		var deafultOpt = {
			url : host + url
		};
		if(opt){
			deafultOpt = $.extend(deafultOpt, opt);
		}
		return model.newInstance([deafultOpt]);
	};
	
	var modelInterface = {};
	modelInterface.getCatory = createModel("/ajax/list");

	module.exports = modelInterface;
	
});
define("pageStores",["storage"],function(require,exports,module){

	var Storage = require("storage");

	function createStorage(key, value, lifetime) {
		var value = value || {};
		var lifetime = lifetime || 0;
		return Storage.newInstance([key, value, lifetime]);
	}

	var storageInterface = {};
	storageInterface.head = createStorage("HEAD");

	module.exports = storageInterface;
});
define("golbal_objects",["view"],function(require,exports,module){
	var View = require("view");

	var listController = View.extend({
		init: function(){
			this._super();
			this.$el.html("golbal_objects");
		},
		onShow: function(){
			console.log("golbal_objects.show!");
		},
		onHide: function(){
			console.log("golbal_objects.hide!");
		}
	});

	module.exports = listController;
});
define("index",["view","text!index"],function(require,exports,module){
	var View = require("view");
	var html = require("text!index");

	var viewController = View.extend({
		init: function(){
			this._super();

			this.$el.html(html);
			
			var self = this;
			this.on("OpenPage", function(page){
				self.$el.append(page+"<br/>");
			});	
			this.on("OpenClass", function(src){
				self.$el.append(src+"<br/>");
			});
		},
		events:{
			
		},
		onShow: function(){

			console.log("index.show!");
		},
		onHide: function(){
			console.log("index.hide!");
		}
	});

	module.exports = viewController;
});
define("list",["view"],function(require,exports,module){
	var View = require("view");

	var listController = View.extend({
		init: function(){
			this._super();

			this.$el.html("list");
		},
		onShow: function(){
			console.log("list.show!");
		},
		onHide: function(){
			console.log("list.hide!");
		}
	});

	module.exports = listController;
});
define("search",["view"],function(require,exports,module){
	var View = require("view");

	var listController = View.extend({
		init: function(){
			this._super();
			this.$el.html("search");
		},
		onShow: function(){
			console.log("search.show!");
		},
		onHide: function(){
			console.log("search.hide!");
		}
	});

	module.exports = listController;
});
define("tags",["view","text!tags"],function(require,exports,module){
	var View = require("view");
	var tpl = require("text!tags");

	var listController = View.extend({
		init: function(){
			this._super();
		},
		render: function(){
			var tagName = location.pathname.replace("/tags/", "");
			var html = _.template(tpl)({
				tagName : tagName
			});
			this.$el.html(html);
		},
		onShow: function(){
			this.render();
			console.log("tags.show!");
		},
		onHide: function(){
			console.log("tags.hide!");
		}
	});

	module.exports = listController;
});