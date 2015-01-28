/**
 * @class sideBar
 * @desc view类.
 * @date 2015/01/16
 * @author farman(yuhongfei1001@163.com)
 */
define(function(require, exports, module) {
	var Events = require("events");
	var Dir = require("dir");

	var SideBar = Events.extend({
		init: function(parent, data) {
			this._super();

			var self = this;
			this.dirs = [];
			this.parent = parent;
			this.$el = $("<div class='_list'></div>");
			this.render(data);

			this.on("OpenClass", function(){
			});

			this.on("OpenPage", function(){
			});
		},
		render: function(data){
			this.$el.empty();
			var self = this;
			data.forEach(function(item){
				var dirInstance = Dir.newInstance([item]);
				dirInstance.parent = self;
				dirInstance.addObserver(self);
				self.dirs.push(dirInstance);
				self.$el.append( dirInstance.$el );
			});
		},
		onShow: function(){
			self.$el.show();
		},
		onHide: function(){
			self.$el.hide();
		}
	});
	module.exports = SideBar;
});