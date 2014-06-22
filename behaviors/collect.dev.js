dashCollect = dashCollect || (function (environment) {
  "use strict";
  var collections = {};
  return [ function (state) {
    if(this.isnt(state.context.collect, true)) {
      return state;
    }
    state.context.collector = this.random();
    collections[ state.context.collector ] = [];
    state.context.collection = collections[ state.context.collector ];
    return state;
  }, function (state) {
    if(this.isnt(state.context.collect, true)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred(),
        that = this;
    promise(function(ste) {
      if (that.exists(ste.context.entry)) { 
        collections[ ste.context.collector ].push(ste.context.entry);
        ste.context.collection = that.clone(collections[ ste.context.collector ]);
      }
      deferred.resolve(ste);
      if (that.contains(['resolve','error'], ste.type)) {
        delete collections[ ste.context.collector ];
      }
    }, function(ctx) {
        deferred.reject(ctx);
    }, function(ctx) {
        deferred.notify(ctx);
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));
