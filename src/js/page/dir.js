/**
 * @class dir
 * @desc view类.
 * @date 2015/01/16
 * @author farman(yuhongfei1001@163.com)
 */
define(function(require, exports, module) {
	var Events = require("events");

	var Dir = Events.extend({
		init: function(data) {
			this._super();

			this.$el = $("<a></a>");
			this.dirs = [];
			this.dirName = data.slug;
			this.dirData = data;
			this.render(data);
			this.bindEvent();
		},
		renderBody: function(){
			var subData = this.dirData.sublist;
			if(!subData) return;
			var self = this;
			this.subDir = $("<div class='_list _list-sub'></div>");
			subData.forEach(function(item){
				var dirInstance = Dir.newInstance([item]);
				dirInstance.parent = self;
				dirInstance.addObserver(self);
				self.dirs.push(dirInstance);
				self.subDir.append( dirInstance.$el );
				
			});
			this.subDir.insertAfter(this.$el);
		},
		render: function(data){
			this.$el.addClass("_list-item").addClass("_icon-" + this.dirName).attr("href","/" + this.dirName);
			var titleTpl = "";
			if(this.dirData.sublist){
				this.$el.addClass("_list-dir");
				titleTpl += '<span class="_list-arrow"></span>';
			}
			titleTpl += '<span class="_list-count"><%=slug%></span><%=name%>';
			var render = _.template(titleTpl);
			var html = render(this.dirData);
			this.$el.append(html);
		},
		bindEvent: function(e){
			var self = this;
			this.$el.on("click", function(e){
				e.preventDefault();
				var target = $(e.target);
				if(target.hasClass("_list-arrow")){
					var title = target.parent();
					if(title.hasClass("open")){
						title.removeClass("open");
						self.trigger("closeDir");
					} else{
						title.addClass("open");
						self.trigger("openDir");
					}
				} else{
					if(!$(this).hasClass("open")){
						$(this).addClass("open");
						self.trigger("openDir");
					}

					if(!$(this).hasClass("active")){
						self.trigger("changeView", $(this).attr("href"), $(this));
					}
				}
			});

			this.on("openDir", $.proxy(this.openDir, this));
			this.on("closeDir", $.proxy(this.closeDir,this));
		},
		openDir: function(){
			if(this.subDir){
				this.subDir.show();
			} else{
				this.renderBody();
			}
		},
		closeDir: function(){
			if(this.subDir){
				this.subDir.hide();
			}
		}
	});
	module.exports = Dir;
});