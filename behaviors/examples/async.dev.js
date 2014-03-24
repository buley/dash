window.dashAsync = window.dashAsync || (function (environment) {
  "use strict";
  return [ null, function (state) {
    if(this.isnt(state.context.async, true)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred();
    promise(function(ste) {
      setTimeout( function() {
        deferred.resolve(ste);
      }, 3000 );
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));
