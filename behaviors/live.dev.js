window.dashLive = window.dashLive || (function (environment) {
  "use strict";
  var changeMap = {},
      change = function(ste, defd) {
        var ctx = ste.context,
          fn = function(st2) {
            if (!changeMap[ ctx.changed ]) {
              return;
            }
            ste.context = changeMap[ ctx.changed ];
            console.log('CALL LIVING', changeMap[ ctx.changed ], ctx.key);
            defd.resolve(changeMap[ ctx.changed ]);
          };
        fn.ready = false;
        return fn;
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
    state.context.changed = that.random();
    changes = change(this.clone(state), deferred);
    if (this.isArray(state.context.changes)) {
      state.context.changes.push(changes);
    } else {
      state.context.changes = [changes];
    }
    changeMap[ state.context.changed ] = false;
    promise(function() {
      changes.ready = true;
      deferred.resolve(state);
    }, function() {
      deferred.error(state);
    }, function() {
      deferred.notify(state);
    });
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.changed)) {
      return state;
    }
    if (this.contains(['resolve', 'error'], state.type)) {
      changeMap[ state.context.changed ] = state;
    }
    return state;
  } ];
}(self));
