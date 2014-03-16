window.dashStats = window.dashStats || (function (environment) {
  "use strict";
  var model = function () {
      return {
        requests: {
          add: 0,
          clears: 0,
          count: 0,
          get: 0,
          put: 0,
          remove: 0,
          update: 0,
          attribute: 0,
          behavior: 0,
          store: 0,
          stores: 0,
          entry: 0,
          entries: 0,
          index: 0,
          indexes: 0,
          database: 0,
          databases: 0,
          total: 0,
          resolve: 0,
          notify: 0,
          error: 0
        },
        time: {
          add: 0,
          clear: 0,
          count: 0,
          get: 0,
          put: 0,
          remove: 0,
          update: 0,
          attribute: 0,
          behavior: 0,
          store: 0,
          stores: 0,
          entry: 0,
          entries: 0,
          index: 0,
          indexes: 0,
          database: 0,
          databases: 0,
          total: 0,
          resolve: 0,
          notify: 0,
          error: 0
        },
        expected: {
          add: 0,
          clear: 0,
          count: 0,
          get: 0,
          put: 0,
          remove: 0,
          update: 0,
          attribute: 0,
          behavior: 0,
          store: 0,
          stores: 0,
          entry: 0,
          entries: 0,
          index: 0,
          indexes: 0,
          database: 0,
          databases: 0,
          total: 0,
          resolve: 0,
          notify: 0,
          error: 0
        },
        remaining: {},
        milliseconds: {
          total: NaN,
          start: NaN,
          elapsed: NaN,
          remaining: NaN
        },
        display: {
          elapsed: '',
          remaining: ''
        },
        metrics: {
          add: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          clear: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          count: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          get: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          put: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          remove: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          update: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          resolve: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          notify: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          error: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          total: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          store: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          stores: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          entry: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          entries: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          database: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          databases: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          index: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          indexes: {
            average: NaN,
            rate: NaN,
            recent: []
          }
        },
        type: null,
        recents: 5,
        dom: {
          node: null
        }
      };
    },
    total = model();
  return function (state) {
    var context = state.context,
      pieces = state.type.split('.'),
      verb = pieces[0],
      noun = pieces[1],
      deferred,
      promise = state.promise,
      theirs = this,
      average = function(stack) {
        var x = 0, xlen = stack.length, xitem, total = 0;
        for ( x = 0; x < xlen; x += 1 ) {
          total += stack[ x ];
        }
        return total/x;
      },
      calculate = function(v, n) {
        state.context.statistics.request.remaining[v] = state.context.statistics.request.expected[v] - state.context.statistics.request.requests[v];
        state.context.statistics.total.remaining[v] = state.context.statistics.total.expected[v] - state.context.statistics.total.requests[v];
        state.context.statistics.request.remaining[n] = state.context.statistics.request.expected[n] - state.context.statistics.request.requests[n];
        state.context.statistics.total.remaining[n] = state.context.statistics.total.expected[n] - state.context.statistics.total.requests[n];
        state.context.statistics.request.remaining.total = state.context.statistics.request.expected.total - state.context.statistics.request.requests.total;
        state.context.statistics.total.remaining.total = state.context.statistics.total.expected.total - state.context.statistics.total.requests.total;
        state.context.statistics.request.metrics[v].rate = average(state.context.statistics.request.metrics[v].recent); 
        state.context.statistics.request.metrics[n].rate = average(state.context.statistics.request.metrics[n].recent); 
        state.context.statistics.request.metrics.total.rate = average(state.context.statistics.request.metrics.total.recent); 
        console.log(state.context.statistics.request.metrics[v].rate, state.context.statistics.request.metrics[n].rate, state.context.statistics.request.metrics.total.rate);
      };
    state.context.statistics = state.context.statistics || {
      total: total,
      request: model()
    };
    if (!this.contains(['resolve', 'notify', 'error'], state.type)) {
      state.context.statistics.request.milliseconds.started = new Date().getTime();
      state.context.statistics.request.type = state.type;
      if ('count.entries' !== state.type && null !== state.type.match(/\.entries$/)) {
        deferred = this.deferred();
        theirs.api.count.entries({
          database: state.context.database,
          index: state.context.index,
          index_key: state.context.index_key,
          index_key_path: state.context.index_key_path,
          limit: state.context.limit,
          store: state.context.store,
          store_key_path: state.context.store_key_path,
        })(function (ctx) {
          if (theirs.exists(state.context.limit) && state.context.limit < ctx.total) {
            state.context.statistics.request.expected[verb] += state.context.limit;
            state.context.statistics.request.expected[noun] += state.context.limit;
            state.context.statistics.total.expected[verb] += state.context.limit;
            state.context.statistics.total.expected[noun] += state.context.limit;
            state.context.statistics.request.expected.total += state.context.limit;
            state.context.statistics.total.expected.total += state.context.limit;
          } else {
            state.context.statistics.request.expected[verb] += ctx.total;
            state.context.statistics.request.expected[noun] += ctx.total;
            state.context.statistics.total.expected[verb] += ctx.total;
            state.context.statistics.total.expected[noun] += ctx.total;
            state.context.statistics.request.expected.total += ctx.total;
            state.context.statistics.total.expected.total += ctx.total;
          }
          state.context.statistics.request.expected[verb] += 1;
          state.context.statistics.request.expected[noun] += 1;
          state.context.statistics.total.expected[verb] += 1;
          state.context.statistics.total.expected[noun] += 1;
          state.context.statistics.request.expected.total += 1;
          state.context.statistics.total.expected.total += 1;
          calculate(verb, noun);
          deferred.resolve(state);
        });
        state.context.statistics.request.remaining[verb] = state.context.statistics.request.expected[verb];
        state.context.statistics.total.remaining[verb] = state.context.statistics.total.expected[verb];
        state.context.statistics.request.remaining[noun] = state.context.statistics.request.expected[noun];
        state.context.statistics.total.remaining[noun] = state.context.statistics.total.expected[noun];
        state.context.statistics.request.remaining.total = state.context.statistics.request.expected.total;
        state.context.statistics.total.remaining.total = state.context.statistics.total.expected.total;
        state.promise = deferred.promise;
      } else {
        state.context.statistics.request.expected[verb] += 1;
        state.context.statistics.request.expected[noun] += 1;
        state.context.statistics.total.expected[verb] += 1;
        state.context.statistics.total.expected[noun] += 1;
        state.context.statistics.request.expected.total += 1;
        state.context.statistics.total.expected.total += 1;
        calculate(verb, noun);
      }
    } else {
      pieces = state.context.statistics.request.type.split('.');
      verb = pieces[0];
      noun = pieces[1];
      state.context.statistics.request.milliseconds.elapsed = new Date().getTime() - (state.context.statistics.request.milliseconds.last || new Date().getTime());
      state.context.statistics.request.milliseconds.last = new Date().getTime();
      state.context.statistics.total.time[noun] += state.context.statistics.request.milliseconds.elapsed;
      state.context.statistics.total.time[verb] += state.context.statistics.request.milliseconds.elapsed;
      state.context.statistics.total.time.total += state.context.statistics.request.milliseconds.elapsed;
      state.context.statistics.request.metrics[verb].recent.unshift(state.context.statistics.request.milliseconds.elapsed);
      state.context.statistics.total.metrics[verb].recent.unshift(state.context.statistics.total.milliseconds.elapsed);
      if (state.context.statistics.request.metrics[verb].recent.length > state.context.statistics.request.recents) {
        state.context.statistics.request.metrics[verb].recent = state.context.statistics.request.metrics[verb].recent.slice(0, state.context.statistics.request.recents);
      }
      if (state.context.statistics.total.metrics[verb].recent.length > state.context.statistics.total.recents) {
        state.context.statistics.total.metrics[verb].recent = state.context.statistics.total.metrics[verb].recent.slice(0, state.context.statistics.total.recents);
      }
      if (state.context.statistics.total.metrics.total.recent.length > state.context.statistics.total.recents) {
        state.context.statistics.total.metrics.total.recent = state.context.statistics.total.metrics.total.recent.slice(0, state.context.statistics.total.recents);
      }
      state.context.statistics.request.requests[verb] += 1;
      state.context.statistics.total.requests[verb] += 1;
      state.context.statistics.request.requests[noun] += 1;
      state.context.statistics.total.requests[noun] += 1;
      state.context.statistics.request.requests.total += 1;
      state.context.statistics.total.requests.total += 1;
      calculate(verb, noun);
    }
    return state;
  };
}(self));