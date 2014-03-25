window.dashMap = window.dashMap || (function (environment) {
  "use strict";
  var mapMap = {}; //heh
  return [ function (state) {
    if(this.isEmpty(state.context.map)) {
      return state;
    }
    state.context.mapd = this.random();
    mapMap[ state.context.mapd ] = this.isArray(state.context.map) ? state.context.map : [state.context.map];
    delete state.context.map;
    return state;
  }, function (state) {
  	console.log("STATE",state.context.mapd);
    if(this.isEmpty(state.context.mapd)) {
      return state;
    }
    if (this.exists(state.context.entry)) {
	    var deferred = this.deferred(),
	    	result,
	    	promise = state.promise,
	    	results = [],
	    	promises = [],
	    	that = this;
	    this.each(mapMap[ state.context.mapd ], function(fn) {
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
	    		promise = pro(function() {
	    			deferred.resolve(ctx);
	    		});
	    	});
	    	state.context.promise = promise;
	    }
	    delete mapMap[ state.context.mapd ];
	    delete state.context.mapd;
    }
    return state;
  } ];
}(self));
