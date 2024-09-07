/**
 * @summary
 * `dashCollect` is a utility for collecting and storing entries during a state process.
 * It manages collections of data and allows entries or errors to be collected during notifications and resolved when the process completes.
 * 
 * The main features include:
 * 1. **Collection Initialization**: Initializes a collector to gather entries based on a specific context.
 * 2. **Collecting Entries**: Adds entries or errors into a collection during notifications and resolves them at the end.
 * 
 * The system maintains a `collections` object to store the gathered entries for each collector instance, identified by a unique collector ID.
 */

interface State {
    type(arg0: string[], type: any): unknown;
    context: {
      collect?: boolean;
      collector?: string;
      collection?: any[];
      entry?: any;
      error?: any;
    };
    promise: (onResolve: Function, onReject?: Function, onNotify?: Function) => void;
  }
  
  interface Collections {
    [key: string]: any[];
  }
  
  const dashCollect = (function (environment: any) {
    "use strict";
  
    // Object to store collections of entries by collector ID
    let collections: Collections = {};
  
    return [
      /**
       * Initializes a collection for the current state if the `collect` flag is set to true.
       * @param state - The current state object with context.
       * @returns The updated state object with initialized collection.
       */
      function (state: State): State {
        if (this.isnt(state.context.collect, true)) {
          return state;
        }
  
        // Create a unique collector ID and initialize an empty collection for it
        state.context.collector = this.random();
        collections[state.context.collector!] = [];
        state.context.collection = collections[state.context.collector!];
  
        return state;
      },
  
      /**
       * Collects entries during the state process and resolves or rejects the collection when complete.
       * @param state - The current state object with context and promise handling.
       * @returns The updated state object with the processed collection.
       */
      function (state: State): State {
        if (this.isnt(state.context.collect, true)) {
          return state;
        }
  
        const promise = state.promise;
        const deferred = this.deferred();
        const that = this;
  
        promise(
          function (ste: State) {
            // Handle notification and error events by adding entries or errors to the collection
            if (that.contains(['notify', 'error'], ste.type)) {
              if (that.exists(ste.context.entry)) {
                collections[ste.context.collector!].push(ste.context.entry);
                deferred.notify(ste);
              } else if (that.exists(ste.context.error)) {
                collections[ste.context.collector!].push(ste.context.error);
                deferred.reject(ste);
              }
            } else if (ste.type(["resolve"], ste.type)) {
              // On resolve, clone the collection and clean up the collector
              if (that.exists(ste.context.collector)) {
                ste.context.collection = that.clone(collections[ste.context.collector!]);
              }
              delete ste.context.collector;
              deferred.resolve(ste);
              delete collections[ste.context.collector!];
            }
          }
        );
  
        // Update the state with the new promise
        state.promise = deferred.promise;
        return state;
      }
    ];
  }(self));
  
  export { dashCollect };
  export default dashCollect;
  