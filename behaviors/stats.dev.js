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
        milliseconds: {},
        metrics: {
          add: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          clear: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          count: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          get: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          put: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          remove: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          update: {
            average: NaN,
            rate: NaN,
            recent: []
          },
          resolve: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          notify: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          error: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          total: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          store: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          stores: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          entry: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          entries: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          database: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          databases: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          index: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          },
          indexes: {
            average: NaN,
            rate: NaN,
            recent: [],
            actual: {},
            elapsed: {},
            remaining: {},
            duration: {}
          }
        },
        type: null,
        memory: 3
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
      prettyTime =  function(milliseconds) {
        var seconds = Math.floor(milliseconds/1000),
            days = Math.floor(seconds/86400),
            hours = Math.floor(seconds/3600),
            minutes = Math.floor(seconds/60),
            secs = Math.floor(seconds - (days*86400) - (hours*3600) - (minutes*60)),
            msecs = Math.floor((seconds - (days*86400) - (hours*3600) - (minutes*60) - secs)*1000);
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

        state.context.statistics.request.metrics[n].elapsed = state.context.statistics.request.milliseconds.elapsed;
        state.context.statistics.request.metrics[v].elapsed = state.context.statistics.request.milliseconds.elapsed;
        state.context.statistics.request.metrics.elapsed.total = state.context.statistics.request.milliseconds.elapsed;

        state.context.statistics.total.metrics[n].elapsed = state.context.statistics.request.milliseconds.elapsed;
        state.context.statistics.total.metrics[v].elapsed = state.context.statistics.request.milliseconds.elapsed;
        state.context.statistics.total.metrics.total.elapsed = state.context.statistics.request.milliseconds.elapsed;

        diff = datetime - state.context.statistics.request.milliseconds.last;
        state.context.statistics.request.between[n] = diff;
        state.context.statistics.request.between[v] = diff;
        state.context.statistics.request.between.total = diff;

        state.context.statistics.total.between[n] = diff;
        state.context.statistics.total.between[v] = diff;
        state.context.statistics.total.between.total = diff;


        state.context.statistics.request.metrics[v].recent.unshift(state.context.statistics.total.between[v]);
        state.context.statistics.total.metrics[v].recent.unshift(state.context.statistics.total.between[v]);
        
        state.context.statistics.request.metrics[n].recent.unshift(state.context.statistics.request.between[n]);
        state.context.statistics.total.metrics[n].recent.unshift(state.context.statistics.request.between[n]);
        
        state.context.statistics.request.metrics.total.recent.unshift(state.context.statistics.request.between.total);
        state.context.statistics.total.metrics.total.recent.unshift(state.context.statistics.request.between.total);

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
        state.context.statistics.request.metrics[v].expecting = state.context.statistics.request.metrics[v].expected - state.context.statistics.request.metrics[v].requests;
        state.context.statistics.request.metrics[n].expecting = state.context.statistics.request.metrics[n].expected - state.context.statistics.request.metrics[n].requests;
        state.context.statistics.request.metrics.total.expecting = state.context.statistics.request.metrics.total.expected - state.context.statistics.request.metrics.total.requests;

        state.context.statistics.total.metrics[v].expecting = state.context.statistics.total.metrics[v].expected - state.context.statistics.total.metrics[v].requests;
        state.context.statistics.total.metrics[n].expecting = state.context.statistics.total.metrics[n].expected - state.context.statistics.total.metrics[n].requests;
        state.context.statistics.total.metrics.total.expecting = state.context.statistics.total.metrics.total.expected - state.context.statistics.total.metrics.total.requests;
        
        state.context.statistics.request.metrics[v].rate = average(state.context.statistics.request.metrics[v].recent); 
        state.context.statistics.request.metrics[n].rate = average(state.context.statistics.request.metrics[n].recent); 
        state.context.statistics.request.metrics.total.rate = average(state.context.statistics.request.metrics.total.recent); 

        state.context.statistics.total.metrics[v].rate = average(state.context.statistics.total.metrics[v].recent); 
        state.context.statistics.total.metrics[n].rate = average(state.context.statistics.total.metrics[n].recent); 
        state.context.statistics.total.metrics.total.rate = average(state.context.statistics.total.metrics.total.recent); 

        state.context.statistics.request.metrics[v].average = state.context.statistics.request.metrics[v].elapsed / state.context.statistics.request.metrics[v].requests; 
        state.context.statistics.request.metrics[n].average = state.context.statistics.request.metrics[n].elapsed / state.context.statistics.request.metrics[n].requests;
        state.context.statistics.request.metrics.total.average = state.context.statistics.request.metrics.elapsed.total / state.context.statistics.request.metrics.total.requests;

        state.context.statistics.total.metrics[v].average = state.context.statistics.total.metrics[v].elapsed/ state.context.statistics.total.metrics[v].requests; 
        state.context.statistics.total.metrics[n].average = state.context.statistics.total.metrics[n].elapsed / state.context.statistics.total.metrics[n].requests;
        state.context.statistics.total.metrics.total.average = state.context.statistics.total.metrics.total.elapsed / state.context.statistics.total.metrics.total.requests;
        
        state.context.statistics.request.metrics[v].duration = state.context.statistics.request.metrics[v].average * state.context.statistics.request.metrics[v].expected; 
        state.context.statistics.request.metrics[n].duration = state.context.statistics.request.metrics[n].average * state.context.statistics.request.metrics[n].expected;
        state.context.statistics.request.metrics.total.duration = state.context.statistics.request.metrics.total.average * state.context.statistics.request.metrics.total.expected;
        
        state.context.statistics.total.metrics[v].duration = state.context.statistics.total.metrics[v].average * state.context.statistics.total.metrics[v].expected; 
        state.context.statistics.total.metrics[n].duration = state.context.statistics.total.metrics[n].average * state.context.statistics.total.metrics[n].expected;
        state.context.statistics.total.metrics.total.duration = state.context.statistics.total.metrics.total.average * state.context.statistics.total.metrics.total.expected;
        
        state.context.statistics.total.metrics[v].remaining = state.context.statistics.total.metrics[v].expecting * state.context.statistics.total.metrics[v].rate;
        state.context.statistics.total.metrics[n].remaining = state.context.statistics.total.metrics[n].expecting * state.context.statistics.total.metrics[n].rate;
        state.context.statistics.total.metrics.total.remaining = state.context.statistics.total.metrics.total.expecting * state.context.statistics.total.metrics.total.rate;

        state.context.statistics.request.metrics[v].remaining = state.context.statistics.request.metrics[v].expecting * state.context.statistics.request.metrics[v].rate
        state.context.statistics.request.metrics[n].remaining = state.context.statistics.request.metrics[n].expecting * state.context.statistics.request.metrics[n].rate;
        state.context.statistics.request.metrics.total.remaining = state.context.statistics.request.metrics.total.expecting * state.context.statistics.request.metrics.total.rate;
        if (0 > state.context.statistics.total.metrics[v].remaining) {
          state.context.statistics.total.metrics[v].remaining = 0;
        } 
        if (0 > state.context.statistics.total.metrics[n].remaining) {
          state.context.statistics.total.metrics[n].remaining = 0;
        } 
        if (0 > state.context.statistics.total.metrics.total.remaining) {
          state.context.statistics.total.metrics.total.remaining = 0;
        } 

        state.context.statistics.total.display.elapsed[v] = prettyTime(state.context.statistics.total.metrics[v].elapsedh);
        state.context.statistics.total.display.elapsed[n] = prettyTime(state.context.statistics.total.metrics[n].elapsed);
        state.context.statistics.total.display.elapsed.total = prettyTime(state.context.statistics.total.metrics.total.elapsed);

        state.context.statistics.request.display.elapsed[v] = prettyTime(state.context.statistics.request.metrics[v].elapsed);
        state.context.statistics.request.display.elapsed[n] = prettyTime(state.context.statistics.request.metrics[n].elapsed);
        state.context.statistics.request.display.elapsed.total = prettyTime(state.context.statistics.request.metrics.elapsed.total);

        state.context.statistics.request.display.duration[v] = prettyTime(state.context.statistics.request.metrics[v].duration);
        state.context.statistics.request.display.duration[n] = prettyTime(state.context.statistics.request.metrics[n].duration);
        state.context.statistics.request.display.duration.total = prettyTime(state.context.statistics.request.metrics.total.duration);

        state.context.statistics.total.display.duration[v] = prettyTime(state.context.statistics.total.metrics[v].duration);
        state.context.statistics.total.display.duration[n] = prettyTime(state.context.statistics.total.metrics[n].duration);
        state.context.statistics.total.display.duration.total = prettyTime(state.context.statistics.total.metrics.total.duration);

        state.context.statistics.request.display.remaining[v] = prettyTime(state.context.statistics.request.metrics[v].remaining);
        state.context.statistics.request.display.remaining[n] = prettyTime(state.context.statistics.request.metrics[n].remaining);
        state.context.statistics.request.display.remaining.total = prettyTime(state.context.statistics.request.metrics.total.remaining);

        state.context.statistics.total.display.remaining[v] = prettyTime(state.context.statistics.total.metrics[v].remaining);
        state.context.statistics.total.display.remaining[n] = prettyTime(state.context.statistics.total.metrics[n].remaining);
        state.context.statistics.total.display.remaining.total = prettyTime(state.context.statistics.total.metrics.total.remaining);

        state.context.statistics.request.display.actual.total = prettyTime(state.context.statistics.request.actual.total);
        state.context.statistics.total.display.actual.total = prettyTime(state.context.statistics.total.actual.total);

        state.context.statistics.total.display.thoroughput_rate[v] = Math.floor(1000/state.context.statistics.total.metrics[v].rate);
        state.context.statistics.total.display.thoroughput_rate[n] = Math.floor(1000/state.context.statistics.total.metrics[n].rate);
        state.context.statistics.total.display.thoroughput_rate.total = Math.floor(1000/state.context.statistics.total.metrics.total.rate);
        if ( state.context.statistics.total.display.thoroughput_rate[v] < 1 ) {
          state.context.statistics.total.display.thoroughput_rate[v] = Math.floor(60/state.context.statistics.total.display.thoroughput_rate[v]) + ' entries/min';
        } else {
          state.context.statistics.total.display.thoroughput_rate[v] += ' entries/sec';
        }
        if ( state.context.statistics.total.display.thoroughput_rate[n] < 1 ) {
          state.context.statistics.total.display.thoroughput_rate[n] = Math.floor(60/state.context.statistics.total.display.thoroughput_rate[n]) + ' entries/min';
        } else {
          state.context.statistics.total.display.thoroughput_rate[n] += ' entries/sec';
        } 
        if ( state.context.statistics.total.display.thoroughput_rate.total < 1 ) {
          state.context.statistics.total.display.thoroughput_rate.total = Math.floor(60/state.context.statistics.total.display.thoroughput_rate.total) + ' entries/min';
        } else {
          state.context.statistics.total.display.thoroughput_rate.total += ' entries/sec';
        } 
        state.context.statistics.total.display.thoroughput_average[v] = Math.floor(1000/state.context.statistics.total.metrics[v].average);
        state.context.statistics.total.display.thoroughput_average[n] = Math.floor(1000/state.context.statistics.total.metrics[n].average);
        state.context.statistics.total.display.thoroughput_average.total = Math.floor(1000/state.context.statistics.total.metrics.total.average);
        if ( state.context.statistics.total.display.thoroughput_average[v] < 1 ) {
          state.context.statistics.total.display.thoroughput_average[v] = Math.floor(60/state.context.statistics.total.display.thoroughput_average[v]) + ' entries/min';
        } else {
          state.context.statistics.total.display.thoroughput_average[v] += ' entries/sec';
        }       
        if ( state.context.statistics.total.display.thoroughput_average[n] < 1 ) {
          state.context.statistics.total.display.thoroughput_average[n] = Math.floor(60/state.context.statistics.total.display.thoroughput_average[n]) + ' entries/min';
        } else {
          state.context.statistics.total.display.thoroughput_average[n] += ' entries/sec';
        } 
        if ( state.context.statistics.total.display.thoroughput_average.total < 1 ) {
          state.context.statistics.total.display.thoroughput_average.total = Math.floor(60/state.context.statistics.total.display.thoroughput_average.total) + ' entries/min';
        } else {
          state.context.statistics.total.display.thoroughput_average.total += ' entries/sec';
        } 

        state.context.statistics.request.display.thoroughput_rate[v] = Math.floor(1000/state.context.statistics.request.metrics[v].rate);
        state.context.statistics.request.display.thoroughput_rate[n] = Math.floor(1000/state.context.statistics.request.metrics[n].rate);
        state.context.statistics.request.display.thoroughput_rate.total = Math.floor(1000/state.context.statistics.request.metrics.total.rate);
        if ( state.context.statistics.request.display.thoroughput_rate[v] < 1 ) {
          state.context.statistics.request.display.thoroughput_rate[v] = Math.floor(60/state.context.statistics.request.display.thoroughput_rate[v]) + ' entries/min';
        } else {
          state.context.statistics.request.display.thoroughput_rate[v] += ' entries/sec';
        }
        if ( state.context.statistics.request.display.thoroughput_rate[n] < 1 ) {
          state.context.statistics.request.display.thoroughput_rate[n] = Math.floor(60/state.context.statistics.request.display.thoroughput_rate[n]) + ' entries/min';
        } else {
          state.context.statistics.request.display.thoroughput_rate[n] += ' entries/sec';
        } 
        if ( state.context.statistics.request.display.thoroughput_rate.total < 1 ) {
          state.context.statistics.request.display.thoroughput_rate.total = Math.floor(60/state.context.statistics.request.display.thoroughput_rate.total) + ' entries/min';
        } else {
          state.context.statistics.request.display.thoroughput_rate.total += ' entries/sec';
        } 
        state.context.statistics.request.display.thoroughput_average[v] = Math.floor(1000/state.context.statistics.request.metrics[v].average);
        state.context.statistics.request.display.thoroughput_average[n] = Math.floor(1000/state.context.statistics.request.metrics[n].average);
        state.context.statistics.request.display.thoroughput_average.total = Math.floor(1000/state.context.statistics.request.metrics.total.average);
        if ( state.context.statistics.request.display.thoroughput_average[v] < 1 ) {
          state.context.statistics.request.display.thoroughput_average[v] = Math.floor(60/state.context.statistics.request.display.thoroughput_average[v]) + ' entries/min';
        } else {
          state.context.statistics.request.display.thoroughput_average[v] += ' entries/sec';
        }       
        if ( state.context.statistics.request.display.thoroughput_average[n] < 1 ) {
          state.context.statistics.request.display.thoroughput_average[n] = Math.floor(60/state.context.statistics.request.display.thoroughput_average[n]) + ' entries/min';
        } else {
          state.context.statistics.request.display.thoroughput_average[n] += ' entries/sec';
        } 
        if ( state.context.statistics.request.display.thoroughput_average.total < 1 ) {
          state.context.statistics.request.display.thoroughput_average.total = Math.floor(60/state.context.statistics.request.display.thoroughput_average.total) + ' entries/min';
        } else {
          state.context.statistics.request.display.thoroughput_average.total += ' entries/sec';
        } 


        state.context.statistics.total.display.speed_rate[v] = Math.floor(state.context.statistics.total.metrics[v].rate);
        state.context.statistics.total.display.speed_rate[n] = Math.floor(state.context.statistics.total.metrics[n].rate);
        state.context.statistics.total.display.speed_rate.total = Math.floor(state.context.statistics.total.metrics.total.rate);
        if ( state.context.statistics.total.display.speed_rate[v] < 1 ) {
          state.context.statistics.total.display.speed_rate[v] = Math.floor(60/state.context.statistics.total.display.speed_rate[v]) + ' ms/entry';
        } else {
          state.context.statistics.total.display.speed_rate[v] += ' ms/entry';
        }
        if ( state.context.statistics.total.display.speed_rate[n] < 1 ) {
          state.context.statistics.total.display.speed_rate[n] = Math.floor(60/state.context.statistics.total.display.speed_rate[n]) + ' ms/entry';
        } else {
          state.context.statistics.total.display.speed_rate[n] += ' ms/entry';
        } 
        if ( state.context.statistics.total.display.speed_rate.total < 1 ) {
          state.context.statistics.total.display.speed_rate.total = Math.floor(60/state.context.statistics.total.display.speed_rate.total) + ' ms/entry';
        } else {
          state.context.statistics.total.display.speed_rate.total += ' ms/entry';
        } 
        state.context.statistics.total.display.speed_average[v] = Math.floor(state.context.statistics.total.metrics[v].average);
        state.context.statistics.total.display.speed_average[n] = Math.floor(state.context.statistics.total.metrics[n].average);
        state.context.statistics.total.display.speed_average.total = Math.floor(state.context.statistics.total.metrics.total.average);
        if ( state.context.statistics.total.display.speed_average[v] < 1 ) {
          state.context.statistics.total.display.speed_average[v] = Math.floor(60/state.context.statistics.total.display.speed_average[v]) + ' ms/entry';
        } else {
          state.context.statistics.total.display.speed_average[v] += ' ms/entry';
        }       
        if ( state.context.statistics.total.display.speed_average[n] < 1 ) {
          state.context.statistics.total.display.speed_average[n] = Math.floor(60/state.context.statistics.total.display.speed_average[n]) + ' ms/entry';
        } else {
          state.context.statistics.total.display.speed_average[n] += ' ms/entry';
        } 
        if ( state.context.statistics.total.display.speed_average.total < 1 ) {
          state.context.statistics.total.display.speed_average.total = Math.floor(60/state.context.statistics.total.display.speed_average.total) + ' ms/entry';
        } else {
          state.context.statistics.total.display.speed_average.total += ' ms/entry';
        } 

        state.context.statistics.request.display.speed_rate[v] = Math.floor(state.context.statistics.request.metrics[v].rate);
        state.context.statistics.request.display.speed_rate[n] = Math.floor(state.context.statistics.request.metrics[n].rate);
        state.context.statistics.request.display.speed_rate.total = Math.floor(state.context.statistics.request.metrics.total.rate);
        if ( state.context.statistics.request.display.speed_rate[v] < 1 ) {
          state.context.statistics.request.display.speed_rate[v] = Math.floor(60/state.context.statistics.request.display.speed_rate[v]) + ' ms/entry';
        } else {
          state.context.statistics.request.display.speed_rate[v] += ' ms/entry';
        }
        if ( state.context.statistics.request.display.speed_rate[n] < 1 ) {
          state.context.statistics.request.display.speed_rate[n] = Math.floor(60/state.context.statistics.request.display.speed_rate[n]) + ' ms/entry';
        } else {
          state.context.statistics.request.display.speed_rate[n] += ' ms/entry';
        } 
        if ( state.context.statistics.request.display.speed_rate.total < 1 ) {
          state.context.statistics.request.display.speed_rate.total = Math.floor(60/state.context.statistics.request.display.speed_rate.total) + ' ms/entry';
        } else {
          state.context.statistics.request.display.speed_rate.total += ' ms/entry';
        } 
        state.context.statistics.request.display.speed_average[v] = Math.floor(state.context.statistics.request.metrics[v].average);
        state.context.statistics.request.display.speed_average[n] = Math.floor(state.context.statistics.request.metrics[n].average);
        state.context.statistics.request.display.speed_average.total = Math.floor(state.context.statistics.request.metrics.total.average);
        if ( state.context.statistics.request.display.speed_average[v] < 1 ) {
          state.context.statistics.request.display.speed_average[v] = Math.floor(60/state.context.statistics.request.display.speed_average[v]) + ' ms/entry';
        } else {
          state.context.statistics.request.display.speed_average[v] += ' ms/entry';
        }       
        if ( state.context.statistics.request.display.speed_average[n] < 1 ) {
          state.context.statistics.request.display.speed_average[n] = Math.floor(60/state.context.statistics.request.display.speed_average[n]) + ' ms/entry';
        } else {
          state.context.statistics.request.display.speed_average[n] += ' ms/entry';
        } 
        if ( state.context.statistics.request.display.speed_average.total < 1 ) {
          state.context.statistics.request.display.speed_average.total = Math.floor(60/state.context.statistics.request.display.speed_average.total) + ' ms/entry';
        } else {
          state.context.statistics.request.display.speed_average.total += ' ms/entry';
        } 


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
        promise(function(context) {
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
              state.context.statistics.request.metrics[verb].expected = state.context.limit;
              state.context.statistics.request.metrics.total.expected = state.context.limit;
              state.context.statistics.request.metrics[noun].expected = state.context.limit;
              state.context.statistics.total.metrics[verb].expected += state.context.limit;
              state.context.statistics.total.metrics[noun].expected += state.context.limit;
              state.context.statistics.total.metrics.total.expected += state.context.limit;
            } else {
              state.context.statistics.request.metrics[verb].expected = context.total;
              state.context.statistics.request.metrics[noun].expected = context.total;
              state.context.statistics.request.metrics.total.expected = context.total;
              state.context.statistics.total.metrics[verb].expected += context.total;
              state.context.statistics.total.metrics[noun].expected += context.total;
              state.context.statistics.total.metrics.total.expected += context.total;
            } 
            state.context.statistics.request.metrics[verb].expected += 1;
            state.context.statistics.request.metrics[noun].expected += 1;
            state.context.statistics.total.metrics[verb].expected += 1;
            state.context.statistics.total.metrics[noun].expected += 1;
            state.context.statistics.request.metrics.total.expected += 1;
            state.context.statistics.total.metrics.total.expected += 1;
            calculate(verb, noun);
            state.promise = promise;
            deferred.resolve(state.context);
          }, function(context) {
            deferred.error(state.context);
          }, function(context) {
            deferred.notify(state.context);
          });
        });
        state.context.statistics.request.metrics[verb].expected += 1;
        state.context.statistics.request.metrics[noun].expected += 1;
        state.context.statistics.total.metrics[verb].expected += 1;
        state.context.statistics.total.metrics[noun].expected += 1;
        state.context.statistics.request.metrics.total.expected += 1;
        state.context.statistics.total.metrics.total.expected += 1;
        state.promise = deferred.promise;
      } else {
        state.context.statistics.request.metrics[verb].expected += 1;
        state.context.statistics.request.metrics[noun].expected += 1;
        state.context.statistics.total.metrics[verb].expected += 1;
        state.context.statistics.total.metrics[noun].expected += 1;
        state.context.statistics.request.metrics.total.expected += 1;
        state.context.statistics.total.metrics.total.expected += 1;
        calculate(verb, noun);
      }
    } else {
      pieces = state.context.statistics.request.type.split('.');
      verb = pieces[0];
      noun = pieces[1];
      state.context.statistics.request.metrics[verb].requests += 1;
      state.context.statistics.total.metrics[verb].requests += 1;
      state.context.statistics.request.metrics[noun].requests += 1;
      state.context.statistics.total.metrics[noun].requests += 1;
      state.context.statistics.request.metrics[state.type].requests += 1;
      state.context.statistics.total.metrics[state.type].requests += 1;
      state.context.statistics.request.metrics.total.requests += 1;
      state.context.statistics.total.metrics.total.requests += 1;
      calculate(verb, noun);
      state.context.statistics.request.milliseconds.last = datetime;
    }
    return state;
  };
}(self));