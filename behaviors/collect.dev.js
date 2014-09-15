self.dashCollect = self.dashCollect || (function(environment) {
  "use strict";
  var collections = {};
  return [function(state) {
    if (this.isnt(state.context.collect, true)) {
      return state;
    }
    state.context.collector = this.random();
    collections[state.context.collector] = [];
    state.context.collection = collections[state.context.collector];
    return state;
  }, function(state) {
    if (this.isnt(state.context.collect, true)) {
      return state;
    }
    var promise = state.promise,
      deferred = this.deferred(),
      that = this;
    promise(function(ste) {
      if (that.contains(['notify', 'error'], ste.type)) {
        if (that.exists(ste.context.entry)) {
          collections[ste.context.collector].push(ctx.context.entry);
          deferred.notify(ste);
        } else if (that.exists(ste.context.error)) {
          collections[ste.context.collector].push(ctx.context.error);
          deferred.reject(ctx);
        }
      } else if ("resolve" === ste.type){
        if (that.exists(ste.context.collector)) {
          ste.context.collection = that.clone(collections[ste.context.collector]);
        }
        delete ste.context.collector;
        deferred.resolve(ste);
        delete collections[ste.context.collector];
      });
    state.promise = deferred.promise;
    return state;
  }];
}(self));
