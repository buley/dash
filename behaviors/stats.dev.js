window.dashStats = window.dashStats || (function (environment) {
  "use strict";
  var model = function () {
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
          add: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            requests: 0,
            elapsed: 0,
            expected: 0
          },
          clear: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            requests: 0,
            elapsed: 0,
            expected: 0
          },
          count: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          get: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          put: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          remove: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          update: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          resolve: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          notify: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          error: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          total: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          store: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          stores: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          entry: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          entries: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          database: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          databases: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          index: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          },
          indexes: {
            average: NaN,
            rate: NaN,
            recent: [],
            expecting: 0,
            remaining: 0,
            duration: 0,
            elapsed: 0,
            requests: 0,
            expected: 0
          }
        },
        type: null,
        memory: 3
      };
    },
    total = model();
  return function (state) {
    if(this.isnt(state.context.stats,true)) {
      console.log('stats skipped', state.method);
      return state;
    }
    var context = state.context,
      pieces = !!state.method ? state.method.split('.') : [],
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
        milliseconds = Math.floor(milliseconds);
        var seconds = Math.floor(milliseconds/1000),
            days = Math.floor(seconds/86400),
            hours = Math.floor(seconds/3600),
            minutes = Math.floor(seconds/60),
            secs = Math.floor(seconds - (days*86400) - (hours*3600) - (minutes*60)),
            msecs = Math.floor(milliseconds - ( secs * 1000) );
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
      	if ( 2 === msecs.length ) {
      	  msecs += '0';
      	}
        return hours + minutes + ':' + secs + '.' + msecs;
      },
      calculate = function(v, n) {
        
        /* Time */
        
        datetime = new Date().getTime();
        state.context.statistics.total.started = state.context.statistics.total.started || datetime;
        state.context.statistics.request.started = state.context.statistics.request.started || datetime;
        state.context.statistics.request.last = state.context.statistics.request.last || state.context.statistics.request.started || datetime;

        state.context.statistics.total.elapsed = datetime - state.context.statistics.total.started;
        state.context.statistics.total.metrics.total.actual = state.context.statistics.total.elapsed;

        state.context.statistics.request.elapsed = datetime - state.context.statistics.request.started;
        state.context.statistics.request.metrics.total.actual = state.context.statistics.request.elapsed;

        state.context.statistics.request.metrics[n].elapsed = state.context.statistics.request.elapsed;
        state.context.statistics.request.metrics[v].elapsed = state.context.statistics.request.elapsed;
        state.context.statistics.request.metrics.total.elapsed = state.context.statistics.request.elapsed;

        state.context.statistics.total.metrics[n].elapsed = state.context.statistics.request.elapsed;
        state.context.statistics.total.metrics[v].elapsed = state.context.statistics.request.elapsed;
        state.context.statistics.total.metrics.total.elapsed = state.context.statistics.request.elapsed;

        diff = datetime - state.context.statistics.request.last;
        state.context.statistics.request.metrics[n].between = diff;
        state.context.statistics.request.metrics[v].between = diff;
        state.context.statistics.request.metrics.total.between = diff;
        state.context.statistics.total.metrics[n].between = diff;
        state.context.statistics.total.metrics[v].between = diff;
        state.context.statistics.total.metrics.total.between = diff;

        state.context.statistics.request.metrics[v].recent.unshift(state.context.statistics.total.metrics[v].between);
        state.context.statistics.total.metrics[v].recent.unshift(state.context.statistics.total.metrics[v].between);
        
        state.context.statistics.request.metrics[n].recent.unshift(state.context.statistics.request.metrics[n].between);
        state.context.statistics.total.metrics[n].recent.unshift(state.context.statistics.request.metrics[n].between);
        
        state.context.statistics.request.metrics.total.recent.unshift(state.context.statistics.request.metrics.total.between);
        state.context.statistics.total.metrics.total.recent.unshift(state.context.statistics.request.metrics.total.between);

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
        
        state.context.statistics.request.metrics[v].rate = average(state.context.statistics.request.metrics[v].recent); 
        state.context.statistics.request.metrics[n].rate = average(state.context.statistics.request.metrics[n].recent); 
        state.context.statistics.request.metrics.total.rate = average(state.context.statistics.request.metrics.total.recent); 

        state.context.statistics.total.metrics[v].rate = average(state.context.statistics.total.metrics[v].recent); 
        state.context.statistics.total.metrics[n].rate = average(state.context.statistics.total.metrics[n].recent); 
        state.context.statistics.total.metrics.total.rate = average(state.context.statistics.total.metrics.total.recent); 

        state.context.statistics.request.metrics[v].average = state.context.statistics.request.metrics[v].elapsed / state.context.statistics.request.metrics[v].requests; 
        state.context.statistics.request.metrics[n].average = state.context.statistics.request.metrics[n].elapsed / state.context.statistics.request.metrics[n].requests;
        state.context.statistics.request.metrics.total.average = state.context.statistics.request.metrics.total.elapsed / state.context.statistics.request.metrics.total.requests;

        state.context.statistics.total.metrics[v].average = state.context.statistics.total.metrics[v].elapsed/ state.context.statistics.total.metrics[v].requests; 
        state.context.statistics.total.metrics[n].average = state.context.statistics.total.metrics[n].elapsed / state.context.statistics.total.metrics[n].requests;
        state.context.statistics.total.metrics.total.average = state.context.statistics.total.metrics.total.elapsed / state.context.statistics.total.metrics.total.requests;

        if ( theirs.is(state.context.forecast,true) ) {

          state.context.statistics.request.metrics[v].expecting = state.context.statistics.request.metrics[v].expected - state.context.statistics.request.metrics[v].requests;
          state.context.statistics.request.metrics[n].expecting = state.context.statistics.request.metrics[n].expected - state.context.statistics.request.metrics[n].requests;
          state.context.statistics.request.metrics.total.expecting = state.context.statistics.request.metrics.total.expected - state.context.statistics.request.metrics.total.requests;

          state.context.statistics.total.metrics[v].expecting = state.context.statistics.total.metrics[v].expected - state.context.statistics.total.metrics[v].requests;
          state.context.statistics.total.metrics[n].expecting = state.context.statistics.total.metrics[n].expected - state.context.statistics.total.metrics[n].requests;
          state.context.statistics.total.metrics.total.expecting = state.context.statistics.total.metrics.total.expected - state.context.statistics.total.metrics.total.requests;

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
        }

        if (0 > state.context.statistics.total.metrics[v].remaining) {
          state.context.statistics.total.metrics[v].remaining = 0;
        } 
        if (0 > state.context.statistics.total.metrics[n].remaining) {
          state.context.statistics.total.metrics[n].remaining = 0;
        } 
        if (0 > state.context.statistics.total.metrics.total.remaining) {
          state.context.statistics.total.metrics.total.remaining = 0;
        } 

        state.context.statistics.total.display.elapsed[v] = prettyTime(state.context.statistics.total.metrics[v].elapsed);
        state.context.statistics.total.display.elapsed[n] = prettyTime(state.context.statistics.total.metrics[n].elapsed);
        state.context.statistics.total.display.elapsed.total = prettyTime(state.context.statistics.total.metrics.total.elapsed);

        state.context.statistics.request.display.elapsed[v] = prettyTime(state.context.statistics.request.metrics[v].elapsed);
        state.context.statistics.request.display.elapsed[n] = prettyTime(state.context.statistics.request.metrics[n].elapsed);
        state.context.statistics.request.display.elapsed.total = prettyTime(state.context.statistics.request.metrics.total.elapsed);

        if ( theirs.is(state.context.forecast,true) ) {

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

        }

        state.context.statistics.request.display.actual.total = prettyTime(state.context.statistics.request.metrics.total.actual);
        state.context.statistics.total.display.actual.total = prettyTime(state.context.statistics.total.metrics.total.actual);

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
      total: state.context.statistics ? state.context.statistics.total : total,
      request: model()
    };
    if (!this.contains(['resolve', 'notify', 'error'], state.type)) {
      state.context.statistics.request = model();
      state.context.statistics.request.started = new Date().getTime();
      state.context.statistics.total.started = state.context.statistics.total.started || new Date().getTime();
      state.context.statistics.request.type = state.method;
      if ( !!state.method && ( 'count.entries' !== state.method && null !== state.method.match(/\.entries$/) && this.is(state.context.forecast,true))) {
        deferred = this.deferred();
        promise(function(st) {
	  var context = st.context;
          var processTotal = function(total) {

	    if (!verb || !noun) {
            	state.promise = promise;
            	deferred.resolve(state.context);
		return;
            }
            if (theirs.exists(state.context.limit) && state.context.limit < total ) {
              state.context.statistics.request.metrics[verb].expected = state.context.limit;
              state.context.statistics.request.metrics.total.expected = state.context.limit;
              state.context.statistics.request.metrics[noun].expected = state.context.limit;
              state.context.statistics.total.metrics[verb].expected += state.context.limit;
              state.context.statistics.total.metrics[noun].expected += state.context.limit;
              state.context.statistics.total.metrics.total.expected += state.context.limit;
            } else {
              state.context.statistics.request.metrics[verb].expected = total;
              state.context.statistics.request.metrics[noun].expected = total;
              state.context.statistics.request.metrics.total.expected = total;
              state.context.statistics.total.metrics[verb].expected += total;
              state.context.statistics.total.metrics[noun].expected += total;
              state.context.statistics.total.metrics.total.expected += total;
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
          };
          if (!!state.context.total) {
            processTotal(state.context.total);
          } else {
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
              processTotal(context.total);
            }, function(context) {
              deferred.error(state.context);
            }, function(context) {
              deferred.notify(state.context);
            });
          }
        });
        if ( theirs.is(state.context.forecast,true) ) {
          state.context.statistics.request.metrics[verb].expected += 1;
          state.context.statistics.request.metrics[noun].expected += 1;
          state.context.statistics.total.metrics[verb].expected += 1;
          state.context.statistics.total.metrics[noun].expected += 1;
          state.context.statistics.request.metrics.total.expected += 1;
          state.context.statistics.total.metrics.total.expected += 1;
        }
        state.promise = deferred.promise;
      } else {
        if ( theirs.is(state.context.forecast,true) ) {
          state.context.statistics.request.metrics[verb].expected += 1;
          state.context.statistics.request.metrics[noun].expected += 1;
          state.context.statistics.total.metrics[verb].expected += 1;
          state.context.statistics.total.metrics[noun].expected += 1;
          state.context.statistics.request.metrics.total.expected += 1;
          state.context.statistics.total.metrics.total.expected += 1;
        }

	if (!!verb && !!noun) {
           calculate(verb, noun);
        }

      }
    } else {
	if ( !!state.context.statistics.request.type ) {
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
	      state.context.statistics.request.last = datetime;
	}
    }
    return state;
  };
}(self));
