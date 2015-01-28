/**
 * @module ajax
 * @desc ajax请求模块.
 * @date 2015/01/08
 * @author farman(yuhongfei1001@163.com)  
 */
define("ajax",[],function(require,exports,module){

    var ajax = (function ($) {
        /**
        * AJAX GET方式访问接口
        */
        function get(url, data, callback, error) {
            var opt = _getCommonOpt(url, data, callback, error);
            opt.type = 'GET';
            return _sendReq(opt);
        };

        /**
        * AJAX POST方式访问接口
        */
        function post(url, data, callback, error) {
            // data = JSON.stringify(data);
            data = JSON.stringify(data);
            var opt = _getCommonOpt(url, data, callback, error);
            opt.type = 'POST';
            opt.dataType = 'json';
            opt.timeout = 30000;
            opt.contentType = 'application/json';
            return _sendReq(opt);
        };

        /**
        * 以GET方式跨域访问外部接口
        */
        function jsonp(url, data, callback, error) {
            var opt = _getCommonOpt(url, data, callback, error);
            opt.type = 'GET';
            opt.dataType = 'jsonp';
            opt.crossDomain = true;
            return _sendReq(opt);
        };

        /**
        * 以POST方法跨域访问外部接口
        */
        function cros(url, type, data, callback, error) {
            if (type.toLowerCase() !== 'get')
            var newData = "param=" + JSON.stringify(data);
            var opt = _getCommonOpt(url, data, callback, error);
            opt.type = type;
            opt.dataType = 'json';
            opt.crossDomain = true;
            opt.data = newData;
            return _sendReq(opt);
        };

        /**
        * AJAX 提交表单,不能跨域
        * param {url} url
        * param {Object} form 可以是dom对象，dom id 或者jquery 对象
        * param {function} callback
        * param {function} error 可选
        */
        function form(url, form, callback, error) {
            var jdom = null, data = '';
            if (typeof form == 'string') {
                jdom = $('#' + form);
            } else {
                jdom = $(form);
            }
            if (jdom && jdom.length > 0) {
                data = jdom.serialize();
            }
            var opt = _getCommonOpt(url, data, callback, error);
            return _sendReq(opt);
        };

        function _sendReq(opt) {
            var obj = {
                url: opt.url,
                type: opt.type,
                dataType: opt.dataType,
                data: opt.data,
                contentType: opt.contentType,
                timeout: opt.timeout || 50000,
                success: function (res) {
                    opt.callback(res);
                },
                error: function (err) {
                    opt.error && opt.error(err);
                }
            };
            //是否是跨域则加上这条
            if(opt.url.indexOf(window.location.host) === -1) obj.crossDomain = !!opt.crossDomain;
            return $.ajax(obj);
        };

        /**
        * ie 调用 crors
        */
        function _iecros(opt) {
            if (window.XDomainRequest) {
                var xdr = new XDomainRequest();
                if (xdr) {
                    if (opt.error && typeof opt.error == "function") {
                        xdr.onerror = function () {
                            opt.error(); ;
                        };
                    }
                    //handle timeout callback function
                    if (opt.timeout && typeof opt.timeout == "function") {
                        xdr.ontimeout = function () {
                            opt.timeout();
                        };
                    }
                    //handle success callback function
                    if (opt.success && typeof opt.success == "function") {
                        xdr.onload = function () {
                            if (opt.dataType) {//handle json formart data
                                if (opt.dataType.toLowerCase() == "json") {
                                    opt.callback(JSON.parse(xdr.responseText));
                                }
                            } else {
                                opt.callback(xdr.responseText);
                            }
                        };
                    }

                    //wrap param to send
                    var data = "";
                    if (opt.type == "POST") {
                        data = opt.data;
                    } else {
                        data = $.param(opt.data);
                    }
                    xdr.open(opt.type, opt.url);
                    xdr.send(data);
                }
            }
        };

        function _getCommonOpt(url, data, callback, error) {
            return {
                url: url,
                data: data,
                callback: callback,
                error: error
            }
        };

        return {
            get: get,
            post: post,
            jsonp: jsonp,
            cros: cros,
            form: form
        }
    })($);

    module.exports = ajax;
});
/**
 * @module model
 * @desc model模块发请求.
 * @date 2015/01/08
 * @author farman(yuhongfei1001@163.com)  
 */
