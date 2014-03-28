window.dashMapReduce = window.dashMapReduce || (function (environment) {
  "use strict";
  var mapReduceMap = {};
  return [ function (state) {
    if(this.isEmpty(state.context.map) || this.isEmpty(state.context.reduce)) {
      return state;
    }
    state.context.mapReducer = state.context.mapReducer || {};
    state.context.mapReduceId = this.random();
    state.context.mapReducer.intermediate = state.context.mapReducer.intermediate || {};
    mapReduceMap[ state.context.mapReduceId ].mappers = this.isArray(state.context.mapReduce.map) ? state.context.mapReduce.map : [state.context.mapReduce.map];
    mapReduceMap[ state.context.mapReduceId ].reducers = this.isArray(state.context.mapReduce.reduce) ? state.context.mapReduce.reduce : [state.context.mapReduce.reduce];
    delete state.context.mapReduce;
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.map) || this.isEmpty(state.context.reduce)) {
      return state;
    }
    if (this.exists(state.context.entry)) {
	    var deferred = this.deferred(),
	    	result = state.context.entry,
	    	promise = state.promise,
	    	results = [],
	    	finalized,
	    	promises = [],
	    	that = this;
	    console.log('mapreduce',state);
    	if (this.is(state.type, 'notify') && this.exists(state.context.entry)) {
		    this.each(mapReduceMap[ state.context.mapReduceId ].mappers, function(mapper) {
		    	result = that.apply(mapper, [ result ]);
			   	if (that.isFunction(result)) {
			   		promises.push(result);
			   	} else {
			   		results.push(result);
			   	}
		    });
		    if (this.isEmpty(promises)) {
		    	state.context.reduced = this.is(results.length, 1) ? results[0] : results;
		    } else {
		    	this.each(promises, function(pro) {
		    		promise(function(result) {
		    			results.push(result);it
		    		});
		    		promise = pro;
		    	});
		    	state.context.promise = promise(function(ctx) {
				    this.each(mapReduceMap[ state.context.mapReduceId ].reducers, function(reducer) {
				    	result = that.apply(reducer, [ state.context.mapReducer.intermediate || null, result ]);
					   	if (that.isFunction(result)) {
					   		promises.push(result);
					   	} else {
						   	state.context.mapReducer.intermediate = result;
					   		finalized = result;
					   	}
				    });
		    		ctx.reduced = finalized;
		    		state.context = ctx;
		    		delete state.context.mapReducer;
		    		deferred.resolve(ctx);
		    	});
		    }
		} else if ( this.is(state.type, 'resolve')) {
			console.log("RESOLVED");
		}
	    delete mapReduceMap[ state.context.mapReducer ];
	    delete state.context.mapReducer;
   }
    return state;
  } ];
}(self));