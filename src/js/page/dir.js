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
			this.dirName = data.enname;
			this.dirData = data;
			this.render(data);
			this.bindEvent();
		},
		renderTitle: function(){
			var titleTpl = '<span class="_list-arrow"></span><%=name%>';
			var render = _.template(titleTpl);
			var html = render(this.dirData);
			this.$el.append(html);
		},
		renderBody: function(){
			var enname = this.dirData.enname;
			var subData = this.dirData.sublist;
			var self = this;
			this.subDir = $("<div class='_list _list-sub'></div>");
			var bodyTpl = [
				'<%subData.forEach(function(v){%>',
				'<a href="/<%=parent%>/<%=v.enname%>" class="_list-item _icon-<%=v.enname%> <%if(v.sublist){%>_list-dir<%}%>" data-slug="<%=v.enname%>">',
					'<%if(v.sublist){%><span class="_list-arrow"></span><%}%>',
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
			this.subDir.insertAfter(this.$el);
		},
		render: function(data){
			this.$el.addClass("_list-item").addClass("_icon-" + this.dirName).attr("href","/" + this.dirName);
			if(this.dirData.sublist){
				this.$el.addClass("_list-dir");
			}
			this.renderTitle();
		},
		bindEvent: function(e){
			var self = this;
			this.$el.on("click", function(e){
				var target = $(e.target);
				if(!$(this).hasClass("open")){
					$(this).addClass("open");
					self.trigger("openDir");
				} else{
					$(this).removeClass("open");
					self.trigger("closeDir");
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