define("model",["ajax"],function(require,exports,module){
	
	var cAjax = require("ajax");

	var AbstractModel = Class.extend({
		init: function(options) {
			/**
			 * {String} 必填，数据读取url
			 */
			this.url = null;
			/**
			 * {Object|Store} 必选，用于存贮请求参数
			 */
			this.param = {};
			/**
			 * {Function} 可选，数据返回时的自定义格式化函数
			 */
			this.dataformat = null;

			/**
			 * {Function} 可选，存放用于验证的函数集合
			 */
			this.validates = [];

			// 加入debug模式
			this.debug = false;

			/**
			 * {String} 可选，提交数据格式
			 */
			this.contentType = AbstractModel.CONTENT_TYPE_JSON;
			/**
			 * {String} 可选， 提交数据的方法
			 */
			this.method = 'POST';
			/**
			 * {Boolean} 可覆盖，提交参数是否加入head
			 */
			this.usehead = true;

			//@param {Boolean} 可选，是否是用户相关数据
			this.isUserData = false;
			// @description 替代headstore信息的headinfo
			this.headinfo = null;

			//当前的ajax对象
			this.ajax;
			//是否主动取消当前ajax
			this.isAbort = false;

			//参数设置函数
			this.onBeforeCompleteCallback = null;

			/**
			 * {Store} 可选，
			 */
			this.result = {};
			// @param {Boolean} 可选，只通过ajax获取数据，不做localstorage数据缓存
			this.ajaxOnly = false;

			this.initialize(options);
		},
		initialize: function(options) {
			for (var key in options) {
				this[key] = options[key];
			}
			this.assert();
			//不这样this.protocol写不进去，已经存在了就不管了
			//if (!this.baseurl) this.baseurl = AbstractModel.baseurl.call(this, this.protocol);
		},
		assert: function() {
			if (this.url === null) {
				throw 'not override url property';
			}
		},

		pushValidates: function(handler) {
			if (typeof handler === 'function') {
				this.validates.push($.proxy(handler, this));
			}
		},

		/**
		 * 重写父类
		 *  设置提交参数
		 *  @param {String} param 提交参数
		 *  @return void
		 */
		setParam: function(key, val) {
			if (typeof key === 'object' && !val) {
				this.param = _.extend(this.param, key);
			} else {
				this.param[key] = val;
			}
		},

		/**
		 * 获得提交
		 * @param void
		 * @return {Object} 返回一个Object
		 */
		getParam: function() {
			return this.param;
		},

		getTag: function() {
			var params = _.clone(this.getParam() || {});
			return JSON.stringify(params);
		},

		//构建url请求方式，子类可复写，我们的model如果localstorage设置了值便直接读取，但是得是非正式环境
		buildurl: function() {

			var tempUrl = this.url;

			return tempUrl;
		},
		/**
		 * 取model数据
		 * @param {Function} onComplete 取完的回调函
		 * 传入的第一个参数为model的数第二个数据为元数据，元数据为ajax下发时的ServerCode,Message等数
		 * @param {Function} onError 发生错误时的回调
		 * @param {Boolean} ajaxOnly 可选，默认为false当为true时只使用ajax调取数据
		 * @param {Boolean} scope 可选，设定回调函数this指向的对象
		 * @param {Function} onAbort 可选，但取消时会调用的函数
		 */
		execute: function(onComplete, onError, scope, onAbort, params) {

			// @description 定义是否需要退出ajax请求
			this.isAbort = false;

			// @description 请求数据的地址
			var url = this.buildurl();

			var self = this;

			var __onComplete = $.proxy(function(data) {

				if (this.validates && this.validates.length > 0) {

					// @description 开发者可以传入一组验证方法进行验证
					for (var i = 0, len = this.validates.length; i < len; i++) {
						if (!this.validates[i](data)) {

							// @description 如果一个验证不通过就返回
							if (typeof onError === 'function') {
								return onError.call(scope || this, data);
							} else {
								return false;
							}
						}
					}
				}

				// @description 对获取的数据做字段映射
				var datamodel = typeof this.dataformat === 'function' ? this.dataformat(data) : data;

				if (typeof this.onBeforeCompleteCallback === 'function') {
					this.onBeforeCompleteCallback(datamodel);
				}

				if (typeof onComplete === 'function') {
					onComplete.call(scope || this, datamodel, data);
				}

			}, this);

			var __onError = $.proxy(function(e) {
				if (self.isAbort) {
					self.isAbort = false;

					if (typeof onAbort === 'function') {
						return onAbort.call(scope || this, e);
					} else {
						return false;
					}
				}

				if (typeof onError === 'function') {
					onError.call(scope || this, e);
				}

			}, this);

			// @description 从this.param中获得数据，做深copy
			var params = params || _.clone(this.getParam() || {});

			if (this.contentType === AbstractModel.CONTENT_TYPE_JSON) {

				// @description 跨域请求
				return this.ajax = cAjax.cros(url, this.method, params, __onComplete, __onError);
			} else if (this.contentType === AbstractModel.CONTENT_TYPE_JSONP) {

				// @description jsonp的跨域请求
				return this.ajax = cAjax.jsonp(url, params, __onComplete, __onError);
			} else {

				// @description 默认post请求
				return this.ajax = cAjax.post(url, params, __onComplete, __onError);
			}
		},
		/**
		 *  取model数据
		 *  @param {Function} onComplete 取完的回调函
		 *  传入的第一个参数为model的数第二个数据为元数据，元数据为ajax下发时的ServerCode,Message等数
		 *  @param {Function} onError 发生错误时的回调
		 *  @param {Boolean} ajaxOnly 可选，默认为false当为true时只使用ajax调取数据
		 *   @param {Boolean} scope 可选，设定回调函数this指向的对象
		 *   @param {Function} onAbort 可选，但取消时会调用的函数
		 */
		excute: function(onComplete, onError, ajaxOnly, scope, onAbort) {

			var params = _.clone(this.getParam() || {});

			//验证错误码
			this.pushValidates(function(data) {
				if (+data.code == 0) {
					return true;
				} else {
					return false;
				}
			});

			// @description 业务相关，获得localstorage的tag
			var tag = this.getTag();
			// @description 业务相关，从localstorage中获取上次请求的数据缓存
			var cache = this.result && this.result.get && this.result.get(tag);

			if (!cache || this.ajaxOnly || ajaxOnly) {

				this.onBeforeCompleteCallback = function(datamodel) {
					//if (this.result instanceof AbstractStore) {
					//  this.result.set(datamodel, tag);
					//}
				}
				this.execute(onComplete, onError, scope, onAbort, params)

			} else {
				if (typeof onComplete === 'function') {
					onComplete.call(scope || this, cache);
				}
			}

		},
		abort: function() {
			this.isAbort = true;
			this.ajax && this.ajax.abort && this.ajax.abort();
		}
	});

	/** ajax提交数据的格式，目前后面可能会有两种提交格式：json数据提交,form表单方式 **/
	AbstractModel.CONTENT_TYPE_JSON = 'json';
	AbstractModel.CONTENT_TYPE_FORM = 'form';
	AbstractModel.CONTENT_TYPE_JSONP = 'jsonp';

	module.exports = AbstractModel;
});
/**
 * @class storage
 * @desc 储存类
 * @date 2015/01/08
 * @author farman(yuhongfei1001@163.com)
 */
