self.dashMatch = self.dashMatch || (function (environment) {
  "use strict";
  return [ null, function (state) {
    if(this.isEmpty(state.context.match)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred(),
	that = this,
	reduce = function(expression, context) {
		var maybeReduce = function(expr) {
			if (that.isFunction(expr)) {
				expr = that.apply(expr, [context], that);
			}
			if (that.isObject(expr)) {
				that.iterate(expr, function(key, value) {
					expr[key] = maybeReduce(value, context);
				});
			}
			return expr;
		}
		return maybeReduce(expression, context);	
	},
	match = function(expr, data) {
		var matches = true;
		if (that.isEmpty(data)) {
			return false;
		}
		var ok = true, any = false;
		that.iterate(expr, function(key, val) { 
			if ( !that.exists(data[key]) ) {
				ok = false;
			}
			if ( that.isObject(val) ) {
				ok = match(val, data[key]);
				if ( ok ) {
					any = true;
				}
			} else if ( that.isRegEx(val) ) {
				if ( that.isnt(data[key], val) && !that.exists(data[key]) || null === data[ key ].match(val) ) {
					ok = false;
				} else {
					any = true;
				}
			} else if ( data[key] !== val) {
				ok = false;
			} else {
				any = true;
			}
		} );
		return that.is(state.context.any, true) ? any : ok;
	},
	reduced;
    promise(function(st) {
	reduced = reduce(st.context.match, st.context);
	if ( 'notify' === st.type && !match(reduced, st.context.entry) ) {
		st.type = null;
        deferred.reject(st);
	} else {
        deferred.resolve(st);
	}
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));
