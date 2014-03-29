window.dashShorthand = window.dashShorthand || (function (environment) {
  "use strict";
  var that,
  	 reduce = function(map, expression, context, reverse) {
		var maybeReduce = function(expr) {
			if (that.isFunction(expr)) {
				expr = that.apply(expr, [context], that);
			}
			if (that.isObject(expr)) {
				that.iterate(expr, function(key, value) {
					if (that.contains(key)) {
						expr[value] = maybeReduce(map, value, context, reverse);
						console.log("REMAP",key, value);
					} else {
						expr[key] = maybeReduce(map, value, context, reverse);
					}
				});
			}
			return expr;
		}
		return maybeReduce(map, expression, context, reverse);	
	};
  return [ function (state) {
  	that = this;
    if(this.isEmpty(state.context.shorthand)) {
      return state;
    }
    var data = state.context.data;
    if (!this.isEmpty(data)) {
    	state.context.data = reduce(state.context.shorthand, data, state.context, false);
    }
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.shorthand)) {
      return state;
    }
    var data = state.context.entry;
    if (!this.isEmpty(data)) {
    	state.context.entry = reduce(state.context.shorthand, data, state.context, true);
    }
    return state;
  } ];
}(self));
