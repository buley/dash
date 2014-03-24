window.dashCollect = window.dashCollect || (function (environment) {
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
      setTimeout( function() {
        if (that.exists(ste.context.entry)) { 
          collections[ ste.context.collector ].push(ste.context.entry);
          ste.context.collection = collections[ ste.context.collector ];
          console.log('collect state',ste.context.collection.length);
        }
        deferred.resolve(ste);
      }, 3000 );
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));
