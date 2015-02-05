/**
 * @class events
 * @desc 事件基类, 用于事件派发.
 * @date 2015/01/09
 * @author farman(yuhongfei1001@163.com)
 */
define(function(require, exports, module) {

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
			var args, callback, callbacks, event, _i, _len, _ref, _ref1, obServer;
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

			//如果存在observer. 开始查找...
			if(count > 0){
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