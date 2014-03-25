window.dashBehavior = window.dashBehavior || (function (environment) {
  "use strict";
  var behaviorMap = {}; 
  return [ function (state) {
    if(this.isEmpty(state.context.behavior)) {
      return state;
    }
    state.context.behaviord = this.random();
    behaviorMap[ state.context.behaviord ] = this.isArray(state.context.behavior) ? state.context.behavior : [state.context.behavior];
    delete state.context.behavior;
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.behaviord)) {
      return state;
    }
    if (this.exists(state.context.entry)) {
	    var deferred = this.deferred(),
	    	result,
	    	promise = state.promise,
	    	results = [],
	    	promises = [],
	    	that = this;
	    this.each(behaviorMap[ state.context.behaviord ], function(fn) {
	    	result = that.apply(fn, [ state.context ]);
		   	if (that.isFunction(result)) {
		   		promises.push(result);
		   	} else {
		   		results.push(result);
		   	}
	    });
	    if (this.isEmpty(promises)) {
	    	state.context.entry = this.is(results.length, 1) ? results[0] : results;
	    } else {
	    	this.each(promises, function(pro) {
	    		promise = pro(function(result) {
	    			results.push(results);
	    		});
	    	});
	    	state.context.promise = promise(function(ctx) {
	    		ctx.behaviorid = that.is(results.length, 1) ? results[0] : results;
	    		deferred.resolve(ctx);
	    	})
	    }
	    delete behaviorMap[ state.context.behaviord ];
	    delete state.context.behaviord;
    }
    return state;
  } ];
}(self));
