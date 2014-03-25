window.dashLive = window.dashLive || (function (environment) {
  "use strict";
  var that,
      changeMap = {},
      change = function(ste) {
        var ctx = ste.context,
          fn = function(st2) {
            if (!changeMap[ ctx.changed ]) {
              return;
            }
            changeMap[ ctx.changed ].resolve(st2);
          };
        fn.ready = false;
        return fn;
      }
  return [ function (state) {
    if(this.isnt(state.context.live, true)) {
      return state;
    }
    var changes;
    that = this;
    state.context.changed = this.random();
    changes = change(this.clone(state));
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
    if (this.contains(['resolve', 'error'], state.type)) {
      changeMap[ state.context.changed ] = deferred;
    }
    promise(function(ste) {
      deferred.resolve(ste);
    }, function(ste) {
      deferred.error(ste);
    }, function(ste) {
      deferred.notify(ste);
    });
    return state;
  } ];
}(self));
