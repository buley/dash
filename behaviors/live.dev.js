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
    promise(function() {
      deferred.resolve(state);
    }, function() {
      deferred.error(state);
    }, function() {
      deferred.notify(state);
    });
    return state;
  } ];
}(self));
