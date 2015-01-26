/**
 * @class observer
 * @desc 监视者基类, 用于事件派发.
 * @date 2015/01/20
 * @author farman(yuhongfei1001@163.com)
 */
define(function(require, exports, module) {

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