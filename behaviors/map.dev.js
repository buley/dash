window.dashMap = window.dashMap || (function (environment) {
  "use strict";
  var that,
      mapMap = {}, //heh
      map = function(ste) {
      	var ctx = ste.context;
            if (that.isEmpty(st2.context.mapd)) {
              return;
            }
            console.log('map?',st2.context.mapd);
            that.apply(mapMap[ st2.context.mapd ], [ st2.context ]);
            delete st2.context.mapd;
            mapMap[ st2.context.mapd ].resolve(st2);
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
      state.context.entry = that.apply(map, [state.context.entry], this );
    }
    return state;
  } ];
}(self));
