window.dashLive = window.dashLive || (function (environment) {
  "use strict";
  var changeMap = {},
      change = function(ste,defd) {

        var ctx = ste.context,
          fn = function() {
          if (true !== changeMap[ ctx.changed ]) {
            return;
          }
          console.log('CALL LIVING', ctx.key);
          defd.notify(ste);
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
    changeMap[ state.context.changed ] = state.context.changes;
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
      changeMap[ state.context.changed ] = true;
    }
    return state;
  } ];
}(self));
