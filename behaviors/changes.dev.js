window.dashChanges = window.dashChanges || (function (environment) {
  "use strict";
  var callbackMap = {},
    changeMap = {},
    that,
    update = function(type, ctx) {
      if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
        if (that.contains(['update.entries', 'update.entry'], type)) {
          var key = ctx.primary_key || ctx.key;
          changeMap[ctx.database].stores[ctx.store].entries = changeMap[ctx.database].stores[ctx.store].entries || {};
          changeMap[ctx.database].stores[ctx.store].entries[key] = changeMap[ctx.database].stores[ctx.store].entries[key] || {
            callbacks: []
          };
          if (that.exists(ctx.entry)) {
            changeMap[ctx.database].stores[ctx.store].entries[key].data = ctx.entry;
          }
        }
      }    
    },
    unregister = function(type, ctx) {
      if (that.contains(['remove.database'], type)) {
        delete changeMap[ctx.database];
      } else if (that.exists(ctx.store)) {
        if (that.contains(['remove.store'], type)) {
          delete changeMap[ctx.database].stores[ctx.store];
        } else if (that.exists(ctx.index)) {
          if (that.contains(['remove.index'], type)) {
            delete changeMap[ctx.database].stores[ctx.store].indexes[ctx.index];
          } else if (that.exists(ctx.key) && that.isnt(ctx.primary_key, ctx.key)) {
            if (that.contains(['remove.entries', 'remove.entry', 'clear.store'], type)) {
              delete changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ];
              delete changeMap[ctx.database].stores[ctx.store].entries[ ctx.primary_key ];
            }
          }
        } else if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
            if (that.contains(['remove.entries', 'remove.entry', 'clear.store'], type)) {
              var key = ctx.primary_key || ctx.key;
              if (that.exists(changeMap[ctx.database])) {
                delete changeMap[ctx.database].stores[ctx.store].entries[key];
              }
            }
        }        
      }      
    },
    register = function(type, ctx) {
      var obj = ctx.changeid;
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
            if (!that.contains(changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].callbacks, obj)) {
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].callbacks.push(obj);
            }
          }
          if (that.exists(ctx.key) && that.isnt(ctx.primary_key, ctx.key)) {
            if (that.is(ctx.live, true) || that.contains(['get.entry','get.entries', 'update.entry', 'remove.entry', 'update.entries'], type)) {
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] || {
                callbacks: []
              };
              if (that.exists(ctx.entry)) {
                changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].data = ctx.entry;
              }
              if (!that.contains(changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].callbacks, obj)) {
                changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].callbacks.push(obj);
              }
            }
          }
        }
        if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
          if (that.is(ctx.live, true) || that.contains(['get.entry','get.entries', 'update.entries', 'update.entry'], type)) {
            var key = ctx.primary_key || ctx.key;
            changeMap[ctx.database].stores[ctx.store].entries = changeMap[ctx.database].stores[ctx.store].entries || {};
            changeMap[ctx.database].stores[ctx.store].entries[key] = changeMap[ctx.database].stores[ctx.store].entries[key] || {
              callbacks: []
            };
            if (that.exists(ctx.entry)) {
              changeMap[ctx.database].stores[ctx.store].entries[key].data = ctx.entry;
            }
            if (!that.contains(changeMap[ctx.database].stores[ctx.store].entries[key].callbacks, obj)) {
              changeMap[ctx.database].stores[ctx.store].entries[key].callbacks.push(obj);
            }
          }
        }
      }
    },
    inquire = function(type, ctx) {
      var listeners = [],
          previous = null,
          current = null,
          obj = ctx.changeid,
          key;
      changeMap[ctx.database] = changeMap[ctx.database] || {
        stores: {},
        callbacks: [],
      };
      if (that.contains(['remove.database', 'add.index', 'add.store'], type)) {
        that.each(changeMap[ctx.database].callbacks, function(callback) {
          if (!that.contains(listeners, callback)) {
            listeners.push(callback);
          }
        });
        previous = changeMap[ctx.database].data;
        current = ctx.db;
      }
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store] = changeMap[ctx.database].stores[ctx.store] || {
          callbacks: [],
          indexes: {}
        };
        if (that.contains(['remove.database', 'remove.store', 'clear.store', 'add.index'], type)) {
          that.each(changeMap[ctx.database].stores[ctx.store].callbacks, function(callback) {
            if (!that.contains(listeners, callback)) {
              listeners.push(callback);
            }
          });
          previous = changeMap[ctx.database].stores[ctx.store].data;
          current = ctx.objectstore;
        }
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index] || {
            callbacks: [],
            entries: {}
          };
          if (that.contains(['remove.index', 'remove.store', 'remove.database', 'clear.store'], type)) {
            that.each(changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].callbacks, function(callback) {
              if (!that.contains(listeners, callback)) {
                listeners.push(callback);
              }
            });
            previous = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].data;
            current = ctx.idx;
          }
          if (that.exists(ctx.key) && that.isnt(ctx.primary_key, ctx.key)) {
            if (that.is(ctx.live, true) || that.contains(['get.entries', 'get.entry', 'remove.store', 'clear.store', 'remove.database', 'update.entries', 'update.entry', 'remove.entries', 'remove.entry'], type)) {
              changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ] || {
                callbacks: []
              };
              previous = changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].data;
              current = ctx.entry;
              that.each(changeMap[ctx.database].stores[ctx.store].indexes[ctx.index].entries[ ctx.key ].callbacks, function(callback) {
                if (!that.contains(listeners, callback)) {
                  listeners.push(callback);
                }
              });
            }
          }
        }
        if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
            if (that.contains(['update.entries', 'update.entry', 'remove.entries', 'remove.entry', 'remove.database', 'remove.store', 'clear.store'], type)) {
              key = ctx.primary_key || ctx.key;
              changeMap[ctx.database].stores[ctx.store].entries = changeMap[ctx.database].stores[ctx.store].entries || {};
              changeMap[ctx.database].stores[ctx.store].entries[key] = changeMap[ctx.database].stores[ctx.store].entries[key] || {
                callbacks: []
              };
              previous = changeMap[ctx.database].stores[ctx.store].entries[key].data;
              current = ctx.entry;
              that.each(changeMap[ctx.database].stores[ctx.store].entries[key].callbacks, function(callback) {
                if (!that.contains(listeners, callback)) {
                  listeners.push(callback);
                }
              });
            }
        }        
      }
      return {
        listeners: listeners,
        current: current,
        previous: previous
      };
    },
    notSame = function(a, b) {
      if ( that.isArray(a) ) {
        a = a.join('');
      }
      if ( that.isArray(b) ) {
        b = b.join('');
      }
      a = a ? a.toString() : a;
      b = b ? b.toString() : b;
      return that.isnt(a, b);
    },
    notify = function(ctx, method, type) {
      var inquiry = inquire(method, ctx),
        listeners = inquiry.listeners || [],
        current = inquiry.current || {},
        previous = inquiry.previous || {},
        difference = function(one, two, shallow) {
          var diff = {};
          one = one || {};
          two = two || {};
          if (that.isObject(one)) {
            that.iterate(one, function(key, val) {
              if (notSame(val, two[key])) {
                if ( that.isEmpty(val) || that.isEmpty(one[key])) {
                  diff[ key ] = [val, one[key]];
                } else if ( that.isnt(shallow, true) && ( ( that.exists(two[key]) && that.isObject(two[key]) ) || that.isObject(val))) {
                  diff[ key ] = difference(val, two[key], shallow);
                } else {
                  diff[ key ] = [val, two[key]];
                }
              }
            });
          } else if (that.isArray(one)) {
            if (that.isArray(two)) { 
              that.each(one, function(val, i) {
                diff[ i ] = diff[ i ] || [];
                if ( that.isEmpty(val) || that.isEmpty(two[i])) {
                  diff[ key ] = [val, two[i]];
                } if ( that.isnt(shallow, true) && (that.exists(one[i]) && that.isObject(one[i]) ) || that.isObject(val) ) {
                  diff[i] = difference(val, two[i], shallow);
                } else {
                  diff[i] = [one[i], val];
                }
              });
            }     
          }
          if (that.isObject(two)) {
            that.iterate(two, function(key, val) {
              if (notSame(val, one[key]) && that.isEmpty(one[ key ])) {
                if ( that.isEmpty(val) || that.isEmpty(two[key])) {
                  diff[ key ] = [val, two[key]];
                } if ( that.isnt(shallow, true) && (that.exists(one[key]) && that.isObject(one[key]) ) || that.isObject(val) ) {
                  diff[ key ] = difference(one[key], val, shallow);
                } else {
                  diff[ key ] = [one[key], val];
                }
              }
            });
          } else if (that.isArray(two)) {
            if (that.isArray(two)) { 
              that.each(two, function(val, i) {
                diff[ i ] = diff[ i ] || [];
                if ( that.isEmpty(val) || that.isEmpty(one[i])) {
                  diff[ i ] = [val, one[i]];
                } if ( that.isnt(shallow, true) && (that.exists(one[i]) && that.isObject(one[i]) ) || that.isObject(val) ) {
                  diff[ i ] = difference(one[i], val, shallow);
                } else {
                  diff[ i ] = [one[i], val];
                }
              });
            }     
          }
          return diff;
        },
        diff = (that.is(ctx.diff, true)) ? difference(current, previous, ctx.shallow ? true : false) : null,
        args = { context: ctx, method: method, type: type, current: current, previous: previous };
      if(that.is(ctx.diff, true)) {
        args.difference = that.isEmpty(diff) ? null : diff;
      }
      if (that.isnt(ctx.diff, true) || that.isnt(args.difference, null)) {
        that.each(listeners, function(id, i) {
          var listens = callbackMap[id];
          if(that.isArray(listens)) {
            that.each(listens, function(listen, z) {
              if ( false === that.apply(listen, [ args ]) ) {
                delete listeners[i][z];
                delete callbackMap[id][z];
              }
            });
          } else {
            if ( false === that.apply(callbackMap[id], [ args ]) ) {
              delete listeners[i];
              delete callbackMap[id];
            }
          }
        });
      }
      return ctx;
    };
  return [ function(state) {
    that = this;
    var id = this.random();
    state.context.changeid = id;
    if(!this.isFunction(state.context.changes) && !this.isArray(state.context.changes)) {
      return state;
    } 
    callbackMap[ id ] = this.clone(state.context.changes);
    return state;
  }, function (state) {
    if (this.exists(state.context.zombie)) {
      return state;
    }
    that = this;
    var promise = state.promise,
        outward = this.deferred(),
        doTick = function(ste) {
          if (!ste || !!ste.context.changing) {
            return ste;
          }
          ste.context.changing = true;
          notify(ste.context, ste.method, ste.type);
          unregister(ste.method, ste.context);
          if (!!state.context.changes) {
            register(ste.method, ste.context);
          }
          if(that.is('resolve', 'notify', ste.type)) {
            update(ste.method, ste.context);
          }
          if(that.is('resolve', ste.type)) {
            if ( !that.isEmpty(callbackMap[ ste.context.changeid ]) ) {
              ste.context.changes = callbackMap[ ste.context.changeid ];
            }
            delete ste.context.changeid;
          }
          return ste;
        };
    promise(function(ste) {
      outward.resolve(doTick(ste));
    }, function(ste) {
      outward.reject(ste);
    }, function(ste) {
      outward.notify(doTick(ste));
    });
    state.promise = outward.promise;
    return state;
  } ];
}(self));