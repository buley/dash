window.dashPatch = window.dashPatch || (function (environment) {
  "use strict";
  var patchMap = {}; 
  return [ function (state) {
    if(this.isEmpty(state.context.patch)) {
      return state;
    }
    var deferred = this.deferred(),
    	result,
    	promise = state.promise,
    	promises = [],
    	that = this;
    state.context.patchid = this.random();
	patchMap[ state.context.patchid ] = this.isArray(state.context.patch) ? state.context.patch : [state.context.patch, state.context.patch];
    state.promise = deferred.promise;
    result = this.apply(patchMap[ state.context.patchid ][0], [ state ]);
    if (this.is(result.promise, state.promise)) {
    	result.promise = promise;
    	state = result;
    } else {
    	state.context.promise = deferred.promise;
		result(function(ctx) {
    		deferred.resolve(ctx);
    	}, function(ctx) {
	        deferred.reject(ctx);
	    }, function(ctx) {
	        deferred.notify(ctx);
	    });
	}
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.patchid)) {
      return state;
    }
    var deferred = this.deferred(),
    	result,
    	promise = state.promise,
    	promises = [],
    	that = this;
    state.promise = deferred.promise;
    result = this.apply(patchMap[ state.context.patchid ][1], [ state ]);
    if (this.is(result.promise, state.promise)) {
    	result.promise = promise;
    	state = result;
    } else {
		state.context.promise = deferred.promise;
		result(function(ctx) {
		  deferred.resolve(ctx);
		}, function(ctx) {
	      deferred.reject(ctx);
	    }, function(ctx) {
	      deferred.notify(ctx);
	    });
	}
    return state;
  } ];
}(self));
