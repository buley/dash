self.dashShorthand = self.dashShorthand || (function (environment) {
  "use strict";
  var that,
  	 reduce = function(map, expr, context, reverse) {
		if (that.isFunction(expr)) {
			expr = that.apply(expr, [context], that);
		}
		if (that.isObject(expr)) {
			that.iterate(expr, function(key, value) {
				if (!that.isEmpty(map[key])) {
					delete expr[key];
					key = map[key];
				}
				expr[key] = reduce(map, value, context, reverse);
			});
		}
		return expr;
	}, reverse = function(expr) {
		if (that.isObject(expr)) {
			that.iterate(expr, function(key, value) {
				if (that.isObject(value)) {
					expr[key] = reverse(value);
				} else {
					expr[value] = key;
				}
			});
		}
		return expr;
	};
  return [ function (state) {
  	that = this;
    if(this.isEmpty(state.context.shorthand)) {
      return state;
    }
    var data = state.context.data,
    	shorthand = state.context.shorthand;
    if (!this.isEmpty(data)) {
    	if (!!shorthand.after || !!shorthand.before) {
    		shorthand = shorthand.before;
    	}
    	state.context.data = reduce(reverse(shorthand), data, state.context, false);
    }
    return state;
  }, function (state) {
    that = this;
    if(this.isEmpty(state.context.shorthand)) {
      return state;
    }
    var data = state.context.entry,
    	shorthand = state.context.shorthand;
    if (!this.isEmpty(data)) {
    	if (!!shorthand.after || !!shorthand.before) {
    		shorthand = shorthand.after;
    	}
    	state.context.entry = reduce(shorthand, data, state.context);
    }
    return state;
  } ];
}(self));
