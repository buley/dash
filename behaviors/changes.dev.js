window.dashChanges = window.dashChanges || (function (environment) {
  "use strict";
  var changeMap = {},
    randomId = function() {
      var random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        count = 16,
        x = 0,
        xlength = 0,
        strlen = random.length,
        str = [];
      for (x = 0; x < count; x += 1) {
        str.push(random[Math.floor(Math.random() * 100) % strlen]);
      }
      return str.join('');
    };
  return [ function(state) {
    if(!this.isFunction(state.context.changes)) {
      return state;
    }    
    var id = randomId();
    changeMap[ id ] = state.context.changes;
    state.context.changes = id;
    return state;
  }, function (state) {
    if(!this.exists(state.context.changes)) {
      return state;
    }
    var promise = state.promise,
        deferred = this.deferred();
    console.log('change request', state.context.changes);
    promise(function(ste) {
      setTimeout( function() {
	      console.log('state',ste);
        deferred.resolve(ste);
      }, 3000 );
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));
