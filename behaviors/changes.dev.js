window.dashChanges = window.dashChanges || (function (environment) {
  "use strict";
  var callbackMap = {},
    changeMap = {},
    that,
    unregister = function(type, ctx) {

    },
    register = function(type, ctx) {
      var obj = ctx.changed;
      changeMap[ctx.database] = changeMap[ctx.database] || {
        stores: {},
        callbacks: [],
      };
      if (that.contains(['get.databases','get.database'], type)) {
        changeMap[ctx.database].callbacks.push(obj);
      }
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store] = changeMap[ctx.database].stores[ctx.store] || {
          callbacks: [],
          indexes: {}
        };
        if (that.contains(['get.stores','get.store'], type)) {
          changeMap[ctx.database].stores[ctx.store].callbacks.push(obj);
        }
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] || {
            callbacks: [],
            entries: {}
          };
          if (that.contains(['get.index','get.indexes'], type)) {
            if (that.exists(ctx.idx)) {
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].data = ctx.idx;
            }
            changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].callbacks.push(obj);
          }
          if (that.exists(ctx.key) && that.isnt(ctx.primary_key, ctx.key)) {
            if (that.contains(['get.entry','get.entries', 'update.entry', 'remove.entry'], type)) {
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] || {
                callbacks: []
              };
              if (that.exists(ctx.entry)) {
                changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].data = ctx.entry;
              }
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].callbacks.push(obj);
            }
          }
        }
        if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
            if (that.contains(['get.entry','get.entries', 'update.entry', 'remove.entry'], type)) {
              var key = ctx.primary_key || ctx.key;
              changeMap[ctx.database].stores[ctx.store].entries = changeMap[ctx.database].stores[ctx.store].entries || {};
              changeMap[ctx.database].stores[ctx.store].entries[key] = changeMap[ctx.database].stores[ctx.store].entries[key] || {
                callbacks: []
              };
              if (that.exists(ctx.entry)) {
                changeMap[ctx.database].stores[ctx.store].entries[key].data = ctx.entry;
              }
              changeMap[ctx.database].stores[ctx.store].entries[key].callbacks.push(obj);
            }
        }        
      }
    },
    inquire = function(type, ctx) {
      var listeners = [];
      var obj = ctx.changed;
      changeMap[ctx.database] = changeMap[ctx.database] || {
        stores: {},
        callbacks: [],
      };
      if (that.contains(['remove.database'], type)) {
        changeMap[ctx.database].callbacks.push(obj);
        listeners.push.apply(listeners, changeMap[ctx.database].callbacks);
      }
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store] = changeMap[ctx.database].stores[ctx.store] || {
          callbacks: [],
          indexes: {}
        };
        if (that.contains(['remove.database', 'remove.store', 'clear.store'], type)) {
          listeners.push.apply(listeners, changeMap[ctx.database].stores[ctx.store].callbacks);
        }
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] || {
            callbacks: [],
            entries: {}
          };
          if (that.contains(['remove.index', 'remove.store', 'remove.database', 'clear.store'], type)) {
            listeners.push.apply(listeners, changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].callbacks);
          }
          if (that.exists(ctx.key) && that.isnt(ctx.primary_key, ctx.key)) {
            if (that.contains(['remove.store', 'clear.store', 'remove.database', 'update.entries', 'update.entry', 'remove.entries', 'remove.entry'], type)) {
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] || {
                callbacks: []
              };
              if (that.exists(ctx.entry)) {
                changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].data = ctx.entry;
              }
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].callbacks.push(obj);
            }
          }
        }
        if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
            if (that.contains(['update.entries', 'update.entry', 'remove.entries', 'remove.entry', 'remove.database', 'remove.store', 'clear.store'], type)) {
              var key = ctx.primary_key || ctx.key;
              changeMap[ctx.database].stores[ctx.store].entries = changeMap[ctx.database].stores[ctx.store].entries || {};
              changeMap[ctx.database].stores[ctx.store].entries[key] = changeMap[ctx.database].stores[ctx.store].entries[key] || {
                callbacks: []
              };
              if (that.exists(ctx.entry)) {
                changeMap[ctx.database].stores[ctx.store].entries[key].data = ctx.entry;
              }
              changeMap[ctx.database].stores[ctx.store].entries[key].callbacks.push(obj);
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
    callbackMap[ id ] = state.context.changes;
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
      var id = ste.context.changes;
      ste.context.changes = callbackMap[ id ]; 
      ste.context.changed = ste.context.changed || id;
      notify(state.context, state.method)
      register(ste.method, ste.context);
      unregister(ste.method, ste.context);
      deferred.resolve(ste);
    });
    state.promise = deferred.promise;
    return state;
  } ];
}(self));