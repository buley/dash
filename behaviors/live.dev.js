window.dashLive = window.dashLive || (function (environment) {
  "use strict";
  var change = function(ctx) {
        return function() {
          //console.log('CALL LIVING', ctx.key);
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
    console.log("SHOULD BE ONCE");
    state.promise = deferred.promise;
    changes = change(this.clone(state.context), deferred);
    if (this.isArray(state.context.changes)) {
      state.context.changes = [ changes ];
    } else {
      state.context.changes = [ changes ];
    }
    promise(function() {
      deferred.resolve(state);
    }, function() {
      deferred.error(state);
    }, function() {
      deferred.notify(state);
    });
    return state;
  }, null ];
}(self));
