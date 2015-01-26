define(function(require, exports, module){
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