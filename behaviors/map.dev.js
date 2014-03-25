window.dashMap = window.dashMap || (function (environment) {
  "use strict";
  var that,
      mapMap = {}, //heh
      map = function(ste) {
      	var ctx = ste.context;
return fn;
      };
  return [ function (state) {
  	that = this;
    if(this.isnt(state.context.map, true)) {
      return state;
    }
    var maps;
    that = this;
    state.context.mapd = this.random();
    mapMap[ state.context.mapd ] = this.isArray(state.context.map) ? state.context.map : [state.context.map];
    delete state.context.mapd;
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.mapd)) {
      return state;
    }
    if (this.exists(state.context.entry)) {
	    var deferred = this.deferred(),
	    	result,
	    	promise = state.promise,
	    	results = [],
	    	promises = [];
	    this.each(mapMap[ state.context.mapd ], function(fn) {
	    	result = that.apply(fn, [ state.context ]);
		   	if (this.isFunction(result)) {
		   		promises.push(result);
		   	} else {
		   		results.push(result);
		   	}
	    });
	    if (that.is(promises.length, 0)) {
	    	state.context.entry = is(results.length, 1) ? results[0] : results;
	    } else {
	    	that.each(promises, function(pro) {
	    		promise = promise(pro);
	    	});
	    	state.context.promise = promise;
	    }
	    console.log('map?',state.context.mapd);
	    delete mapMap[ state.context.mapd ];
	    delete state.context.mapd;
	    mapMap[ state.context.mapd ].resolve(state);
    }
    return state;
  } ];
}(self));
