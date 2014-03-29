window.dashShorthand = window.dashShorthand || (function (environment) {
  "use strict";
  var that,
  	 reduce = function(xmap, expression, xcontext, xreverse) {
		var maybeReduce = function(map, expr, context, reverse) {
			if (that.isFunction(expr)) {
				expr = that.apply(expr, [context], that);
			}
			if (that.isObject(expr)) {
				that.iterate(expr, function(key, value) {
					if (!that.isEmpty(map[key])) {
						map[key] = value;
					}
					expr[key] = maybeReduce(map, value, context, reverse);
				});
			}
			return expr;
		}
		return maybeReduce(xmap, expression, xcontext, xreverse);	
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
