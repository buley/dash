window.dashLive = window.dashLive || (function (environment) {
  "use strict";
  var that,
      liveMap = {},
      live = function(ste) {
        var ctx = ste.context,
          fn = function(st2) {
            if (!liveMap[ st2.liveid ] ||( !!st2.context && !!st2.context.relived)) {
              delete st2.context.relived;
              return st2;
            }
            st2.type = 'notify';
            st2.context.relived = true;
            liveMap[ ctx.liveid ].resolve(st2);
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
      if(this.isArray(ctx.context.changes)) {
        this.each(ctx.context.changes, function(el, i) {
          if (that.is(el, liveMap[ ctx.context.liveid ])) {
            delete ctx.context.changes[ i ];
          }
        });
      }
      deferred.resolve(ctx);
    }, function(ctx) {
      if(this.isArray(ctx.context.changes)) {
        this.each(ctx.context.changes, function(el, i) {
          if (that.is(el, liveMap[ ctx.context.liveid ])) {
            delete ctx.context.changes[ i ];
          }
        });
      }
      deferred.error(ctx);
    }, function(ctx) {
      if(this.isArray(ctx.context.changes)) {
        this.each(ctx.context.changes, function(el, i) {
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
