window.dashPatch = window.dashPatch || (function (environment) {
  "use strict";
  var patchMap = {}; 
  return [ function (state) {
    if(this.isEmpty(state.context.patch)) {
      return state;
    }
    state.context.patchid = this.random();
    patchMap[ state.context.patchid ] = this.isArray(state.context.patch) ? state.context.patch : [state.context.patch];
    delete state.context.patch;
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.patchid)) {
      return state;
    }
    if (this.exists(state.context.entry)) {
	    var deferred = this.deferred(),
	    	result = state.context,
	    	promise = state.promise,
	    	results = [],
	    	promises = [],
	    	that = this;
	    this.each(patchMap[ state.context.patchid ], function(fn) {
	    	result = that.apply(fn, [ result ]);
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
	    		state.context = that.is(results.length, 1) ? results[0] : results;
	    		deferred.resolve(state);
	    	}, function(ctx) {
		        deferred.reject(ctx);
		    }, function(ctx) {
		        deferred.notify(ctx);
		    })
	    }
	    delete patchMap[ state.context.patchid ];
	    delete state.context.patchid;
    }
    return state;
  } ];
}(self));
