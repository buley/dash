window.dashLive = window.dashLive || (function (environment) {
  "use strict";
  var that,
      liveMap = {},
      live = function(ste) {
        var ctx = ste.context,
          fn = function(st2) {
            if (!liveMap[ ctx.liveid ]) {
              return;
            }
            st2.type = 'notify';
            liveMap[ ctx.liveid ].resolve(st2);
          };
        fn.ready = false;
        return fn;
      };
  return [ function (state) {
    if(this.isnt(state.context.live, true)) {
      return state;
    }
    var lives;
    that = this;
    state.context.liveid = this.random();
    lives = live(this.clone(state));
    if (this.isArray(state.context.lives)) {
      state.context.lives.push(lives);
    } else {
      state.context.lives = [lives];
    }
    liveMap[ state.context.liveid ] = false;
    return state;
  }, function (state) {
    if(this.isEmpty(state.context.liveid)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred();
    state.promise = deferred.promise;
    if (this.contains(['resolve', 'error'], state.type)) {
      liveMap[ state.context.liveid ] = deferred;
    }
    delete state.context.liveid;
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
