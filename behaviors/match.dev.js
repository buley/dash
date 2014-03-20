window.dashMatch = window.dashMatch || (function (environment) {
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
					expr[key] = maybeReduce(value);
				});
			}
			return expr;
		}
		return maybeReduce(expression);	
	},
	match = function(expr, data) {
		var matches = true;
		console.log('match?', data, expr);
		that.iterate(expr, function(key, val) { 
			var ok = true;
			if ( !that.exists(data[key]) ) {
				return false;
			}
			console.log('normal',data[key], val);
			if ( that.isObject(val) ) {
				ok = match(val, data[key]);
				if ( !ok ) {
					return false;
				}
			} else if ( that.isRegEx(val) ) {
				if ( that.isnt(data[key], val) && null === data[ key ].match(val) ) {
					return false;
				}
			} else if ( data[key] !== val) {
				return false;
			}
		} );
		return true;
	},
	reduced;
    promise(function(context) {
      //context.type = null;
	reduced = reduce(state.context.match, context);
	console.log('reduced', match(reduced, state.context.entry) );
      deferred.resolve(context);
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));
