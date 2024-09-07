/**
 * @summary
 * `dashMatch` is responsible for matching data against expressions defined in the context, optionally reducing the expression first.
 * 
 * The main features include:
 * 1. **Expression Reduction**: Recursively reduces expressions using functions or objects.
 * 2. **Data Matching**: Matches the reduced expression against data, supporting nested objects and regular expressions.
 * 3. **Promise Handling**: Resolves or rejects the state based on whether the data matches the expression.
 */

interface State {
    context: {
      match?: any;
      entry?: any;
      any?: boolean;
    };
    promise: (onResolve: Function, onReject?: Function) => void;
    type?: string;
  }
  
  const dashMatch = (function (environment: any) {
    "use strict";
  
    return [
      null, // Placeholder for the first element (possibly a setup function)
  
      /**
       * Matches the context expression with the entry data and resolves or rejects accordingly.
       * @param state - The current state object with match context.
       * @returns The updated state after matching.
       */
      function (state: State): State {
        if (this.isEmpty(state.context.match)) {
          return state;
        }
  
        const promise = state.promise;
        const deferred = this.deferred();
        const that = this;
  
        /**
         * Recursively reduces an expression using context data.
         * @param expression - The expression to reduce.
         * @param context - The context data used for reduction.
         * @returns The reduced expression.
         */
        const reduce = function (expression: any, context: any): any {
          const maybeReduce = function (expr: any, context: any) {
            if (that.isFunction(expr)) {
              expr = that.apply(expr, [context], that);
            }
            if (that.isObject(expr)) {
              that.iterate(expr, function (key: any, value: any) {
                expr[key] = maybeReduce(value, context);
              });
            }
            return expr;
          };
          return maybeReduce(expression, context);
        };
  
        /**
         * Matches the reduced expression against the data.
         * @param expr - The reduced expression to match.
         * @param data - The data to match against.
         * @returns True if the data matches the expression, otherwise false.
         */
        const match = function (expr: any, data: any): boolean {
          let matches = true;
          if (that.isEmpty(data)) {
            return false;
          }
  
          let ok = true;
          let any = false;
  
          // Iterate over the expression and compare it with the data
          that.iterate(expr, function (key: any, val: any) {
            if (!that.exists(data[key])) {
              ok = false;
            }
  
            if (that.isObject(val)) {
              ok = match(val, data[key]);
              if (ok) {
                any = true;
              }
            } else if (that.isRegEx(val)) {
              if (!data[key] || !data[key].match(val)) {
                ok = false;
              } else {
                any = true;
              }
            } else if (data[key] !== val) {
              ok = false;
            } else {
              any = true;
            }
          });
  
          // Return true if any match is required, otherwise check for complete match
          return that.is(state.context.any, true) ? any : ok;
        };
  
        let reduced: any;
  
        // Process the promise to reduce and match the data
        promise(function (st: State) {
          reduced = reduce(st.context.match, st.context);
          if (st.type === "notify" && !match(reduced, st.context.entry)) {
            st.type = undefined;
            deferred.reject(st);
          } else {
            deferred.resolve(st);
          }
        });
  
        // Set the updated promise in the state
        state.promise = deferred.promise;
        return state;
      }
    ];
  })(self);
  
  export { dashMatch };
  export default dashMatch;
  