define("storage",[],function(require,exports,module){

	var Storage = Class.extend({
		init: function(key, value, lifeTime) {
			this.key = key;
			this.value = value;
			this.lifeTime = lifeTime || 0;
		},
		set: function(value) {
			//简单包装一下，方便还原的时候，类型一致，因为localstorage仅支持string类型数据.
			var data = {
				"value": value || this.value
			};
			data = JSON.stringify(data);

			window.localStorage.setItem(this.key, data);
			if (this.lifeTime > 0) {
				Storage.lifeTime[this.key] = new Date().getTime() + this.lifeTime;
			}
		},
		get: function() {
			var data = window.localStorage.getItem(this.key);
			if (!data) return null;
			data = JSON.parse(data);

			// 是否过期
			if (this.lifeTime == 0) {
				return data.value;
			} else {
				if (new Date().getTime() <= Storage.lifeTime[this.key]) {
					return data.value;
				} else {
					window.localStorage.removeItem(this.key);
					return '数据已过期'
				}
			}
		},
		//移除
		remove: function() {
			window.localStorage.removeItem(this.key);
			return true
		},
		//获取单个
		getAttr: function(key) {
			var all = this.get();
			if (all[key]) {
				return all[key];
			}
			return null;
		},
		//设置单个.
		setAttr: function(key, val) {
			var all = this.get();
			all[key] = val;
			this.set(all);
			return all;
		}
	});

	module.exports = Storage;
})
/**
 * @class events
 * @desc 事件基类, 用于事件派发.
 * @date 2015/01/09
 * @author farman(yuhongfei1001@163.com)
 */
