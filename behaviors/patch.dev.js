var dashPatch = (function (environment) {
  "use strict";
  //TODO: Support array of sequential patches
  var patchMap = {}; 
  return [ function (state) {
    if(this.isEmpty(state.context.patch)) {
      return state;
    }
    var outside = this.deferred(),
	    inside = this.deferred(),
    	result,
    	promise = state.promise,
    	promises = [],
    	that = this;
    state.context.patchid = this.random();
	patchMap[ state.context.patchid ] = this.isArray(state.context.patch) ? { before: state.context.patch[0], after: state.context.patch[1] } : { before: state.context.patch, after: state.context.patch };
    state.promise = outside.promise;
    result = this.apply(patchMap[ state.context.patchid ].before, [ state ]);
    if (this.is(result.promise, state.promise)) {
    	result.promise = promise;
    	state = result;
    } else {
		result(function(ctx) {
	    	state.context.promise = promise;
    		outside.resolve(ctx);
    	}, function(ctx) {
	    	state.context.promise = promise;
	        outside.reject(ctx);
	    }, function(ctx) {
	    	state.context.promise = promise;
	        outside.notify(ctx);
	    });
	}
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.patchid)) {
      return state;
    }
    if (!patchMap[ state.context.patchid ].after) {
    	delete state.context.patchid;
    	delete patchMap[ state.context.patchid ];
    	return state;
    }
    var outside = this.deferred(),
	    inside = this.deferred(),
    	result,
    	promise = state.promise,
    	promises = [],
    	that = this;
    state.promise = inside;
    result = this.apply(patchMap[ state.context.patchid ].after, [ state ]);
    if (this.is(result.promise, state.promise)) {
    	result.promise = promise;
    	state = result;
    } else {
		state.context.promise = outside.promise;
		result(function(ctx2) {
		  delete patchMap[ ctx2.context.patchid ];
		  delete ctx2.context.patchid;
		  outside.resolve(ctx2);
		}, function(ctx2) {
	      outside.reject(ctx2);
	    }, function(ctx2) {
	      outside.notify(ctx2);
	    });
	}
    return state;
  } ];
}(self));
