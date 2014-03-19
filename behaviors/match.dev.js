window.dashMatch = window.dashMatch || (function (environment) {
  "use strict";
  return [ null, function (state) {
    if(this.isEmpty(state.context.match)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred();
    promise(function(context) {
      console.log('killed',context.type, state.context.match);
      context.type
      deferred.resolve(context);
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));
