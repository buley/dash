self.dashMap = self.dashMap || (function (environment) {
  "use strict";
  var mapMap = {}; //heh
  return [ function (state) {
    if(this.isEmpty(state.context.map) || !this.isEmpty(state.context.reduce)) {
      return state;
    }
    state.context.mapid = this.random();
    mapMap[ state.context.mapid ] = this.isArray(state.context.map) ? state.context.map : [state.context.map];
    delete state.context.map;
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.mapid) || !this.isEmpty(state.context.reduce)) {
      return state;
    }
    if (this.exists(state.context.entry)) {
	    var deferred = this.deferred(),
	    	result = state.context.entry,
	    	promise = state.promise,
	    	results = [],
	    	promises = [],
	    	that = this;
	    this.each(mapMap[ state.context.mapid ], function(fn) {
	    	result = that.apply(fn, [ result ]);
		   	if (that.isFunction(result)) {
		   		promises.push(result);
		   	} else {
		   		results.push(result);
		   	}
	    });
	    if (this.isEmpty(promises)) {
	    	state.context.mapped = this.is(results.length, 1) ? results[0] : results;
	    } else {
	    	this.each(promises, function(pro) {
	    		promise(function(result) {
	    			results.push(result);
	    		});
	    		promise = pro;
	    	});
	    	state.context.promise = promise(function(ctx) {
	    		ctx.mapped = that.is(results.length, 1) ? results[0] : results;
	    		deferred.resolve(ctx);
	    	}, function(ctx) {
		        deferred.reject(ctx);
		    }, function(ctx) {
		        deferred.notify(ctx);
		    });
	    }
	    delete mapMap[ state.context.mapid ];
	    delete state.context.mapid;
    }
    return state;
  } ];
}(self));
