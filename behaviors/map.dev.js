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
    if(this.isnt(state.context.live, true)) {
      return state;
    }
    var maps;
    that = this;
    state.context.mapd = this.random();
    mapMap[ state.context.mapd ] = state.context.map;
    delete state.context.mapd;
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.mapd)) {
      return state;
    }
    if (this.exists(state.context.entry)) {
	    var deferred = this.deferred(),
	    	result = that.apply(mapMap[ st2.context.mapd ], [ st2.context ]),
	    	promise = state.promise;
	   	if (this.isFunction(result)) {
	   		state.promise = result;
	   		promise(function(ste2) {
	      		deferred.resolve(ste2);
	   		});
	   	} else {
	   		state.context.entry = result;
	   	}
	    console.log('map?',st2.context.mapd);
	    delete st2.context.mapd;
	    mapMap[ st2.context.mapd ].resolve(st2);
	        

      state.context.entry = that.apply(map, [state.context.entry], this );
    }
    return state;
  } ];
}(self));
