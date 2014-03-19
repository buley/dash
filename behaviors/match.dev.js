window.dashMatch = window.dashMatch || (function (environment) {
  "use strict";
  return [ null, function (state) {
    if(this.isEmpty(state.context.match)) {
      return state;
    }
    deferred = this.deferred();
    promise(function(context) {
      setTimeout( function() {
        state.context = contex;
        state.promise = promise;
        deferred.resolve(state.context);
      }, 3000 );
    });
    state.promise = deferred.promise;
    return state;
  };
}(self));
