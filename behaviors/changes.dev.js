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
        return obj;
      }
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store] = changeMap[ctx.database].stores[ctx.store] || {
          indexes: {},
          callbacks: []
        };
        if (that.is(type, 'store')) {
          changeMap[ctx.database].stores[ctx.store].callbacks.push(obj);
          return obj;
        }
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] || {
            data: null
          };
          if (that.is(type, 'index')) {
            changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].data = obj;
            return obj;
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
      }
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store] = changeMap[ctx.database].stores[ctx.store] || {
          indexes: {},
          callbacks: []
        };
        if (that.is(type, 'store')) {
          //store listeners
        }
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] || {
            data: null
          };
          if (that.is(type, 'index')) {
            //index listeners
          }
        }
      }
      return listeners;
    },
    notify = function(type, ctx) {
      var inquiry = inquire(type, ctx);
      console.log('any listeners to notify?', inquiry);
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
    if(!this.exists(state.context.changes)) {
      return notify(state.type, state.context);
    }
    that = this;
    var promise = state.promise,
        deferred = this.deferred();
    promise(function(ste) {
      ste.context.changes = changeMap[ ste.context.changes ];
      notify(ste.type, ste.context)
      register(ste.type, ste.context);
      deferred.resolve(ste);
    });
    state.promise = deferred.promise;
    return ;
  } ];
}(self));
