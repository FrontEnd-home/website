define(function(require, exports, module){
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