define("events",["observer"],function(require,exports,module){

	var Observer = require("observer");
	var __slice = [].slice;

	var Events = Class.extend({
		init: function() {
			this._observers = Observer.newInstance();

			this._callbacks = {};
		},
		addObserver: function(observer) {
			this._observers.add(observer);
		},
		removeObserver: function(observer) {
			this._observers.removeAtIndex(this._observers.indexOf(observer, 0));
		},
		on: function(event, callback) {
			var name, _base, _i, _len, _ref;
			if (event.indexOf(' ') >= 0) {
				_ref = event.split(' ');
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					name = _ref[_i];
					this.on(name, callback);
				}
			} else {
				((_base = (this._callbacks != null ? this._callbacks : this._callbacks = {}))[event] != null ? _base[event] : _base[event] = []).push(callback);
			}
			return this;
		},
		off: function(event, callback) {
			var callbacks, index, name, _i, _len, _ref, _ref1;
			if (event.indexOf(' ') >= 0) {
				_ref = event.split(' ');
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					name = _ref[_i];
					this.off(name, callback);
				}
			} else if ((callbacks = (_ref1 = this._callbacks) != null ? _ref1[event] : void 0) && (index = callbacks.indexOf(callback)) >= 0) {
				callbacks.splice(index, 1);
				if (!callbacks.length) {
					delete this._callbacks[event];
				}
			}
			return this;
		},
		trigger: function() {
			var args, callback, callbacks, event, _i, _len, _ref, _ref1,  obServer;
			event = arguments[0],
			count = this._observers.count(),
			args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
			if (callbacks = (_ref = this._callbacks) != null ? _ref[event] : void 0) {
				_ref1 = callbacks.slice(0);
				for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
					callback = _ref1[_i];
					if (typeof callback === "function") {
						callback.apply(null, args);
					}
				}
			}
			if (event !== 'all') {
				this.trigger.apply(this, ['all', event].concat(__slice.call(args)));

				for(_i = 0, _len = count; _i < _len; _i++){
					obServer = this._observers.get(_i);
					obServer.trigger.apply(obServer, [event].concat(__slice.call(args)) );
				}
			}
			
			return this;
		},
		removeEvent: function(event) {
			var name, _i, _len, _ref;
			if (this._callbacks != null) {
				_ref = event.split(' ');
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					name = _ref[_i];
					delete this._callbacks[name];
				}
			}
			return this;
		}
	});
	module.exports = Events;
});
/**
 * @class observer
 * @desc 监视者基类, 用于事件派发.
 * @date 2015/01/20
 * @author farman(yuhongfei1001@163.com)
 */
define("observer",[],function(require,exports,module){

	var Observer = Class.extend({
		init: function() {
			this.observers = [];
		},
		add: function(observer){
			this.observers.push( observer );
		},
		empty: function(){
			this.observers = [];
		},
		get: function(index){
			if(index > -1 && index < this.observers.length){
				return this.observers[index];
			}
		},
		count: function(){
			return this.observers.length;
		},
		indexOf: function(observer, startIndex){
			var index = -1, 
				i = startIndex || 0;
			while(i < this.observers.length){
				if(this.observers[i] == observer){
					index = i;
				}
				i++;
			}
			return index;
		},
		removeAtIndex: function(index){
			if(index == 0){
				this.observers.shift();
			} else if( index == this.observers.length - 1){
				this.observers.pop();
			} else{
				if(this.observers.length <= 1){
					this.empty();
				}else{
					this.observers.splice(index, 1);
				}
			}
		}
	});
	module.exports = Observer;
});
/**
 * @class parser
 * @desc url解析模块类.
 * @date 2015/01/08
 * @author farman(yuhongfei1001@163.com)  
 */
