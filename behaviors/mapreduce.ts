/**
 * @summary
 * `dashMapReduce` performs a map-reduce operation by applying a series of mapping functions followed by a reduction function on the provided data.
 * 
 * The main features include:
 * 1. **Mapping Initialization**: Registers map and reduce functions for processing entries.
 * 2. **Processing Entries**: Applies the map functions to entries and reduces the intermediate results.
 * 3. **Promise Handling**: Supports asynchronous operations in the mapping and reduction phases.
 */
type State = {
    context: {
      map?: Function | Function[];
      reduce?: Function | Function[];
      mapReduceId?: string;
      entry?: any;
      mapped?: any[];
      promise?: Function;
      [key: string]: any;
    };
    type?: string;
    promise?: Function;
  };
  
  type MapReduceData = {
    intermediate: any;
    mappers: Function[];
    reducers: Function[];
  };
  
  const dashMapReduce = (function (environment: any) {
    "use strict";
    let mapReduceMap: { [key: string]: MapReduceData } = {};
  
    return [
      function (this: any, state: State): State {
        if (this.isEmpty(state.context.map) || this.isEmpty(state.context.reduce)) {
          return state;
        }
        const mapReduceId = this.random() as string;
        state.context.mapReduceId = mapReduceId;
  
        mapReduceMap[mapReduceId] = {
          intermediate: null,
          mappers: this.isArray(state.context.map) ? state.context.map as Function[] : [state.context.map as Function],
          reducers: this.isArray(state.context.reduce) ? state.context.reduce as Function[] : [state.context.reduce as Function]
        };
  
        delete state.context.mapReduce;
        return state;
      },
      function (this: any, state: State): State {
        const mapReduceId = state.context.mapReduceId;
        if (this.isEmpty(mapReduceId)) {
          return state;
        }
  
        let deferred = this.deferred();
        let result = state.context.entry;
        let promise = state.promise;
        let results: any[] = [];
        let maps: any[] = [];
        let promises: Function[] = [];
        let that = this;
  
        if (this.is(state.type, 'notify') && this.exists(state.context.entry)) {
          const currentMapReduce = mapReduceId ? mapReduceMap[mapReduceId] : undefined;
          if (currentMapReduce) {
            this.each(currentMapReduce.mappers, function (mapper: Function) {
              result = that.apply(mapper, [result]);
              if (that.isFunction(result)) {
                promises.push(result);
              } else {
                maps.push(result);
              }
            });
            this.each(currentMapReduce.reducers, function (reducer: Function) {
              result = that.apply(reducer, [currentMapReduce.intermediate, result]);
              if (that.isFunction(result)) {
                promises.push(result);
              } else {
                currentMapReduce.intermediate = result;
              }
            });
          }
  
          if (this.isEmpty(promises)) {
            state.context.mapped = maps;
          } else {
            this.each(promises, function (pro: Function) {
              if (promise) {
                promise(function (result: any) {
                  results.push(result);
                });
                promise = pro;
              }
            });
            state.context.promise = promise && promise(function (ctx: any) {
              state.context = ctx;
              if (mapReduceId) {
                delete mapReduceMap[mapReduceId];
              }
              delete state.context.mapReduceId;
              deferred.resolve(state);
            });
          }
        } else if (this.is(state.type, 'resolve') && mapReduceId) {
          state.context.reduced = mapReduceMap[mapReduceId]?.intermediate;
        }
  
        delete state.context.mapReduceId;
        return state;
      }
    ];
  })(self);
  
  export default dashMapReduce;