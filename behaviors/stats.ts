/**
 * @summary
 * `dashStats` is responsible for tracking various statistics and metrics related to operations (like add, get, update, etc.) and calculating averages, rates, and elapsed time.
 * 
 * It supports:
 * 1. **Time Tracking**: Tracks elapsed, remaining, and total time for operations.
 * 2. **Thoroughput Calculation**: Calculates rate and average speed for operations.
 * 3. **Forecasting**: Estimates remaining time and expected completion for operations based on current rates.
 */

interface Metrics {
    average: number;
    rate: number;
    recent: number[];
    expecting: number;
    remaining: number;
    duration: number;
    requests: number;
    elapsed: number;
    expected: number;
  }
  
  interface DisplayMetrics {
    actual: any;
    thoroughput_rate: any;
    thoroughput_average: any;
    speed_rate: any;
    speed_average: any;
    elapsed: any;
    remaining: any;
    duration: any;
  }
  
  interface State {
    context: {
      stats?: boolean;
      shorthand?: any;
      data?: any;
      entry?: any;
      statistics?: any;
      forecast?: boolean;
      progress?: boolean;
      limit?: number;
      total?: number;
      database?: any;
      index?: any;
      store?: any;
      store_key_path?: any;
      index_key_path?: any;
      index_key?: any;
    };
    method?: string;
    type?: string;
    promise: (onResolve: Function, onReject?: Function, onNotify?: Function) => void;
  }
  
  const dashStats = (function (environment: any) {
    "use strict";
  
    /**
     * @returns A new metrics model initialized with default values.
     */
    const model = function () {
      return {
        display: {
          actual: {},
          thoroughput_rate: {},
          thoroughput_average: {},
          speed_rate: {},
          speed_average: {},
          elapsed: {},
          remaining: {},
          duration: {}
        },
        metrics: {
          add: initializeMetrics(),
          clear: initializeMetrics(),
          count: initializeMetrics(),
          get: initializeMetrics(),
          put: initializeMetrics(),
          remove: initializeMetrics(),
          update: initializeMetrics(),
          resolve: initializeMetrics(),
          notify: initializeMetrics(),
          error: initializeMetrics(),
          total: initializeMetrics(),
          store: initializeMetrics(),
          stores: initializeMetrics(),
          entry: initializeMetrics(),
          entries: initializeMetrics(),
          database: initializeMetrics(),
          databases: initializeMetrics(),
          index: initializeMetrics(),
          indexes: initializeMetrics()
        },
        type: null,
        memory: 3
      };
    };
  
    /**
     * Initializes a new metrics object with default values.
     */
    const initializeMetrics = (): Metrics => ({
      average: 0,
      rate: 0,
      recent: [],
      expecting: 0,
      remaining: 0,
      duration: 0,
      requests: 0,
      elapsed: 0,
      expected: 0
    });
  
    const allStats: { [key: string]: any } = {
      total: model()
    };
  
    /**
     * Calculates the average value from an array of numbers.
     * @param stack - Array of numbers to calculate the average.
     * @returns The average of the numbers in the array.
     */
    const average = function (stack: number[]): number {
      const total = stack.reduce((acc, val) => acc + val, 0);
      return total / stack.length;
    };
  
    /**
     * Converts milliseconds to a human-readable time format.
     * @param milliseconds - The time in milliseconds to format.
     * @returns A formatted time string.
     */
    const prettyTime = function (milliseconds: number): string | undefined {
      milliseconds = Math.floor(milliseconds);
      const seconds = Math.floor(milliseconds / 1000);
      const days = Math.floor(seconds / 86400);
      let hours = Math.floor(seconds / 3600);
      let minutes = Math.floor(seconds / 60);
      let secs = Math.floor(seconds - days * 86400 - hours * 3600 - minutes * 60);
      let msecs = Math.floor(milliseconds - secs * 1000);
  
      if (isNaN(hours) || isNaN(minutes) || isNaN(secs)) {
        return;
      }
  
      hours = hours < 10 && hours > 0 ? '0' + hours + ':' : hours < 1 ? '' : hours + ':';
      minutes = minutes < 10 ? '0' + minutes : minutes.toString();
      secs = secs < 10 ? '0' + secs : secs.toString();
      msecs = msecs < 10 ? '00' + msecs : msecs < 100 ? '0' + msecs : msecs.toString();
  
      return hours + minutes + ':' + secs + '.' + msecs;
    };
  
    /**
     * Main state function for calculating and updating statistics.
     * @param state - The state object containing context and metrics information.
     * @returns Updated state with calculated statistics.
     */
    return function (state: State): State {
      if (this.isnt(state.context.stats, true)) {
        return state;
      }
  
      const context = state.context;
      const pieces = !!state.method ? state.method.split('.') : [];
      let verb = pieces[0];
      let noun = pieces[1];
      let deferred: any;
      let datetime: number;
      let diff: number;
      const promise = state.promise;
      const theirs = this;
  
      /**
       * Handles the calculation of metrics and updates various statistics.
       * @param v - Verb of the operation (e.g., get, put).
       * @param n - Noun of the operation (e.g., entry, database).
       */
      const calculate = function (v: string, n: string) {
        datetime = new Date().getTime();
  
        allStats['total'] = allStats['total'];
        allStats[context.statistics.id] = allStats[context.statistics.id];
        allStats['total'].started = allStats['total'].started || datetime;
        allStats[context.statistics.id].started = allStats[context.statistics.id].started || datetime;
        allStats[context.statistics.id].last = allStats[context.statistics.id].last || allStats[context.statistics.id].started || datetime;
  
        // Calculate elapsed time for total and specific statistics
        allStats['total'].elapsed = datetime - allStats['total'].started;
        allStats[context.statistics.id].elapsed = datetime - allStats[context.statistics.id].started;
  
        // Update metrics with new elapsed time
        updateElapsedMetrics(v, n, datetime);
  
        diff = datetime - allStats[context.statistics.id].last;
        if (diff > 0) {
          updateBetweenAndRecent(v, n, diff);
        }
  
        // Additional calculations for rates, averages, and remaining time
        updateRatesAveragesAndRemaining(v, n);
      };
  
      /**
       * Updates elapsed time in the metrics for both the current operation and the total statistics.
       * @param v - Verb of the operation.
       * @param n - Noun of the operation.
       * @param datetime - The current timestamp.
       */
      const updateElapsedMetrics = function (v: string, n: string, datetime: number) {
        const statId = context.statistics.id;
        allStats[statId].metrics[v].elapsed = allStats[statId].elapsed;
        allStats[statId].metrics[n].elapsed = allStats[statId].elapsed;
        allStats[statId].metrics.total.elapsed = allStats[statId].elapsed;
        allStats['total'].metrics[v].elapsed = allStats[statId].elapsed;
        allStats['total'].metrics[n].elapsed = allStats[statId].elapsed;
        allStats['total'].metrics.total.elapsed = allStats[statId].elapsed;
      };
  
      /**
       * Updates the 'between' time, recent metrics, and limits the memory of recent metrics.
       * @param v - Verb of the operation.
       * @param n - Noun of the operation.
       * @param diff - Time difference between the current and last recorded time.
       */
      const updateBetweenAndRecent = function (v: string, n: string, diff: number) {
        const statId = context.statistics.id;
        allStats[statId].metrics[v].between = diff;
        allStats[statId].metrics[n].between = diff;
        allStats[statId].metrics.total.between = diff;
  
        allStats['total'].metrics[v].between = diff;
        allStats['total'].metrics[n].between = diff;
        allStats['total'].metrics.total.between = diff;
  
        // Update recent metrics with memory limits
        limitRecentMetrics(v, n, statId, diff);
      };
  
      /**
       * Limits the memory of recent metrics to avoid excessive storage.
       * @param v - Verb of the operation.
       * @param n - Noun of the operation.
       * @param statId - ID of the current statistics.
       * @param diff - Time difference to add to the recent metrics.
       */
      const limitRecentMetrics = function (v: string, n: string, statId: string, diff: number) {
        allStats[statId].metrics[v].recent.unshift(diff);
        allStats[statId].metrics[n].recent.unshift(diff);
        allStats[statId].metrics.total.recent.unshift(diff);
  
        allStats['total'].metrics[v].recent.unshift(diff);
        allStats['total'].metrics[n].recent.unshift(diff);
        allStats['total'].metrics.total.recent.unshift(diff);
  
        // Slice the recent metrics to limit memory
        allStats[statId].metrics[v].recent = allStats[statId].metrics[v].recent.slice(0, allStats[statId].memory);
        allStats[statId].metrics[n].recent = allStats[statId].metrics[n].recent.slice(0, allStats[statId].memory);
        allStats[statId].metrics.total.recent = allStats[statId].metrics.total.recent.slice(0, allStats[statId].memory);
  
        allStats['total'].metrics[v].recent = allStats['total'].metrics[v].recent.slice(0, allStats['total'].memory);
        allStats['total'].metrics[n].recent = allStats['total'].metrics[n].recent.slice(0, allStats['total'].memory);
        allStats['total'].metrics.total.recent = allStats['total'].metrics.total.recent.slice(0, allStats['total'].memory);
      };
  
      /**
       * Updates rates, averages, and remaining time calculations for the metrics.
       * @param v - Verb of the operation.
       * @param n - Noun of the operation.
       */
      const updateRatesAveragesAndRemaining = function (v: string, n: string) {
        const statId = context.statistics.id;
        allStats[statId].metrics[v].rate = average(allStats[statId].metrics[v].recent);
        allStats[statId].metrics[n].rate = average(allStats[statId].metrics[n].recent);
        allStats[statId].metrics.total.rate = average(allStats[statId].metrics.total.recent);
  
        allStats['total'].metrics[v].rate = average(allStats['total'].metrics[v].recent);
        allStats['total'].metrics[n].rate = average(allStats['total'].metrics[n].recent);
        allStats['total'].metrics.total.rate = average(allStats['total'].metrics.total.recent);
  
        allStats[statId].metrics[v].average = allStats[statId].metrics[v].elapsed / allStats[statId].metrics[v].requests;
        allStats[statId].metrics[n].average = allStats[statId].metrics[n].elapsed / allStats[statId].metrics[n].requests;
        allStats[statId].metrics.total.average = allStats[statId].metrics.total.elapsed / allStats[statId].metrics.total.requests;
  
        allStats['total'].metrics[v].average = allStats['total'].metrics[v].elapsed / allStats['total'].metrics[v].requests;
        allStats['total'].metrics[n].average = allStats['total'].metrics[n].elapsed / allStats['total'].metrics[n].requests;
        allStats['total'].metrics.total.average = allStats['total'].metrics.total.elapsed / allStats['total'].metrics.total.requests;
  
        if (theirs.is(state.context.forecast, true)) {
          allStats[statId].metrics[v].expecting = allStats[statId].metrics[v].expected - allStats[statId].metrics[v].requests;
          allStats[statId].metrics[n].expecting = allStats[statId].metrics[n].expected - allStats[statId].metrics[n].requests;
          allStats[statId].metrics.total.expecting = allStats[statId].metrics.total.expected - allStats[statId].metrics.total.requests;
        }
      };
  
      // Initialize and update statistics as needed
      if (!theirs.exists(state.context.statistics)) {
        const id = theirs.random();
        allStats[id] = model();
        state.context.statistics = {
          total: allStats['total'],
          request: allStats[id],
          id: id
        };
      }
  
      // If not a final state (resolve/notify/error), initialize metrics for the current method
      if (!this.contains(['resolve', 'notify', 'error'], state.type)) {
        allStats[state.context.statistics.id] = model();
        allStats[state.context.statistics.id].started = new Date().getTime();
        allStats['total'].started = allStats['total'].started || new Date().getTime();
        allStats[state.context.statistics.id].type = state.method;
  
        if (verb && noun) {
          calculate(verb, noun);
        }
      } else {
        // Final state reached (resolve, notify, error), clean up statistics
        pieces = allStats[state.context.statistics.id].type.split('.');
        verb = pieces[0];
        noun = pieces[1];
  
        allStats[state.context.statistics.id].metrics[verb].requests += 1;
        allStats['total'].metrics[verb].requests += 1;
        allStats[state.context.statistics.id].metrics[noun].requests += 1;
        allStats['total'].metrics[noun].requests += 1;
  
        if (this.contains(['resolve', 'error'], state.type)) {
          delete allStats[state.context.statistics.id];
        }
      }
  
      return state;
    };
  })(self);
  
  export { dashStats };
  export default dashStats;
  