define("parser",[],function(require,exports,module){

	var Parser = Class.extend({
		init: function(location, viewsRoutes, defaultView){
			this.viewsRoutes = viewsRoutes;
			this.view = defaultView || "index";
			this.decode(location.pathname);
			return this;
		},
		decode: function(url, pagetype){
			if(!url.length) return;
			var routes = this.viewsRoutes;
			var self = this;
			routes.forEach(function(item){
				if(item.match.test(url)
				){
					 self.view = item.name;
				}
			});
		},
		getViewRoutes: function(){
			return this.viewsRoutes;
		}
	})

	module.exports = Parser;
});
/**
 * @class dir
 * @desc view类.
 * @date 2015/01/16
 * @author farman(yuhongfei1001@163.com)
 */
define("dir",["events"],function(require,exports,module){
	var Events = require("events");

	var Dir = Events.extend({
		init: function(data) {
			this._super();

			this.$el = $("<a></a>");
			this.dirs = [];
			this.dirName = data.enname;
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
			titleTpl += '<span class="_list-count"><%=quality%></span><%=name%>';
			var render = _.template(titleTpl);
			var html = render(this.dirData);
			this.$el.append(html);
		},
		bindEvent: function(e){
			var self = this;
			this.$el.on("click", function(e){
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
						self.trigger("activeItem", $(this));
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
/**
 * @class sideBar
 * @desc view类.
 * @date 2015/01/16
 * @author farman(yuhongfei1001@163.com)
 */
define("sideBar",["events","dir"],function(require,exports,module){
	var Events = require("events");
	var Dir = require("dir");

	var SideBar = Events.extend({
		init: function(parent, data) {
			this._super();

			var self = this;
			this.dirs = [];
			this.active = null;
			this.parent = parent;
			this.$el = $("<div class='_list'></div>");
			this.render(data);

			this.on("OpenClass", function(){
			});

			this.on("OpenPage", function(){
			});

			this.on("activeItem", function(item){
				if(self.active){
					self.active.removeClass("active");
				} 
				self.active = item.addClass("active");
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
/**
 * @class view
 * @desc view类.
 * @date 2015/01/08
 * @author farman(yuhongfei1001@163.com)
 */
define("view",["events"],function(require,exports,module){
	var Events = require("events");

	var View = Events.extend({
		init: function() {
			this._super();

			var self = this;
			
			this.$el = $("<div class='_content'></div>");
			this.on("show", function(){
				self.$el.show();
				self.onShow();
			});
			this.on("hide", function(){
				self.hideLoading();
				self.$el.hide();
				self.onHide();
			});

			//支持自定义事件.
			if(this.events){
				for (var method in this.events) {
					var matchMethod = /(click|tap|touchstart|touchmove|touchend|touchcancel|mouseup|mousedown|mouseover|mousemove|mouseout|input|blur|focus|keydown|keyup)\s+([\s\S]+)/i;
					var macth = method.match(matchMethod);
					var callback = this[this.events[method]];
					var handler = (function() {
						return $.proxy(callback, self);
					})();
					this.$el.delegate(macth[2], macth[1], handler);
				}
			}
		},
		onShow: function(){
			console.log("show");
		},
		onHide: function(){
			console.log("hide");
		},
		showLoading: function(){
			this.$el.addClass("_content-loading");
		},
		hideLoading: function(){
			this.$el.removeClass("_content-loading");
		}
	});
	module.exports = View;
});
/**
 * @class app
 * @desc 单页app类
 * @date 2015/01/08
 * @author farman(yuhongfei1001@163.com)  
 */
define("app",["parser","events","sideBar"],function(require,exports,module){
	
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