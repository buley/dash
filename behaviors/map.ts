/**
 * @summary
 * `dashMap` handles mapping transformations over a given set of entries using a context-based mapping function.
 * 
 * The main features include:
 * 1. **Mapping Initialization**: Registers a map function or array of functions for processing entries.
 * 2. **Processing Entries**: Applies the registered map functions to the entries and resolves the result.
 * 
 * It supports both synchronous and asynchronous mapping operations, tracking `mapid` for each context.
 */

interface State {
  context: {
    map?: any;
    mapid?: string;
    reduce?: any;
    entry?: any;
    mapped?: any;
    promise?: (onResolve: Function, onReject?: Function, onNotify?: Function) => void;
  };
  promise: (onResolve: Function, onReject?: Function, onNotify?: Function) => void;
}

interface MapMap {
  [key: string]: any[];
}

const dashMap = (function (environment: any) {
  "use strict";

  let mapMap: MapMap = {}; // Stores mappings by `mapid`

  return [
    /**
     * Initializes the mapping process for the current state, registering the map function(s).
     * @param state - The current state object with the map context.
     * @returns The updated state with a registered `mapid`.
     */
    function (state: State): State {
      if (this.isEmpty(state.context.map) || !this.isEmpty(state.context.reduce)) {
        return state;
      }

      // Generate a unique map ID and store the mapping function(s) in mapMap
      state.context.mapid = this.random();
      if (state.context.mapid !== undefined) {
        mapMap[state.context.mapid] = this.isArray(state.context.map) ? state.context.map : [state.context.map];
      }

      // Clean up the context map
      delete state.context.map;
      return state;
    },

    /**
     * Applies the registered map functions to the entry and resolves the mapped result.
     * @param state - The current state object with the entry and map context.
     * @returns The updated state with the processed `mapped` result.
     */
    function (state: State): State {
      if (this.isEmpty(state.context.mapid) || !this.isEmpty(state.context.reduce)) {
        return state;
      }

      if (this.exists(state.context.entry)) {
        const deferred = this.deferred();
        let result = state.context.entry;
        let promise = state.promise;
        let results: any[] = [];
        let promises: any[] = [];
        const that = this;

        // Apply each mapping function in the map array
        if (state.context.mapid) {
            this.each(mapMap[state.context.mapid], function (fn: any) {
                result = that.apply(fn, [result]);
      
                // If result is a function (asynchronous), collect it in promises; otherwise, store the result
                if (that.isFunction(result)) {
                  promises.push(result);
                } else {
                  results.push(result);
                }
              });
        }
        

        // If no asynchronous functions, resolve the results immediately
        if (this.isEmpty(promises)) {
          state.context.mapped = this.is(results.length, 1) ? results[0] : results;
        } else {
          // Process asynchronous functions (promises)
          this.each(promises, function (pro: any) {
            promise(function (result: any) {
              results.push(result);
            });
            promise = pro;
          });

          state.context.promise = promise(
            function (ctx: any) {
              ctx.mapped = that.is(results.length, 1) ? results[0] : results;
              deferred.resolve(ctx);
            },
            function (ctx: any) {
              deferred.reject(ctx);
            },
            function (ctx: any) {
              deferred.notify(ctx);
            }
          ) as ((onResolve: Function, onReject?: Function, onNotify?: Function) => void) | undefined;
        }

        // Clean up map data from context and mapMap
        if (state.context.mapid !== undefined) {
          delete mapMap[state.context.mapid];
        }
        delete state.context.mapid;
      }

      return state;
    }
  ];
})(self);

export { dashMap };
export default dashMap;
