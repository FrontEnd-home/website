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

			this.$el = $("<div></div>");
			this.dirName = data.enname;
			this.dirData = data;
			this.render(data);
			this.bindEvent();
		},
		renderTitle: function(){
			var titleTpl = '<a href="/<%=enname%>" class="_list-item _icon-<%=enname%> _list-dir"><span class="_list-arrow"></span><%=name%></a>';
			var render = _.template(titleTpl);
			var html = render(this.dirData);
			this.$el.append(html);
		},
		renderBody: function(){
			var enname = this.dirData.enname;
			var subData = this.dirData.sublist;
			this.subDir = $("<div class='_list _list-sub'></div>");
			var self = this;
			var bodyTpl = [
				'<%subData.forEach(function(v){%>',
				'<a href="/<%=parent%>/<%=v.enname%>" class="_list-item _icon-<%=v.enname%> _list-dir" data-slug="<%=v.enname%>">',
					'<span class="_list-arrow"></span>',
					'<span class="_list-count"><%=v.quality%></span>',
					'<%=v.name%>',
				'</a>',
				'<%})%>'
			].join("");
			var render = _.template(bodyTpl);
			var html = render({
				subData: subData,
				parent : enname
			});
			this.subDir.append(html);
			this.$el.append(this.subDir);
		},
		render: function(data){
			this.$el.empty();
			this.renderTitle();
		},
		bindEvent: function(e){
			var self = this;
			var arrowQuery = "a._icon-" + this.dirName + " ._list-arrow";
			var dirTitle = "a._icon-" + this.dirName;

			this.$el.delegate(dirTitle, "click", function(e){
				var target = $(e.target);
				if(target.hasClass("_list-arrow")){
					var title = target.parent();
					if(title.hasClass("open")){
						title.removeClass("open");
						self.fire("closeDir");
					} else{
						title.addClass("open");
						self.fire("openDir");
					}
				} else{
					if(!$(this).hasClass("open")){
						$(this).addClass("open");
						self.fire("openDir");
					}
				}
			});

			this.on("openDir", function(){
				if(self.subDir){
					self.subDir.show();
				} else{
					self.renderBody();
				}
			});

			this.on("closeDir", function(){
				if(self.subDir){
					self.subDir.hide();
				}
			});
		}
	});
	module.exports = Dir;
});