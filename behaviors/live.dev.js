window.dashLive = window.dashLive || (function (environment) {
  "use strict";
  var that,
      liveMap = {},
      live = function(ste) {
        var ctx = ste.context,
          fn = function(live_ctx) {
            if (!liveMap[ ste.context.liveid ] ||( !!live_ctx.context && !!live_ctx.context.zombie)) {
              return live_ctx;
            }
            ste.type = 'notify';
            ste.method = live_ctx.method;
            live_ctx.context.liveid = ste.context.liveid;
            ste.context = live_ctx.context;
            ste.context.zombie = 'braaains';
            liveMap[ ste.context.liveid ].resolve(that.clone(ste));
          };
        fn.ready = false;
        return fn;
      };
  return [ function (state) {
    that = this;
    if(this.isnt(state.context.live, true)) {
      return state;
    }
    var lives;
    state.context.liveid = this.random();
    lives = live(this.clone(state));
    liveMap[ state.context.liveid ] = lives;
    if (this.isArray(state.context.changes)) {
      state.context.changes.push(lives);
    } else {
      state.context.changes = [lives];
    }
    return state;
  }, function (state) {
    that = this;
    if(this.isEmpty(state.context.liveid)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred(),
        removeChanges = function(ste) {
          if(that.isArray(ste.context.changes)) {
            that.each(ste.context.changes, function(el, i) {
              if (that.is(ste, liveMap[ ste.context.liveid ])) {
                delete ste.context.changes[ i ];
              }
            });
          }
          delete ste.context.liveid;
          return ste;
        };
    state.promise = deferred.promise;
    if (this.contains(['resolve', 'error'], state.type)) {
      liveMap[ state.context.liveid ] = deferred;
    }
    promise(function(ctx) {
      deferred.resolve(removeChanges(ctx));
    }, function(ctx) {
      deferred.error(removeChanges(ctx));
    }, function(ctx) {
      deferred.notify(removeChanges(ctx));
    });
    return removeChanges(state);
  } ];
}(self));
