/**
 * @class events
 * @desc 事件基类, 用于事件派发.
 * @date 2015/01/09
 * @author farman(yuhongfei1001@163.com)
 */
define(function(require, exports, module) {

	var Observer = require("observer");

	var Events = Class.extend({
		init: function() {
			this.__observers = Observer.newInstance();

			this.__listeners = {};
		},
		addObserver: function( observer ){
			this.__observers.push( observer );
		},
		removeObserver: function( observer ){
			this.__observers.removeAtIndex( this.__observers.indexOf(observer, 0) );
		},
		on: function(name, handler) {
			if (this.__listeners[name] && this.__listeners[name].length) {
				this.__listeners.push(handler);
			} else {
				this.__listeners[name] = [handler];
			}
		},
		off: function(name) {
			if (this.__listeners[name] && this.__listeners[name].length) {
				this.__listeners[name] = [];
			}
		},
		fire: function(name, data) {
			if (this.__listeners[name] && this.__listeners[name].length) {
				var handlers = this.__listeners[name];
				handlers.forEach(function(handler) {
					handler.call(null, data);
				});
			}
			//底层事件自动冒泡到监视者.
			var count = this.__observers.count();
			for(var i = 0;i < count; i ++){
				var observer = this.__observers.get(i);
				if(observer && observer.fire){ 
					observer.fire(name, data);
				}
			}
		}
	});
	module.exports = Events;
});