/**
 * @class app
 * @desc 单页app类
 * @date 2015/01/08
 * @author farman(yuhongfei1001@163.com)  
 */
define(function(require, exports, module) {
	
	var Parser = require("parser");
	var Events = require("events");
	var SideBar = require("sideBar");

	var App = Events.extend({
		init: function( routes, defaultView ) {
			this._super();
			
			this.$el = $('body');
			this.root = $("._app");
			this.viewsContainer = this.root.find("._container");
			this.sideBarContainer = this.root.find("._sidebar");

			this.views = {};
			this.viewList = [];
			this.currentView = Events.newInstance();
			this.sideBarView = SideBar.newInstance([this, sideBarData]);
			this.sideBarContainer.append( this.sideBarView.$el );

			this.parser = Parser.newInstance([location, routes, defaultView]);
			this.updateView();

			var self = this;
			this.on("start", function(){
				self.obServer();
				self.hideLoading();
			});
		},
		obServer: function(){
			this.registerEvent();
			var self = this;
			this.$el.delegate("a","click", function(e){
				e.preventDefault();
				 var href = $(e.target).attr("href");
				 if(href){
				 	self.trigger("changeView", href);
				 }
			});

			$(window).on("popstate", function(){
				var pathname = location.pathname;
				self.trigger("changeView", pathname);
			});
		},
		registerEvent: function(){
			var self = this;
			this.on("OpenClass", function(data){
				self.currentView.trigger("OpenClass",data);
			});
			this.on("OpenPage", function(data){
				self.currentView.trigger("OpenPage",data);
			});
			this.on("ClassChange", function(newClass){
				self.sideBarView.trigger("ClassChange", newClass);
			});
			this.on("changeView", function(url){
				self.sideBarView.trigger("changeView", url);
				self.viewChange(url);
			});
		},
		viewChange: function(href){
			var path = href || location.pathname;
			this.currentPath = path;
			this.forward(href);
			this.parser.decode(path, "path");
			this.updateView();
		},
		updateView: function(){
			this.view = this.parser.view;
			this.loadView( this.view );
		},
		loadView: function( view ){
			if(!view){
				console.error("have no this page!, please check routes!");
				return;
			}
			this.currentView.trigger("hide");
			if(this.views[view]){
				this.currentView = this.views[view];
			} else{
				try{
					this.currentView = require(view).newInstance();
					this.currentView.parent = this;
					this.currentView.addObserver(this);
					this.viewsContainer.append( this.currentView.$el );
					this.views[view] = this.currentView;
					this.viewList.push(this.currentView);
				}catch(e){
					console.error("have no this view!");
				}
			}
			this.currentView.trigger("show");
		},
		forward: function( page ){
			var currentState = history.state;
			history.pushState(currentState, "", page);
		},
		showLoading: function(){
			this.$el.addClass("_booting _noscript");
		},
		hideLoading: function(){
			this.$el.removeClass("_booting _noscript");
		}
	});

	module.exports = App;
});