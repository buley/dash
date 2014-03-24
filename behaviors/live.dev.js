window.dashLive = window.dashLive || (function (environment) {
  "use strict";
  var change = function(ctx) {
        delete ctx.live;
        return function() {
          console.log('CALL LIVING',ctx);
        }
      }
  return [ function (state) {
    if(this.isnt(state.context.live, true)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred(),
        that = this,
        changes;
    state.promise = deferred.promise;
    changes = change(this.clone(state.context), deferred);
    delete state.context.living;
    if (this.isArray(state.context.changes)) {
      state.context.changes.push( changes );
    } else {
      state.context.changes = [ changes ];
    }
    setTimeout(function() {
       deferred.resolve(state);
    });
    return state;
  }, function (state) {
    if(this.isnt(state.context.live, true)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred(),
        that = this;
    promise(function(ste) {
      if (that.exists(ste.context.entry)) { 
        liveions[ ste.context.living ].push(ste.context.entry);
        ste.context.liveion = that.clone(liveions[ ste.context.living ]);
      }
      deferred.resolve(ste);
      if (that.contains(['resolve','error'], ste.type)) {
        delete liveMap[ ste.context.live ];
      }
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));
