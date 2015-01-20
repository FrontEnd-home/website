/**
 * @class observer
 * @desc 监视者基类, 用于事件派发.
 * @date 2015/01/20
 * @author farman(yuhongfei1001@163.com)
 */
define(function(require, exports, module) {

	var Observer = Class.extend({
		init: function() {
			this.__observer = [];
		},
		add: function(observer){
			this.__observer.push( observer );
		},
		empty: function(){
			this.__observer = [];
		},
		get: function(index){
			if(index > -1 && index < this.__observer.length){
				return this.__observer[index];
			}
		},
		count: function(){
			return this.__observer.length;
		},
		indexOf: function(observer, startIndex){
			var index = -1, 
				i = startIndex || 0;
			while(i < this.__observer.length){
				if(this.__observer[i] == observer){
					index = i;
				}
				i++;
			}
			return index;
		},
		removeAtIndex: function(index){
			if(index == 0){
				this.__observer.shift();
			} else if( index == this.__observer.length - 1){
				this.__observer.pop();
			} else{
				if(this.__observer.length <= 1){
					this.empty();
				}else{
					var _temp = [];
					for(var i = 0; i< this.count();i++){
						if(i != index){
							_temp.push( this.__observer[i] );
						}
					}
					this.__observer = _temp;
				}
			}
		}
	});
	module.exports = Observer;
});