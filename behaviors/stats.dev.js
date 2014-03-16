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
        actual: {},
        prettyActual: {},
        prettyElapsed: {},
        remaining: {},
        prettyRemaining: {},
        duration: {},
        prettyDuration: {},
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
        
        state.context.statistics.request.remaining[v] = state.context.statistics.request.expected[v] - state.context.statistics.request.requests[v];
        state.context.statistics.total.remaining[v] = state.context.statistics.total.expected[v] - state.context.statistics.total.requests[v];
        
        state.context.statistics.request.remaining[n] = state.context.statistics.request.expected[n] - state.context.statistics.request.requests[n];
        state.context.statistics.total.remaining[n] = state.context.statistics.total.expected[n] - state.context.statistics.total.requests[n];
        
        state.context.statistics.request.remaining.total = state.context.statistics.request.expected.total - state.context.statistics.request.requests.total;
        state.context.statistics.total.remaining.total = state.context.statistics.total.expected.total - state.context.statistics.total.requests.total;
        
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

        state.context.statistics.total.duration[v] = state.context.statistics.total.metrics[v].average * state.context.statistics.total.expected[v]; 
        state.context.statistics.total.duration[n] = state.context.statistics.total.metrics[n].average * state.context.statistics.total.expected[n];
        state.context.statistics.total.duration.total = state.context.statistics.total.metrics.total.average * state.context.statistics.total.expected.total;
        
        state.context.statistics.total.remaining[v] = (state.context.statistics.total.duration[v] - state.context.statistics.total.elapsed[v]) * state.context.statistics.total.metrics[v].rate;
        state.context.statistics.total.remaining[n] = (state.context.statistics.total.duration[n] - state.context.statistics.total.elapsed[n]) * state.context.statistics.total.metrics[n].rate;
        state.context.statistics.total.remaining.total = (state.context.statistics.total.duration.total - state.context.statistics.total.elapsed.total) * state.context.statistics.total.metrics.total.rate;

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

        state.context.statistics.request.prettyActual[v] = prettyTime(state.context.statistics.request.actual[v]);
        state.context.statistics.request.prettyActual[n] = prettyTime(state.context.statistics.request.actual[n]);
        state.context.statistics.request.prettyActual.total = prettyTime(state.context.statistics.request.actual.total);
               
        state.context.statistics.total.prettyActual[v] = prettyTime(state.context.statistics.total.actual[v]);
        state.context.statistics.total.prettyActual[n] = prettyTime(state.context.statistics.total.actual[n]);
        state.context.statistics.total.prettyActual.total = prettyTime(state.context.statistics.total.actual.total);
       
        //console.log('request time (total)',state.context.statistics.total.elapsed.total,state.context.statistics.total.prettyElapsed.total);
        //console.log('request time (request)',state.context.statistics.request.prettyElapsed.total);
        //console.log('actual time (total)',state.context.statistics.total.actual.total,state.context.statistics.total.prettyActual.total);
        //console.log('actual time (request)',state.context.statistics.request.prettyActual.total);
        //console.log('remaining time (total)',state.context.statistics.total.remaining.total,state.context.statistics.total.prettyRemaining.total);
        //console.log('remaining time (request)',state.context.statistics.request.prettyRemaining.total);
        console.log('stats',state.context.statistics.request.prettyElapsed.total, state.context.statistics.total.prettyRemaining.total);

        //console.log('duration',state.context.statistics.total.prettyDuration, state.context.statistics.total.prettyRemaining);
      };
    state.context.statistics = state.context.statistics || {
      total: total,
      request: model()
    };
    if (!this.contains(['resolve', 'notify', 'error'], state.type)) {
      state.context.statistics.request.milliseconds.started = new Date().getTime();
      state.context.statistics.total.milliseconds.started = state.context.statistics.total.milliseconds.started || new Date().getTime();
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
      datetime = new Date().getTime();
      state.context.statistics.total.milliseconds.started = state.context.statistics.total.milliseconds.started || datetime;
      state.context.statistics.request.milliseconds.started = state.context.statistics.request.milliseconds.started || datetime;
      state.context.statistics.request.milliseconds.last = state.context.statistics.request.milliseconds.last || state.context.statistics.request.milliseconds.started || datetime;

      state.context.statistics.total.milliseconds.elapsed = datetime - state.context.statistics.total.milliseconds.started;
      state.context.statistics.total.actual[noun] = state.context.statistics.total.milliseconds.elapsed;
      state.context.statistics.total.actual[verb] = state.context.statistics.total.milliseconds.elapsed;
      state.context.statistics.total.actual.total = state.context.statistics.total.milliseconds.elapsed;

      state.context.statistics.request.milliseconds.elapsed = datetime - state.context.statistics.request.milliseconds.started;
      state.context.statistics.request.actual[noun] = state.context.statistics.request.milliseconds.elapsed;
      state.context.statistics.request.actual[verb] = state.context.statistics.request.milliseconds.elapsed;
      state.context.statistics.request.actual.total = state.context.statistics.request.milliseconds.elapsed;

      diff = datetime - state.context.statistics.request.milliseconds.last;
      state.context.statistics.request.elapsed[noun] += diff;
      state.context.statistics.request.elapsed[verb] += diff;
      state.context.statistics.request.elapsed.total += diff;

      state.context.statistics.total.elapsed[noun] += diff;
      state.context.statistics.total.elapsed[verb] += diff;
      state.context.statistics.total.elapsed.total += diff;

      state.context.statistics.request.metrics[verb].recent.unshift(state.context.statistics.request.milliseconds.elapsed);
      state.context.statistics.total.metrics[verb].recent.unshift(state.context.statistics.request.milliseconds.elapsed);
      state.context.statistics.request.metrics[noun].recent.unshift(state.context.statistics.request.milliseconds.elapsed);
      state.context.statistics.total.metrics[noun].recent.unshift(state.context.statistics.request.milliseconds.elapsed);
      state.context.statistics.request.metrics.total.recent.unshift(state.context.statistics.request.milliseconds.elapsed);
      state.context.statistics.total.metrics.total.recent.unshift(state.context.statistics.request.milliseconds.elapsed);

      if (state.context.statistics.request.metrics[verb].recent.length > state.context.statistics.request.recents) {
        state.context.statistics.request.metrics[verb].recent = state.context.statistics.request.metrics[verb].recent.slice(0, state.context.statistics.request.recents);
      }
      if (state.context.statistics.total.metrics[noun].recent.length > state.context.statistics.total.recents) {
        state.context.statistics.total.metrics[noun].recent = state.context.statistics.total.metrics[noun].recent.slice(0, state.context.statistics.total.recents);
      }
      if (state.context.statistics.request.metrics[noun].recent.length > state.context.statistics.request.recents) {
        state.context.statistics.request.metrics[noun].recent = state.context.statistics.request.metrics[noun].recent.slice(0, state.context.statistics.request.recents);
      }
      if (state.context.statistics.total.metrics[noun].recent.length > state.context.statistics.total.recents) {
        state.context.statistics.total.metrics[noun].recent = state.context.statistics.total.metrics[noun].recent.slice(0, state.context.statistics.total.recents);
      }
      if (state.context.statistics.request.metrics.total.recent.length > state.context.statistics.request.recents) {
        state.context.statistics.request.metrics.total.recent = state.context.statistics.request.metrics.total.recent.slice(0, state.context.statistics.total.recents);
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
      state.context.statistics.request.milliseconds.last = datetime;
    }
    return state;
  };
}(self));