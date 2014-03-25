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
	    	console.log('esult',result);
		   	if (that.isFunction(result)) {
		   		promises.push(result);
		   	} else {
		   		results.push(result);
		   	}
	    });

    }
    return state;
  } ];
}(self));
