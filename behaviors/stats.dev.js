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
        elapsed: {
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
        between: {
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
        actual: {},
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
        prettyActual: {},
        prettyElapsed: {},
        expecting: {},
        remaining: {},
        prettyRemaining: {},
        duration: {},
        prettyDuration: {},
        milliseconds: {},
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
        memory: 5
      };
    },
    total = model();
  return function (state) {
    var context = state.context,
      pieces = state.type.split('.'),
      verb = pieces[0],
      noun = pieces[1],
      deferred,
      datetime,
      diff,
      promise = state.promise,
      theirs = this,
      average = function(stack) {
        var x = 0, xlen = stack.length, xitem, total = 0;
        for ( x = 0; x < xlen; x += 1 ) {
          total += stack[ x ];
        }
        return total/x;
      },
      prettyTime = function(milliseconds) {
        var seconds = Math.floor(milliseconds/1000),
            hours = Math.floor((seconds - ( seconds % 86400 )) / 86400),
            minutes = Math.floor((seconds - ( seconds % 3600 )) / 3600),
            secs = Math.floor(seconds % 60 ),
            msecs = Math.floor(milliseconds - (seconds * 1000));
        if ( true === isNaN( hours ) && true === isNaN( minutes ) && true === isNaN( secs ) ) {
          return;
        }
        if ( hours < 10 && hours > 0 ) {
          hours = '0' + hours.toString() + ':';
        } else if ( hours < 1 ) {
          hours = '' ; 
        } else {
          hours  = hours.toString() + ':';
        }
        if ( minutes < 10 ) {
          minutes = '0' + minutes.toString();
        } else {
          minutes = minutes.toString();
        }
        if ( secs < 10 ) {
          secs = '0' + secs.toString();
        } else {
          secs = secs.toString();
        }
        if ( msecs < 10 ) {
          msecs = '00' + msecs.toString();
        } else if ( msecs < 100 ) {
          msecs = '0' + msecs.toString();
        } else {
          msecs = msecs.toString();
        }
        return hours + minutes + ':' + secs + '.' + msecs;
      },
      calculate = function(v, n) {
        
        /* Time */
        
        datetime = new Date().getTime();
        state.context.statistics.total.milliseconds.started = state.context.statistics.total.milliseconds.started || datetime;
        state.context.statistics.request.milliseconds.started = state.context.statistics.request.milliseconds.started || datetime;
        state.context.statistics.request.milliseconds.last = state.context.statistics.request.milliseconds.last || state.context.statistics.request.milliseconds.started || datetime;

        state.context.statistics.total.milliseconds.elapsed = datetime - state.context.statistics.total.milliseconds.started;
        state.context.statistics.total.actual.total = state.context.statistics.total.milliseconds.elapsed;

        state.context.statistics.request.milliseconds.elapsed = datetime - state.context.statistics.request.milliseconds.started;
        state.context.statistics.request.actual.total = state.context.statistics.request.milliseconds.elapsed;

        state.context.statistics.request.elapsed[n] = state.context.statistics.request.milliseconds.elapsed;
        state.context.statistics.request.elapsed[v] = state.context.statistics.request.milliseconds.elapsed;
        state.context.statistics.request.elapsed.total = state.context.statistics.request.milliseconds.elapsed;

        state.context.statistics.total.elapsed[n] = state.context.statistics.request.milliseconds.elapsed;
        state.context.statistics.total.elapsed[v] = state.context.statistics.request.milliseconds.elapsed;
        state.context.statistics.total.elapsed.total = state.context.statistics.request.milliseconds.elapsed;

        diff = datetime - state.context.statistics.request.milliseconds.last;
        state.context.statistics.request.between[n] = diff;
        state.context.statistics.request.between[v] = diff;
        state.context.statistics.request.between.total = diff;

        state.context.statistics.total.between[n] = diff;
        state.context.statistics.total.between[v] = diff;
        state.context.statistics.total.between.total = diff;


        state.context.statistics.request.metrics[v].recent.unshift(state.context.statistics.request.milliseconds.elapsed);
        state.context.statistics.total.metrics[v].recent.unshift(state.context.statistics.request.milliseconds.elapsed);
        
        state.context.statistics.request.metrics[n].recent.unshift(state.context.statistics.request.milliseconds.elapsed);
        state.context.statistics.total.metrics[n].recent.unshift(state.context.statistics.request.milliseconds.elapsed);
        
        state.context.statistics.request.metrics.total.recent.unshift(state.context.statistics.request.milliseconds.elapsed);
        state.context.statistics.total.metrics.total.recent.unshift(state.context.statistics.request.milliseconds.elapsed);

        if (state.context.statistics.request.metrics[v].recent.length > state.context.statistics.request.memory) {
          state.context.statistics.request.metrics[v].recent = state.context.statistics.request.metrics[v].recent.slice(0, state.context.statistics.request.memory);
        }
        if (state.context.statistics.total.metrics[n].recent.length > state.context.statistics.total.memory) {
          state.context.statistics.total.metrics[n].recent = state.context.statistics.total.metrics[n].recent.slice(0, state.context.statistics.total.memory);
        }
        if (state.context.statistics.request.metrics[n].recent.length > state.context.statistics.request.memory) {
          state.context.statistics.request.metrics[n].recent = state.context.statistics.request.metrics[n].recent.slice(0, state.context.statistics.request.memory);
        }
        if (state.context.statistics.total.metrics[n].recent.length > state.context.statistics.total.memory) {
          state.context.statistics.total.metrics[n].recent = state.context.statistics.total.metrics[n].recent.slice(0, state.context.statistics.total.memory);
        }
        if (state.context.statistics.request.metrics.total.recent.length > state.context.statistics.request.memory) {
          state.context.statistics.request.metrics.total.recent = state.context.statistics.request.metrics.total.recent.slice(0, state.context.statistics.total.memory);
        }
        if (state.context.statistics.total.metrics.total.recent.length > state.context.statistics.total.memory) {
          state.context.statistics.total.metrics.total.recent = state.context.statistics.total.metrics.total.recent.slice(0, state.context.statistics.total.memory);
        }

        /* Other */
        state.context.statistics.request.expecting[v] = state.context.statistics.request.expected[v] - state.context.statistics.request.requests[v];
        state.context.statistics.request.expecting[n] = state.context.statistics.request.expected[n] - state.context.statistics.request.requests[n];
        state.context.statistics.request.expecting.total = state.context.statistics.request.expected.total - state.context.statistics.request.requests.total;

        console.log('REQ',JSON.stringify(state.context.statistics.request.requests));

        state.context.statistics.total.expecting[v] = state.context.statistics.total.expected[v] - state.context.statistics.total.requests[v];
        state.context.statistics.total.expecting[n] = state.context.statistics.total.expected[n] - state.context.statistics.total.requests[n];
        state.context.statistics.total.expecting.total = state.context.statistics.total.expected.total - state.context.statistics.total.requests.total;
        
        state.context.statistics.request.metrics[v].rate = average(state.context.statistics.request.metrics[v].recent); 
        state.context.statistics.request.metrics[n].rate = average(state.context.statistics.request.metrics[n].recent); 
        state.context.statistics.request.metrics.total.rate = average(state.context.statistics.request.metrics.total.recent); 

        state.context.statistics.total.metrics[v].rate = average(state.context.statistics.total.metrics[v].recent); 
        state.context.statistics.total.metrics[n].rate = average(state.context.statistics.total.metrics[n].recent); 
        state.context.statistics.total.metrics.total.rate = average(state.context.statistics.total.metrics.total.recent); 

        state.context.statistics.request.metrics[v].average = state.context.statistics.request.elapsed[v] / state.context.statistics.request.requests[v]; 
        state.context.statistics.request.metrics[n].average = state.context.statistics.request.elapsed[n] / state.context.statistics.request.requests[n];
        state.context.statistics.request.metrics.total.average = state.context.statistics.request.elapsed.total / state.context.statistics.request.requests.total;

        state.context.statistics.total.metrics[v].average = state.context.statistics.total.elapsed[v]/ state.context.statistics.total.requests[v]; 
        state.context.statistics.total.metrics[n].average = state.context.statistics.total.elapsed[n] / state.context.statistics.total.requests[n];
        state.context.statistics.total.metrics.total.average = state.context.statistics.total.elapsed.total / state.context.statistics.total.requests.total;
        
        state.context.statistics.request.duration[v] = state.context.statistics.request.metrics[v].average * state.context.statistics.request.expected[v]; 
        state.context.statistics.request.duration[n] = state.context.statistics.request.metrics[n].average * state.context.statistics.request.expected[n];
        state.context.statistics.request.duration.total = state.context.statistics.request.metrics.total.average * state.context.statistics.request.expected.total;
        
        state.context.statistics.total.duration[v] = state.context.statistics.total.metrics[v].average * state.context.statistics.total.expected[v]; 
        state.context.statistics.total.duration[n] = state.context.statistics.total.metrics[n].average * state.context.statistics.total.expected[n];
        state.context.statistics.total.duration.total = state.context.statistics.total.metrics.total.average * state.context.statistics.total.expected.total;
        
        state.context.statistics.total.remaining[v] = state.context.statistics.total.expecting[v] * state.context.statistics.total.metrics[v].rate;
        state.context.statistics.total.remaining[n] = state.context.statistics.total.expecting[n] * state.context.statistics.total.metrics[n].rate;
        state.context.statistics.total.remaining.total = state.context.statistics.total.expecting.total * state.context.statistics.total.metrics.total.rate;

        state.context.statistics.request.remaining[v] = state.context.statistics.request.expecting[v] * state.context.statistics.request.metrics[v].rate
        state.context.statistics.request.remaining[n] = state.context.statistics.request.expecting[n] * state.context.statistics.request.metrics[n].rate;
        state.context.statistics.request.remaining.total = state.context.statistics.request.expecting.total * state.context.statistics.request.metrics.total.rate;
        if (0 > state.context.statistics.total.remaining[v]) {
          state.context.statistics.total.remaining[v] = 0;
        } 
        if (0 > state.context.statistics.total.remaining[n]) {
          state.context.statistics.total.remaining[n] = 0;
        } 
        if (0 > state.context.statistics.total.remaining.total) {
          state.context.statistics.total.remaining.total = 0;
        } 

        state.context.statistics.total.prettyElapsed[v] = prettyTime(state.context.statistics.total.elapsed[v]);
        state.context.statistics.total.prettyElapsed[n] = prettyTime(state.context.statistics.total.elapsed[n]);
        state.context.statistics.total.prettyElapsed.total = prettyTime(state.context.statistics.total.elapsed.total);

        state.context.statistics.request.prettyElapsed[v] = prettyTime(state.context.statistics.request.elapsed[v]);
        state.context.statistics.request.prettyElapsed[n] = prettyTime(state.context.statistics.request.elapsed[n]);
        state.context.statistics.request.prettyElapsed.total = prettyTime(state.context.statistics.request.elapsed.total);

        state.context.statistics.request.prettyDuration[v] = prettyTime(state.context.statistics.request.duration[v]);
        state.context.statistics.request.prettyDuration[n] = prettyTime(state.context.statistics.request.duration[n]);
        state.context.statistics.request.prettyDuration.total = prettyTime(state.context.statistics.request.duration.total);

        state.context.statistics.total.prettyDuration[v] = prettyTime(state.context.statistics.total.duration[v]);
        state.context.statistics.total.prettyDuration[n] = prettyTime(state.context.statistics.total.duration[n]);
        state.context.statistics.total.prettyDuration.total = prettyTime(state.context.statistics.total.duration.total);

        state.context.statistics.request.prettyRemaining[v] = prettyTime(state.context.statistics.request.remaining[v]);
        state.context.statistics.request.prettyRemaining[n] = prettyTime(state.context.statistics.request.remaining[n]);
        state.context.statistics.request.prettyRemaining.total = prettyTime(state.context.statistics.request.remaining.total);

        state.context.statistics.total.prettyRemaining[v] = prettyTime(state.context.statistics.total.remaining[v]);
        state.context.statistics.total.prettyRemaining[n] = prettyTime(state.context.statistics.total.remaining[n]);
        state.context.statistics.total.prettyRemaining.total = prettyTime(state.context.statistics.total.remaining.total);

        state.context.statistics.request.prettyActual.total = prettyTime(state.context.statistics.request.actual.total);
        state.context.statistics.total.prettyActual.total = prettyTime(state.context.statistics.total.actual.total);
       
      };
    state.context.statistics = state.context.statistics || {
      total: total,
      request: model()
    };
    if (!this.contains(['resolve', 'notify', 'error'], state.type)) {
      state.context.statistics.request = model();
      state.context.statistics.request.milliseconds.started = new Date().getTime();
      state.context.statistics.total.milliseconds.started = state.context.statistics.total.milliseconds.started || new Date().getTime();
      state.context.statistics.request.type = state.type;
      if ('count.entries' !== state.type && null !== state.type.match(/\.entries$/)) {
        deferred = this.deferred();
          theirs.api.count.entries({
            database: context.database,
            index: context.index,
            index_key: context.index_key,
            index_key_path: context.index_key_path,
            limit: context.limit,
            store: context.store,
            store_key_path: context.store_key_path,
          })(function (context) {
            state.context.total = context.total;
            if (theirs.exists(state.context.limit) && state.context.limit < context.total ) {
              state.context.statistics.request.expected[verb] = state.context.limit;
              state.context.statistics.request.expected.total = state.context.limit;
              state.context.statistics.request.expected[noun] = state.context.limit;
              state.context.statistics.total.expected[verb] += state.context.limit;
              state.context.statistics.total.expected[noun] += state.context.limit;
              state.context.statistics.total.expected.total += state.context.limit;
            } else {
              state.context.statistics.request.expected[verb] = context.total;
              state.context.statistics.request.expected[noun] = context.total;
              state.context.statistics.request.expected.total = context.total;
              state.context.statistics.total.expected[verb] += context.total;
              state.context.statistics.total.expected[noun] += context.total;
              state.context.statistics.total.expected.total += context.total;
            } 
            state.context.statistics.request.expected[verb] += 2;
            state.context.statistics.request.expected[noun] += 2;
            state.context.statistics.total.expected[verb] += 2;
            state.context.statistics.total.expected[noun] += 2;
            state.context.statistics.request.expected.total += 2;
            state.context.statistics.total.expected.total += 2;
            calculate(verb, noun);
            state.promise = promise;
            deferred.resolve(state.context);
          }, function(context) {
            deferred.error(state.context);
          }, function(context) {
            deferred.notify(state.context);
          });
        });
        state.context.statistics.request.expected[verb] += 1;
        state.context.statistics.request.expected[noun] += 1;
        state.context.statistics.total.expected[verb] += 1;
        state.context.statistics.total.expected[noun] += 1;
        state.context.statistics.request.expected.total += 1;
        state.context.statistics.total.expected.total += 1;
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
      state.context.statistics.request.requests[verb] += 1;
      state.context.statistics.total.requests[verb] += 1;
      state.context.statistics.request.requests[noun] += 1;
      state.context.statistics.total.requests[noun] += 1;
      state.context.statistics.request.requests[state.type] += 1;
      state.context.statistics.total.requests[state.type] += 1;
      if ('resolve' === state.type) {
        console.trace();
      }
      state.context.statistics.request.requests.total += 1;
      state.context.statistics.total.requests.total += 1;
      calculate(verb, noun);
      state.context.statistics.request.milliseconds.last = datetime;
    }
    return state;
  };
}(self));