window.dashMapReduce = window.dashMapReduce || (function (environment) {
  "use strict";
  var mapReduceMap = {};
  return [ function (state) {
    if(this.isEmpty(state.context.mapReduce)) {
      return state;
    }
    state.context.mapReducer = this.random();
    mapReduceMap[ state.context.mapReducer ] = this.isArray(state.context.mapReduce) ? state.context.mapReduce : [state.context.mapReduce];
    delete state.context.mapReduce;
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.mapReducer)) {
      return state;
    }
    if (this.exists(state.context.entry)) {
	    var deferred = this.deferred(),
	    	result = state.context.entry,
	    	promise = state.promise,
	    	results = [],
	    	promises = [],
	    	that = this;
	    this.each(mapReduceMap[ state.context.mapReducer ], function(fn) {
	    	result = that.apply(fn, [ result ]);
		   	if (that.isFunction(result)) {
		   		promises.push(result);
		   	} else {
		   		results.push(result);
		   	}
	    });
	    if (this.isEmpty(promises)) {
	    	state.context.mapReduceped = this.is(results.length, 1) ? results[0] : results;
	    } else {
	    	this.each(promises, function(pro) {
	    		promise(function(result) {
	    			results.push(results);
	    		});
	    		promise = pro;
	    	});
	    	state.context.promise = promise(function(ctx) {
	    		ctx.mapReduceped = that.is(results.length, 1) ? results[0] : results;
	    		deferred.resolve(ctx);
	    	});
	    }
	    delete mapReduceMap[ state.context.mapReducer ];
	    delete state.context.mapReducer;
   }
    return state;
  } ];
}(self));