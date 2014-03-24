window.dashLive = window.dashLive || (function (environment) {
  "use strict";
  var changeMap = {},
      change = function(ste, defd) {
        console.log('yeah?',ste.on_success);
        var ctx = ste.context,
          fn = function(st2) {
            if (!changeMap[ ctx.changed ]) {
              return;
            }
            changeMap[ ctx.changed ].resolve(ste);
            changeMap[ ctx.changed ].notify(ste);
          };
        fn.ready = false;
        return fn;
      }
  return [ function (state) {
    if(this.isnt(state.context.live, true)) {
      return state;
    }
    var changes;
    state.context.changed = that.random();
    changes = change(this.clone(state), deferred);
    if (this.isArray(state.context.changes)) {
      state.context.changes.push(changes);
    } else {
      state.context.changes = [changes];
    }
    changeMap[ state.context.changed ] = false;
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.changed)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred();
    state.promise = deferred.promise;
    state.context.changed = that.random();
    if (this.contains(['resolve', 'error'], state.type)) {
      changeMap[ state.context.changed ] = deferred;
    }
    promise(function() {
      console.log('ya');
      deferred.resolve(state);
    }, function() {
      deferred.error(state);
    }, function() {
      deferred.notify(state);
    });
    return state;
  } ];
}(self));
