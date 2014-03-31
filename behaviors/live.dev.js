window.dashLive = window.dashLive || (function (environment) {
  "use strict";
  var that,
      liveMap = {},
      live = function(ste) {
        var ctx = ste.context,
          fn = function(live_ctx) {
            if (!liveMap[ ste.context.liveid ] ||( !!live_ctx.context && !!live_ctx.context.relived)) {
              delete live_ctx.context.relived;
              return live_ctx;
            }
            st2.type = 'notify';
            st2.context.relived = true;
            liveMap[ ste.context.liveid ].resolve(live_ctx);
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
        deferred = this.deferred();
    state.promise = deferred.promise;
    if(this.isArray(state.context.changes)) {
      this.each(state.context.changes, function(el, i) {
        if (that.is(el, liveMap[ state.context.liveid ])) {
          delete state.context.changes[ i ];
        }
      });
    }
    if (this.contains(['resolve', 'error'], state.type)) {
      liveMap[ state.context.liveid ] = deferred;
    }
    delete state.context.liveid;
    promise(function(ctx) {
      if(that.isArray(ctx.context.changes)) {
        that.each(ctx.context.changes, function(el, i) {
          if (that.is(el, liveMap[ ctx.context.liveid ])) {
            delete ctx.context.changes[ i ];
          }
        });
      }
      deferred.resolve(ctx);
    }, function(ctx) {
      if(that.isArray(ctx.context.changes)) {
        that.each(ctx.context.changes, function(el, i) {
          if (that.is(el, liveMap[ ctx.context.liveid ])) {
            delete ctx.context.changes[ i ];
          }
        });
      }
      deferred.error(ctx);
    }, function(ctx) {
      if(that.isArray(ctx.context.changes)) {
        that.each(ctx.context.changes, function(el, i) {
          if (that.is(el, liveMap[ ctx.context.liveid ])) {
            delete ctx.context.changes[ i ];
          }
        });
      }
      deferred.notify(ctx);
    });
    return state;
  } ];
}(self));
