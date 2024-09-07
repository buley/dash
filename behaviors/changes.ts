/**
 * @summary
 * `dashChanges` is responsible for managing database change tracking and notifications. 
 * It allows you to register, update, inquire, and unregister changes in the database or stores, 
 * providing a mechanism to handle change callbacks for various entities (databases, stores, indexes, and entries).
 * 
 * The main features include:
 * 1. **Change Registration**: Register callbacks for tracking changes to databases, stores, indexes, or individual entries.
 * 2. **Change Unregistration**: Unregister change callbacks or clear data for databases, stores, indexes, or entries.
 * 3. **Change Updates**: Update the change map when an entity (database, store, index, or entry) has been modified.
 * 4. **Inquiries**: Check if changes have occurred, providing details on the previous and current states of entities.
 * 5. **Notifications**: Notify all registered callbacks when a change has been made, including calculating the differences 
 *    between the previous and current state of entities if requested.
 * 
 * The system maintains a `changeMap` to track changes and a `callbackMap` to store registered callbacks. 
 * This allows changes to be efficiently processed and communicated to the appropriate listeners.
 * 
 * The internal methods like `register`, `update`, `unregister`, and `notify` work together to ensure that changes 
 * are handled correctly and all interested parties are informed of relevant updates.
 */

interface ChangeContext {
    db: any;
    objectstore: any;
    idx: any;
    database: string;
    store?: string;
    index?: string;
    key?: string;
    primary_key?: string;
    entry?: any;
    changeid?: string;
    live?: boolean;
    diff?: boolean;
    shallow?: boolean;
  }
  
  interface CallbackMap {
    [key: string]: any;
  }
  
  interface ChangeMap {
    [database: string]: {
      data: any;
      stores: {
        [store: string]: {
          data: any;
          entries?: any;
          indexes?: any;
          callbacks?: any[];
        };
      };
      callbacks: any[];
    };
  }
  
  export const dashChanges: ((state: any) => any)[] = (function (environment: any) {
    "use strict";
  
    // Maps to store callbacks and changes
    let callbackMap: CallbackMap = {};
    let changeMap: ChangeMap = {};
    let that: any;
  
    /**
     * Updates the change map with a new entry or updated entry for a given context.
     * @param type - The type of update (e.g., 'update.entries', 'update.entry').
     * @param ctx - The context including the database, store, and entry information.
     */
    const update = function (type: string, ctx: ChangeContext) {
      if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
        if (that.contains(['update.entries', 'update.entry'], type)) {
          const key: string = ctx.primary_key || ctx.key || '';
          changeMap[ctx.database].stores[ctx.store!].entries = changeMap[ctx.database].stores[ctx.store!].entries || {};
          const entries = changeMap[ctx.database].stores[ctx.store!].entries;
          entries[key] = entries[key] || { callbacks: [] };
          if (that.exists(ctx.entry)) {
            if (key) {
              changeMap[ctx.database].stores[ctx.store!].entries[key].data = ctx.entry;
            }
          }
        }
      }
    };
  
    /**
     * Unregisters changes for a given context and type, removing data from the change map.
     * @param type - The type of removal (e.g., 'remove.database', 'remove.store').
     * @param ctx - The context including the database, store, index, or key information.
     */
    const unregister = function (type: string, ctx: ChangeContext) {
      if (that.contains(['remove.database'], type)) {
        delete changeMap[ctx.database];
      } else if (that.exists(ctx.store)) {
        if (that.contains(['remove.store'], type)) {
          delete changeMap[ctx.database].stores[ctx.store!];
        } else if (that.exists(ctx.index)) {
          if (that.contains(['remove.index'], type)) {
            delete changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!];
          } else if (that.exists(ctx.key) && that.isnt(ctx.primary_key, ctx.key)) {
            if (that.contains(['remove.entries', 'remove.entry', 'clear.store'], type)) {
              delete changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].entries[ctx.key!];
              delete changeMap[ctx.database].stores[ctx.store!].entries![ctx.primary_key!];
            }
          }
        } else if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
          if (that.contains(['remove.entries', 'remove.entry', 'clear.store'], type)) {
            const key = ctx.primary_key || ctx.key;
            if (that.exists(changeMap[ctx.database])) {
              delete changeMap[ctx.database].stores[ctx.store!].entries![key!];
            }
          }
        }
      }
    };
  
    /**
     * Registers a callback or change for a given context and type.
     * @param type - The type of operation (e.g., 'get.database', 'get.store').
     * @param ctx - The context including the database, store, index, or key information.
     */
    const register = function (type: string, ctx: ChangeContext) {
      const obj = ctx.changeid;
      changeMap[ctx.database] = changeMap[ctx.database] || { stores: {}, callbacks: [] };
  
      if (that.contains(['get.databases', 'get.database'], type)) {
        changeMap[ctx.database].callbacks.push(obj);
      }
  
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store!] = changeMap[ctx.database].stores[ctx.store!] || { callbacks: [], indexes: {} };
  
        if (that.contains(['get.stores', 'get.store'], type)) {
            if (changeMap[ctx.database] && changeMap[ctx.database].stores[ctx.store!]) {
                if (changeMap[ctx.database] && changeMap[ctx.database].stores[ctx.store!].callbacks) {
                    changeMap[ctx.database].stores[ctx.store!].callbacks?.push(obj);
                }
            }
        }
  
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!] = changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!] || { callbacks: [], entries: {} };
  
          if (that.contains(['get.index', 'get.indexes'], type)) {
            if (that.exists(ctx.index)) {
              changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].data = ctx.index;
            }
            if (!that.contains(changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].callbacks, obj)) {
              changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].callbacks.push(obj);
            }
          }
  
          if (that.exists(ctx.key) && that.isnt(ctx.primary_key, ctx.key)) {
            if (that.is(ctx.live, true) || that.contains(['get.entry', 'get.entries', 'update.entry', 'remove.entry', 'update.entries'], type)) {
              changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].entries![ctx.key!] = changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].entries![ctx.key!] || { callbacks: [] };
              if (that.exists(ctx.entry)) {
                changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].entries![ctx.key!].data = ctx.entry;
              }
              if (!that.contains(changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].entries![ctx.key!].callbacks, obj)) {
                changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].entries![ctx.key!].callbacks.push(obj);
              }
            }
          }
        }
  
        if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
          if (that.is(ctx.live, true) || that.contains(['get.entry', 'get.entries', 'update.entries', 'update.entry'], type)) {
            const key = ctx.primary_key || ctx.key;
            changeMap[ctx.database].stores[ctx.store!].entries = changeMap[ctx.database].stores[ctx.store!].entries || {};
            changeMap[ctx.database].stores[ctx.store!].entries[key!] = changeMap[ctx.database].stores[ctx.store!].entries[key!] || { callbacks: [] };
            if (that.exists(ctx.entry)) {
              changeMap[ctx.database].stores[ctx.store!].entries[key!].data = ctx.entry;
            }
            if (!that.contains(changeMap[ctx.database].stores[ctx.store!].entries[key!].callbacks, obj)) {
              changeMap[ctx.database].stores[ctx.store!].entries[key!].callbacks.push(obj);
            }
          }
        }
      }
    };
  
    /**
     * Inquires the current state of a database/store/index/entry and gathers listeners for notifying changes.
     * @param type - The type of operation (e.g., 'remove.database', 'add.index').
     * @param ctx - The context including the database, store, index, or key information.
     * @returns An object containing the listeners, current state, and previous state.
     */
    const inquire = function (type: string, ctx: ChangeContext) {
      const listeners: any[] = [];
      let previous: any = null;
      let current: any = null;
      const obj = ctx.changeid;
  
      changeMap[ctx.database] = changeMap[ctx.database] || { stores: {}, callbacks: [] };
  
      if (that.contains(['remove.database', 'add.index', 'add.store'], type)) {
        that.each(changeMap[ctx.database].callbacks, function (callback: any) {
          if (!that.contains(listeners, callback)) {
            listeners.push(callback);
          }
        });
        previous = changeMap[ctx.database].data;
        current = ctx.db;
      }
  
      if (that.exists(ctx.store)) {
        changeMap[ctx.database].stores[ctx.store!] = changeMap[ctx.database].stores[ctx.store!] || { callbacks: [], indexes: {} };
  
        if (that.contains(['remove.database', 'remove.store', 'clear.store', 'add.index'], type)) {
          that.each(changeMap[ctx.database].stores[ctx.store!].callbacks, function (callback: any) {
            if (!that.contains(listeners, callback)) {
              listeners.push(callback);
            }
          });
          previous = changeMap[ctx.database].stores[ctx.store!].data;
          current = ctx.objectstore;
        }
  
        if (that.exists(ctx.index)) {
          changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!] = changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!] || { callbacks: [], entries: {} };
  
          if (that.contains(['remove.index', 'remove.store', 'remove.database', 'clear.store'], type)) {
            that.each(changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].callbacks, function (callback: any) {
              if (!that.contains(listeners, callback)) {
                listeners.push(callback);
              }
            });
            previous = changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].data;
            current = ctx.idx;
          }
  
          if (that.exists(ctx.key) && that.isnt(ctx.primary_key, ctx.key)) {
            if (that.is(ctx.live, true) || that.contains(['get.entries', 'get.entry', 'remove.store', 'clear.store', 'remove.database', 'update.entries', 'update.entry', 'remove.entries', 'remove.entry'], type)) {
              changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].entries![ctx.key!] = changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].entries![ctx.key!] || { callbacks: [] };
              previous = changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].entries![ctx.key!].data;
              current = ctx.entry;
              that.each(changeMap[ctx.database].stores[ctx.store!].indexes[ctx.index!].entries![ctx.key!].callbacks, function (callback: any) {
                if (!that.contains(listeners, callback)) {
                  listeners.push(callback);
                }
              });
            }
          }
        }
  
        if (that.exists(ctx.primary_key) || that.exists(ctx.key)) {
          if (that.contains(['update.entries', 'update.entry', 'remove.entries', 'remove.entry', 'remove.database', 'remove.store', 'clear.store'], type)) {
            const key = ctx.primary_key || ctx.key;
            changeMap[ctx.database].stores[ctx.store!].entries = changeMap[ctx.database].stores[ctx.store!].entries || {};
            changeMap[ctx.database].stores[ctx.store!].entries[key!] = changeMap[ctx.database].stores[ctx.store!].entries[key!] || { callbacks: [] };
            previous = changeMap[ctx.database].stores[ctx.store!].entries[key!].data;
            current = ctx.entry;
            that.each(changeMap[ctx.database].stores[ctx.store!].entries[key!].callbacks, function (callback: any) {
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
        previous: previous,
      };
    };
  
    /**
     * Compares two values to see if they are not the same.
     * @param a - The first value to compare.
     * @param b - The second value to compare.
     * @returns True if the values are not the same, false otherwise.
     */
    const notSame = function (a: any, b: any): boolean {
      if (that.isArray(a)) {
        a = a.join('');
      }
      if (that.isArray(b)) {
        b = b.join('');
      }
      a = a ? a.toString() : a;
      b = b ? b.toString() : b;
      return that.isnt(a, b);
    };
  
    /**
     * Notifies registered listeners of changes in the database or store.
     * @param ctx - The context including the database, store, and entry information.
     * @param method - The method or operation type (e.g., 'get.entry', 'remove.entry').
     * @param type - The type of change (e.g., 'update.entry', 'remove.entry').
     * @returns The updated context after notifications are processed.
     */
    const notify = function (ctx: ChangeContext, method: string, type: string) {
      const inquiry = inquire(method, ctx);
      const listeners = inquiry.listeners || [];
      const current = inquiry.current || {};
      const previous = inquiry.previous || {};
  
      /**
       * Calculates the difference between two objects or arrays.
       * @param one - The first object or array.
       * @param two - The second object or array.
       * @param shallow - If true, perform a shallow comparison.
       * @returns An object representing the differences between the two inputs.
       */
      const difference = function (one: any, two: any, shallow: boolean) {
        const diff: any = {};
        one = one || {};
        two = two || {};
  
        if (that.isObject(one)) {
          that.iterate(one, function (key: any, val: any) {
            if (notSame(val, two[key])) {
              if (that.isEmpty(val) || that.isEmpty(one[key])) {
                diff[key] = [val, one[key]];
              } else if (!shallow && (that.exists(two[key]) && that.isObject(two[key]) || that.isObject(val))) {
                diff[key] = difference(val, two[key], shallow);
              } else {
                diff[key] = [val, two[key]];
              }
            }
          });
        } else if (that.isArray(one)) {
          if (that.isArray(two)) {
            that.each(one, function (val: any, i: any) {
              diff[i] = diff[i] || [];
              if (that.isEmpty(val) || that.isEmpty(two[i])) {
                diff[i] = [val, two[i]];
              } else if (!shallow && (that.exists(one[i]) && that.isObject(one[i]) || that.isObject(val))) {
                diff[i] = difference(val, two[i], shallow);
              } else {
                diff[i] = [one[i], val];
              }
            });
          }
        }
  
        if (that.isObject(two)) {
          that.iterate(two, function (key: any, val: any) {
            if (notSame(val, one[key]) && that.isEmpty(one[key])) {
              if (that.isEmpty(val) || that.isEmpty(two[key])) {
                diff[key] = [val, two[key]];
              } else if (!shallow && (that.exists(one[key]) && that.isObject(one[key]) || that.isObject(val))) {
                diff[key] = difference(one[key], val, shallow);
              } else {
                diff[key] = [one[key], val];
              }
            }
          });
        } else if (that.isArray(two)) {
          if (that.isArray(two)) {
            that.each(two, function (val: any, i: any) {
              diff[i] = diff[i] || [];
              if (that.isEmpty(val) || that.isEmpty(one[i])) {
                diff[i] = [val, one[i]];
              } else if (!shallow && (that.exists(one[i]) && that.isObject(one[i]) || that.isObject(val))) {
                diff[i] = difference(one[i], val, shallow);
              } else {
                diff[i] = [one[i], val];
              }
            });
          }
        }
  
        return diff;
      };
  
      const diff = that.is(ctx.diff, true) ? difference(current, previous, ctx.shallow ? true : false) : null;
      const args = { context: ctx, method: method, type: type, current: current, previous: previous, difference: diff };
  
      if (!that.is(ctx.diff, true) || that.isnt(args.difference, null)) {
        that.each(listeners, function (id: any, i: any) {
          const listens = callbackMap[id];
          if (that.isArray(listens)) {
            that.each(listens, function (listen: any, z: any) {
              if (false === that.apply(listen, [args])) {
                delete listeners[i][z];
                delete callbackMap[id][z];
              }
            });
          } else {
            if (false === that.apply(callbackMap[id], [args])) {
              delete listeners[i];
              delete callbackMap[id];
            }
          }
        });
      }
  
      return ctx;
    };
  
    return [
      function (state: any) {
        that = this;
        const id = this.random();
        state.context.changeid = id;
        if (!this.isFunction(state.context.changes) && !this.isArray(state.context.changes)) {
          return state;
        }
        callbackMap[id] = this.clone(state.context.changes);
        return state;
      },
      function (state: any) {
        if (this.exists(state.context.zombie)) {
          return state;
        }
        that = this;
        const promise = state.promise;
        const outward = this.deferred();
  
        const doTick = function (ste: any) {
          if (!ste || !!ste.context.changing) {
            return ste;
          }
          ste.context.changing = true;
          notify(ste.context, ste.method, ste.type);
          unregister(ste.method, ste.context);
          if (!!state.context.changes) {
            register(ste.method, ste.context);
          }
          if (that.is('resolve', 'notify', ste.type)) {
            update(ste.method, ste.context);
          }
          if (that.is('resolve', ste.type)) {
            if (!that.isEmpty(callbackMap[ste.context.changeid])) {
              ste.context.changes = callbackMap[ste.context.changeid];
            }
            delete ste.context.changeid;
          }
          return ste;
        };
  
        promise(function (ste: any) {
          outward.resolve(doTick(ste));
        }, function (ste: any) {
          outward.reject(ste);
        }, function (ste: any) {
          outward.notify(doTick(ste));
        });
  
        state.promise = outward.promise;
        return state;
      }
    ];
  }(self));
  
  export default dashChanges;