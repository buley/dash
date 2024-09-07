/**
 * @summary
 * `dashShorthand` applies a shorthand mapping to the data or entries, transforming keys based on a given mapping before or after a state change.
 * 
 * The main features include:
 * 1. **Shorthand Reduction**: Maps or reverses the keys of objects using shorthand mappings.
 * 2. **State Transformation**: Applies shorthand mappings to the context data before and after state changes.
 */

interface State {
    context: {
      shorthand?: any;
      data?: any;
      entry?: any;
    };
  }
  
  const dashShorthand = (function (environment: any) {
    "use strict";
  
    let that: any;
  
    /**
     * Recursively reduces the expression based on the provided map and context.
     * @param map - The shorthand map used for reducing keys.
     * @param expr - The expression to reduce.
     * @param context - The context data.
     * @param reverse - Whether to reverse the shorthand map.
     * @returns The reduced expression.
     */
    const reduce = function (map: any, expr: any, context: any, reverse: boolean): any {
      if (that.isFunction(expr)) {
        expr = that.apply(expr, [context], that);
      }
      if (that.isObject(expr)) {
        that.iterate(expr, function (key: any, value: any) {
          if (!that.isEmpty(map[key])) {
            delete expr[key];
            key = map[key];
          }
          expr[key] = reduce(map, value, context, reverse);
        });
      }
      return expr;
    };
  
    /**
     * Reverses the keys and values in the expression.
     * @param expr - The expression to reverse.
     * @returns The reversed expression.
     */
    const reverse = function (expr: any): any {
      if (that.isObject(expr)) {
        that.iterate(expr, function (key: any, value: any) {
          if (that.isObject(value)) {
            expr[key] = reverse(value);
          } else {
            expr[value] = key;
          }
        });
      }
      return expr;
    };
  
    return [
      /**
       * Applies the shorthand mapping before the state change.
       * @param state - The current state object.
       * @returns The updated state with transformed data.
       */
      function (state: State): State {
        that = this;
        if (this.isEmpty(state.context.shorthand)) {
          return state;
        }
  
        let data = state.context.data;
        let shorthand = state.context.shorthand;
  
        if (!this.isEmpty(data)) {
          if (!!shorthand.after || !!shorthand.before) {
            shorthand = shorthand.before;
          }
          state.context.data = reduce(reverse(shorthand), data, state.context, false);
        }
  
        return state;
      },
  
      /**
       * Applies the shorthand mapping after the state change.
       * @param state - The current state object.
       * @returns The updated state with transformed entry.
       */
      function (state: State): State {
        that = this;
        if (this.isEmpty(state.context.shorthand)) {
          return state;
        }
  
        let data = state.context.entry;
        let shorthand = state.context.shorthand;
  
        if (!this.isEmpty(data)) {
          if (!!shorthand.after || !!shorthand.before) {
            shorthand = shorthand.after;
          }
          state.context.entry = reduce(shorthand, data, state.context, false);
        }
  
        return state;
      }
    ];
  })(self);
  
  export { dashShorthand };
  export default dashShorthand;
  