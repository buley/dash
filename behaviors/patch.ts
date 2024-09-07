/**
 * @summary
 * `dashPatch` applies a patch process to the state, allowing for modification of the state before and after certain operations.
 * 
 * The main features include:
 * 1. **Patching Initialization**: Registers patch functions that are applied before and after an operation.
 * 2. **Sequential Processing**: Supports applying patches in sequence, allowing state transformations at different stages.
 * 3. **Promise Handling**: Resolves or rejects the state based on the patch application process.
 */

interface State {
    context: {
      patch?: any;
      patchid?: string;
      promise?: (onResolve: Function, onReject?: Function, onNotify?: Function) => void;
    };
    promise: (onResolve: Function, onReject?: Function, onNotify?: Function) => void;
  }
  
  interface PatchMap {
    [key: string]: {
      before: any;
      after: any;
    };
  }
  
  const dashPatch = (function (environment: any) {
    "use strict";
  
    let patchMap: PatchMap = {};
  
    return [
      /**
       * Initializes the patch process, applying the `before` patch function to the state.
       * @param state - The current state object with the patch context.
       * @returns The updated state after applying the `before` patch.
       */
      function (state: State): State {
        if (this.isEmpty(state.context.patch)) {
          return state;
        }
  
        const outside = this.deferred();
        let result;
        const promise = state.promise;
        const that = this;
  
        // Create a unique patch ID and store the before and after patches
        const patchid = this.random();
        state.context.patchid = patchid;
        
        patchMap[patchid] = this.isArray(state.context.patch)
          ? { before: state.context.patch[0], after: state.context.patch[1] }
          : { before: state.context.patch, after: state.context.patch };
  
        // Set the promise to be resolved outside the current scope
        state.promise = outside.promise;
  
        // Apply the `before` patch function to the state
        result = this.apply(patchMap[patchid].before, [state]);
  
        if (this.is(result.promise, state.promise)) {
          result.promise = promise;
          state = result;
        } else {
          result(
            function (ctx: State) {
              state.context.promise = promise;
              outside.resolve(ctx);
            },
            function (ctx: State) {
              state.context.promise = promise;
              outside.reject(ctx);
            },
            function (ctx: State) {
              state.context.promise = promise;
              outside.notify(ctx);
            }
          );
        }
  
        return state;
      },
  
      /**
       * Applies the `after` patch function to the state and resolves the promise.
       * @param state - The current state object with the patch context.
       * @returns The updated state after applying the `after` patch.
       */
      function (state: State): State {
        if (this.isEmpty(state.context.patchid)) {
          return state;
        }

        const patchid = state.context.patchid;
  
        if (patchid && !patchMap[patchid]?.after) {
          delete state.context.patchid;
          delete patchMap[patchid];
          return state;
        }
  
        const outside = this.deferred();
        let result;
        const promise = state.promise;
        const that = this;
  
        // Set the promise to be resolved outside the current scope
        state.promise = outside.promise;
  
        // Apply the `after` patch function to the state
        if (state.context.patchid && patchMap[state.context.patchid]) {
          result = this.apply(patchMap[state.context.patchid].after, [state]);
        } else {
          result = state;
        }
        
        if (this.is(result.promise, state.promise)) {
          result.promise = promise;
          state = result;
        } else {
          result(
            function (ctx2: State) {
              if (ctx2.context.patchid !== undefined) {
                const patchId = ctx2.context.patchid;
                delete patchMap[patchId];
                delete ctx2.context.patchid;
              }
              outside.resolve(ctx2);
            },
            function (ctx2: State) {
              outside.reject(ctx2);
            },
            function (ctx2: State) {
              outside.notify(ctx2);
            }
          );
        }
  
        return state;
      }
    ];
  })(self);
  
  export { dashPatch };
  export default dashPatch;
  