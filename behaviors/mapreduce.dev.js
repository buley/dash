var dashMapReduce = (function (environment) {
  "use strict";
  var mapReduceMap = {};
  return [ function (state) {
    if(this.isEmpty(state.context.map) || this.isEmpty(state.context.reduce)) {
      return state;
    }
    state.context.mapReduceId = this.random();
    mapReduceMap[ state.context.mapReduceId ] = mapReduceMap[ state.context.mapReduceId ] || {};
    mapReduceMap[ state.context.mapReduceId ].intermediate = mapReduceMap[ state.context.mapReduceId ].intermediate || null;
    mapReduceMap[ state.context.mapReduceId ].mappers = this.isArray(state.context.map) ? state.context.map : [state.context.map];
    mapReduceMap[ state.context.mapReduceId ].reducers = this.isArray(state.context.reduce) ? state.context.reduce : [state.context.reduce];
    delete state.context.mapReduce;
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.mapReduceId)) {
      return state;
    }
    var deferred = this.deferred(),
    	result = state.context.entry,
    	promise = state.promise,
    	results = [],
    	maps = [],
    	finalized,
    	promises = [],
    	that = this;
	if (this.is(state.type, 'notify') && this.exists(state.context.entry)) {
	    this.each(mapReduceMap[ state.context.mapReduceId ].mappers, function(mapper) {
	    	result = that.apply(mapper, [ result ]);
		   	if (that.isFunction(result)) {
		   		promises.push(result);
		   	} else {
		   		maps.push(result);
		   	}
	    });
	    this.each(mapReduceMap[ state.context.mapReduceId ].reducers, function(reducer) {
	    	result = that.apply(reducer, [ mapReduceMap[ state.context.mapReduceId ].intermediate, result ]);
		   	if (that.isFunction(result)) {
		   		promises.push(result);
		   	} else {
		   		mapReduceMap[ state.context.mapReduceId ].intermediate = result;
		   	}
	    });
	    if (this.isEmpty(promises)) {
	    	state.context.mapped = maps;
	    } else {
	    	this.each(promises, function(pro) {
	    		promise(function(result) {
	    			results.push(result);
	    		});
	    		promise = pro;
	    	});
	    	state.context.promise = promise(function(ctx) {
	    		state.context = ctx;
			    delete mapReduceMap[ state.context.mapReduceId ];
				delete state.context.mapReduceId;
	    		deferred.resolve(state);
	    	});
	    }
	} else if ( this.is(state.type, 'resolve')) {
		state.context.reduced = mapReduceMap[ state.context.mapReduceId ].intermediate;
	}
    if ( state.context.mapReduceId ) {
        delete state.context.mapReduceId;
    }
    return state;
  } ];
}(self));
