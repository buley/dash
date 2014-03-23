window.dashChanges = window.dashChanges || (function (environment) {
  "use strict";
  var changeMap = {},
    that,
    register = function(type, ctx) {
      changeMap[ctx.database] = changeMap[ctx.database] || {
        stores: {},
        callbacks: []
      };
      if (that.is(type, 'database')) {
        changeMap[ctx.database].callbacks.push(obj);
      }
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store] = changeMap[ctx.database].stores[ctx.store] || {
          indexes: {},
          callbacks: []
        };
        if (that.is(type, 'store')) {
          changeMap[ctx.database].stores[ctx.store].callbacks.push(obj);
        }
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] || {
            callbacks: []
          };
          if (that.is(type, 'index')) {
            changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].callbacks.push(obj);
          }
        }
        console.log("REGISTERED CHANGE LISTENER", ctx.key, ctx.changes,changeMap);
      }
    },
    inquire = function(type, ctx) {
      var listeners = [];
      changeMap[ctx.database] = changeMap[ctx.database] || {
        stores: {},
        callbacks: []
      };
      if (that.is(type, 'database')) {
        //database listeners
        console.log('databases?',changeMap[ctx.database].callbacks);
      }
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store] = changeMap[ctx.database].stores[ctx.store] || {
          indexes: {},
          callbacks: []
        };
        if (that.is(type, 'store')) {
          //store listeners
          console.log('stores?',changeMap[ctx.database].stores[ctx.store].callbacks);
        }
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] || {
            callbacks: []
          };
          if (that.is(type, 'index')) {
            //index listeners
            console.log('indexes?', changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].callbacks)
          }
        }
      }
      return listeners;
    },
    notify = function(ctx, type) {
      var inquiry = inquire(type, ctx);
      console.log('any listeners to notify?', inquiry);
      return ctx;
    },
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
    that = this;
    var id = randomId();
    changeMap[ id ] = state.context.changes;
    state.context.changes = id;
    return state;
  }, function (state) {
    that = this;
    if(!this.exists(state.context.changes)) {
      return notify(state.context, state.type);
    }
    var promise = state.promise,
        deferred = this.deferred();
    promise(function(ste) {
      ste.context.changes = changeMap[ ste.context.changes ];
      notify(state.context, state.type)
      register(ste.type, ste.context);
      deferred.resolve(ste);
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));
