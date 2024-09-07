/**
 * @summary
 * `dashLive` handles live updates in a system by managing a map of live processes, allowing entries to be updated in real-time.
 * 
 * The main features include:
 * 1. **Live Mapping**: Registers and tracks live updates using a `liveid`.
 * 2. **Change Handling**: Allows real-time changes to be applied and updated asynchronously.
 * 3. **Promise Handling**: Attaches live updates to state promises and resolves, rejects, or notifies accordingly.
 */

interface State {
    context: {
      live?: boolean;
      liveid?: string;
      changes?: any[];
      zombie?: string;
    };
    promise: (onResolve: Function, onReject?: Function, onNotify?: Function) => void;
    type?: string;
    method?: string;
  }
  
  interface LiveMap {
    [key: string]: any;
  }
  
  const dashLive = (function (environment: any) {
    "use strict";
  
    let that: any;
    let liveMap: LiveMap = {};
  
    /**
     * Creates a live function that listens for changes and manages live updates.
     * @param ste - The current state object.
     * @returns A live update function that applies changes.
     */
    const live = function (ste: State) {
      const ctx = ste.context;
      
      const fn = function (live_ctx: State) {
        if (!liveMap[ste.context.liveid!]) {
          return live_ctx;
        }
  
        // Create a clone of the state and mark it as a notification or resolution
        const ditto = that.clone(ste);
        ditto.type = that.contains(['get.entries', 'update.entries', 'remove.entries'], ditto.method!) ? 'notify' : 'resolve';
        ditto.context = live_ctx.context;
        ditto.context.zombie = "braaains"; // Marker for live updates
        liveMap[ste.context.liveid!][ditto.type](ditto);
      };
  
      fn.ready = false; // Initially not ready
      return fn;
    };
  
    return [
      /**
       * Registers live updates for the current state if the `live` flag is set.
       * @param state - The current state object with context and live tracking.
       * @returns The updated state with live changes attached.
       */
      function (state: State): State {
        that = this;
  
        if (this.isnt(state.context.live, true)) {
          return state;
        }
  
        // Create a unique live ID and initialize live updates
        state.context.liveid = this.random();
        const lives = live(this.clone(state));
        if (state.context.liveid) {
          liveMap[state.context.liveid] = lives;
        }
  
        // Attach live updates to the context's changes array or function
        state.context.changes = state.context.changes ?? [];
        state.context.changes.push(lives);
  
        return state;
      },
  
      /**
       * Handles resolving, rejecting, or notifying live updates, and cleans up the live map.
       * @param state - The current state object with context, promise, and live updates.
       * @returns The updated state after live updates are resolved or removed.
       */
      function (state: State): State {
        that = this;
  
        if (this.isEmpty(state.context.liveid)) {
          return state;
        }
  
        const promise = state.promise;
        const deferred = this.deferred();
  
        /**
         * Removes the live updates from the state changes and cleans up the `liveid`.
         * @param ste - The current state object.
         * @returns The state object after live updates are removed.
         */
        const removeChanges = function (ste: State) {
          if (that.isArray(ste.context.changes)) {
            that.each(ste.context.changes, function (el: any, i: number) {
              if (that.is(ste, liveMap[ste.context.liveid!])) {
                delete ste.context.changes![i];
              }
            });
          }
  
          delete ste.context.liveid;
          return ste;
        };
  
        if (this.contains(['resolve', 'error'], state.type!)) {
          liveMap[state.context.liveid!] = deferred;
        }
  
        state.promise = deferred.promise;
  
        // Process the promise and apply the appropriate resolution or notification
        promise(
          function (ctx: State) {
            deferred.resolve(removeChanges(ctx));
          },
          function (ctx: State) {
            deferred.reject(removeChanges(ctx));
          },
          function (ctx: State) {
            deferred.notify(removeChanges(ctx));
          }
        );
  
        return removeChanges(state);
      }
    ];
  })(self);
  
  export { dashLive };
  export default dashLive;
  