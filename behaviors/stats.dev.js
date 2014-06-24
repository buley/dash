self.dashStats = self.dashStats || (function (environment) {
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
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          requests: 0,
          elapsed: 0,
          expected: 0
        },
        clear: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          requests: 0,
          elapsed: 0,
          expected: 0
        },
        count: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        get: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        put: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        remove: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        update: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        resolve: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        notify: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        error: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        total: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        store: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        stores: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        entry: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        entries: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        database: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        databases: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        index: {
          average: 0,
          rate: 0,
          recent: [],
          expecting: 0,
          remaining: 0,
          duration: 0,
          elapsed: 0,
          requests: 0,
          expected: 0
        },
        indexes: {
          average: 0,
          rate: 0,
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
    allStats = {
      total: model()
    },
      average = function (stack) {
        var x = 0,
          xlen = stack.length,
          xitem, total = 0;
        for (x = 0; x < xlen; x += 1) {
          total += stack[x];
        }
        return total / x;
      },
      prettyTime = function (milliseconds) {
        milliseconds = Math.floor(milliseconds);
        var seconds = Math.floor(milliseconds / 1000),
          days = Math.floor(seconds / 86400),
          hours = Math.floor(seconds / 3600),
          minutes = Math.floor(seconds / 60),
          secs = Math.floor(seconds - (days * 86400) - (hours * 3600) - (minutes * 60)),
          msecs = Math.floor(milliseconds - (secs * 1000));
        if (true === isNaN(hours) && true === isNaN(minutes) && true === isNaN(secs)) {
          return;
        }
        if (hours < 10 && hours > 0) {
          hours = '0' + hours.toString() + ':';
        } else if (hours < 1) {
          hours = '';
        } else {
          hours = hours.toString() + ':';
        }
        if (minutes < 10) {
          minutes = '0' + minutes.toString();
        } else {
          minutes = minutes.toString();
        }
        if (secs < 10) {
          secs = '0' + secs.toString();
        } else {
          secs = secs.toString();
        }
        if (msecs < 10) {
          msecs = '00' + msecs.toString();
        } else if (msecs < 100) {
          msecs = '0' + msecs.toString();
        } else {
          msecs = msecs.toString();
        }
        if (2 === msecs.length) {
          msecs += '0';
        }
        return hours + minutes + ':' + secs + '.' + msecs;
      };
  return function (state) {
    if (this.isnt(state.context.stats, true)) {
      return state;
    }
    var context = state.context,
      pieces = !! state.method ? state.method.split('.') : [],
      verb = pieces[0],
      noun = pieces[1],
      deferred,
      datetime,
      diff,
      promise = state.promise,
      theirs = this,
      calculate = function (v, n) {
        /* Time */
        datetime = new Date().getTime();
        allStats['total'] = allStats['total'];
        allStats[state.context.statistics.id] = allStats[state.context.statistics.id];
        allStats['total'].started = allStats['total'].started || datetime;
        allStats[state.context.statistics.id].started = allStats[state.context.statistics.id].started || datetime;
        allStats[state.context.statistics.id].last = allStats[state.context.statistics.id].last || allStats[state.context.statistics.id].started || datetime;
        allStats['total'].elapsed = datetime - allStats['total'].started;
        allStats['total'].metrics.total.actual = allStats['total'].elapsed;
        allStats[state.context.statistics.id].elapsed = datetime - allStats[state.context.statistics.id].started;
        allStats[state.context.statistics.id].metrics.total.actual = allStats[state.context.statistics.id].elapsed;
        allStats[state.context.statistics.id].metrics[n].elapsed = allStats[state.context.statistics.id].elapsed;
        allStats[state.context.statistics.id].metrics[v].elapsed = allStats[state.context.statistics.id].elapsed;
        allStats[state.context.statistics.id].metrics.total.elapsed = allStats[state.context.statistics.id].elapsed;
        allStats['total'].metrics[n].elapsed = allStats[state.context.statistics.id].elapsed;
        allStats['total'].metrics[v].elapsed = allStats[state.context.statistics.id].elapsed;
        allStats['total'].metrics.total.elapsed = allStats[state.context.statistics.id].elapsed;
        diff = datetime - allStats[state.context.statistics.id].last;
        if (diff > 0) {
          allStats[state.context.statistics.id].metrics[n].between = diff;
          allStats[state.context.statistics.id].metrics[v].between = diff;
          allStats[state.context.statistics.id].metrics.total.between = diff;
          allStats['total'].metrics[n].between = diff;
          allStats['total'].metrics[v].between = diff;
          allStats['total'].metrics.total.between = diff;
          allStats[state.context.statistics.id].metrics[v].recent.unshift(allStats['total'].metrics[v].between);
          allStats['total'].metrics[v].recent.unshift(allStats['total'].metrics[v].between);
          allStats[state.context.statistics.id].metrics[n].recent.unshift(allStats[state.context.statistics.id].metrics[n].between);
          allStats['total'].metrics[n].recent.unshift(allStats[state.context.statistics.id].metrics[n].between);
          allStats[state.context.statistics.id].metrics.total.recent.unshift(allStats[state.context.statistics.id].metrics.total.between);
          allStats['total'].metrics.total.recent.unshift(allStats[state.context.statistics.id].metrics.total.between);
          if (allStats[state.context.statistics.id].metrics[v].recent.length > allStats[state.context.statistics.id].memory) {
            allStats[state.context.statistics.id].metrics[v].recent = allStats[state.context.statistics.id].metrics[v].recent.slice(0, allStats[state.context.statistics.id].memory);
          }
          if (allStats['total'].metrics[n].recent.length > allStats['total'].memory) {
            allStats['total'].metrics[n].recent = allStats['total'].metrics[n].recent.slice(0, allStats['total'].memory);
          }
          if (allStats[state.context.statistics.id].metrics[n].recent.length > allStats[state.context.statistics.id].memory) {
            allStats[state.context.statistics.id].metrics[n].recent = allStats[state.context.statistics.id].metrics[n].recent.slice(0, allStats[state.context.statistics.id].memory);
          }
          if (allStats['total'].metrics[n].recent.length > allStats['total'].memory) {
            allStats['total'].metrics[n].recent = allStats['total'].metrics[n].recent.slice(0, allStats['total'].memory);
          }
          if (allStats[state.context.statistics.id].metrics.total.recent.length > allStats[state.context.statistics.id].memory) {
            allStats[state.context.statistics.id].metrics.total.recent = allStats[state.context.statistics.id].metrics.total.recent.slice(0, allStats['total'].memory);
          }
          if (allStats['total'].metrics.total.recent.length > allStats['total'].memory) {
            allStats['total'].metrics.total.recent = allStats['total'].metrics.total.recent.slice(0, allStats['total'].memory);
          }
        }
        /* Other */
        allStats[state.context.statistics.id].metrics[v].rate = average(allStats[state.context.statistics.id].metrics[v].recent);
        allStats[state.context.statistics.id].metrics[n].rate = average(allStats[state.context.statistics.id].metrics[n].recent);
        allStats[state.context.statistics.id].metrics.total.rate = average(allStats[state.context.statistics.id].metrics.total.recent);
        allStats['total'].metrics[v].rate = average(allStats['total'].metrics[v].recent);
        allStats['total'].metrics[n].rate = average(allStats['total'].metrics[n].recent);
        allStats['total'].metrics.total.rate = average(allStats['total'].metrics.total.recent);
        allStats[state.context.statistics.id].metrics[v].average = allStats[state.context.statistics.id].metrics[v].elapsed / allStats[state.context.statistics.id].metrics[v].requests;
        allStats[state.context.statistics.id].metrics[n].average = allStats[state.context.statistics.id].metrics[n].elapsed / allStats[state.context.statistics.id].metrics[n].requests;
        allStats[state.context.statistics.id].metrics.total.average = allStats[state.context.statistics.id].metrics.total.elapsed / allStats[state.context.statistics.id].metrics.total.requests;
        allStats['total'].metrics[v].average = allStats['total'].metrics[v].elapsed / allStats['total'].metrics[v].requests;
        allStats['total'].metrics[n].average = allStats['total'].metrics[n].elapsed / allStats['total'].metrics[n].requests;
        allStats['total'].metrics.total.average = allStats['total'].metrics.total.elapsed / allStats['total'].metrics.total.requests;
        if (theirs.is(state.context.forecast, true)) {
          allStats[state.context.statistics.id].metrics[v].expecting = allStats[state.context.statistics.id].metrics[v].expected - allStats[state.context.statistics.id].metrics[v].requests;
          allStats[state.context.statistics.id].metrics[n].expecting = allStats[state.context.statistics.id].metrics[n].expected - allStats[state.context.statistics.id].metrics[n].requests;
          allStats[state.context.statistics.id].metrics.total.expecting = allStats[state.context.statistics.id].metrics.total.expected - allStats[state.context.statistics.id].metrics.total.requests;
          allStats['total'].metrics[v].expecting = allStats['total'].metrics[v].expected - allStats['total'].metrics[v].requests;
          allStats['total'].metrics[n].expecting = allStats['total'].metrics[n].expected - allStats['total'].metrics[n].requests;
          allStats['total'].metrics.total.expecting = allStats['total'].metrics.total.expected - allStats['total'].metrics.total.requests;
          allStats[state.context.statistics.id].metrics[v].duration = allStats[state.context.statistics.id].metrics[v].average * allStats[state.context.statistics.id].metrics[v].expected;
          allStats[state.context.statistics.id].metrics[n].duration = allStats[state.context.statistics.id].metrics[n].average * allStats[state.context.statistics.id].metrics[n].expected;
          allStats[state.context.statistics.id].metrics.total.duration = allStats[state.context.statistics.id].metrics.total.average * allStats[state.context.statistics.id].metrics.total.expected;
          allStats['total'].metrics[v].duration = allStats['total'].metrics[v].average * allStats['total'].metrics[v].expected;
          allStats['total'].metrics[n].duration = allStats['total'].metrics[n].average * allStats['total'].metrics[n].expected;
          allStats['total'].metrics.total.duration = allStats['total'].metrics.total.average * allStats['total'].metrics.total.expected;
          allStats['total'].metrics[v].remaining = allStats['total'].metrics[v].expecting * allStats['total'].metrics[v].rate;
          allStats['total'].metrics[n].remaining = allStats['total'].metrics[n].expecting * allStats['total'].metrics[n].rate;
          allStats['total'].metrics.total.remaining = allStats['total'].metrics.total.expecting * allStats['total'].metrics.total.rate;
          allStats[state.context.statistics.id].metrics[v].remaining = allStats[state.context.statistics.id].metrics[v].expecting * allStats[state.context.statistics.id].metrics[v].rate
          allStats[state.context.statistics.id].metrics[n].remaining = allStats[state.context.statistics.id].metrics[n].expecting * allStats[state.context.statistics.id].metrics[n].rate;
          allStats[state.context.statistics.id].metrics.total.remaining = allStats[state.context.statistics.id].metrics.total.expecting * allStats[state.context.statistics.id].metrics.total.rate;
        }
        if (0 > allStats['total'].metrics[v].remaining) {
          allStats['total'].metrics[v].remaining = 0;
        }
        if (0 > allStats['total'].metrics[n].remaining) {
          allStats['total'].metrics[n].remaining = 0;
        }
        if (0 > allStats['total'].metrics.total.remaining) {
          allStats['total'].metrics.total.remaining = 0;
        }
        allStats['total'].display.elapsed[v] = prettyTime(allStats['total'].metrics[v].elapsed);
        allStats['total'].display.elapsed[n] = prettyTime(allStats['total'].metrics[n].elapsed);
        allStats['total'].display.elapsed.total = prettyTime(allStats['total'].metrics.total.elapsed);
        allStats[state.context.statistics.id].display.elapsed[v] = prettyTime(allStats[state.context.statistics.id].metrics[v].elapsed);
        allStats[state.context.statistics.id].display.elapsed[n] = prettyTime(allStats[state.context.statistics.id].metrics[n].elapsed);
        allStats[state.context.statistics.id].display.elapsed.total = prettyTime(allStats[state.context.statistics.id].metrics.total.elapsed);
        if (theirs.is(state.context.forecast, true)) {
          allStats[state.context.statistics.id].display.duration[v] = prettyTime(allStats[state.context.statistics.id].metrics[v].duration);
          allStats[state.context.statistics.id].display.duration[n] = prettyTime(allStats[state.context.statistics.id].metrics[n].duration);
          allStats[state.context.statistics.id].display.duration.total = prettyTime(allStats[state.context.statistics.id].metrics.total.duration);
          allStats['total'].display.duration[v] = prettyTime(allStats['total'].metrics[v].duration);
          allStats['total'].display.duration[n] = prettyTime(allStats['total'].metrics[n].duration);
          allStats['total'].display.duration.total = prettyTime(allStats['total'].metrics.total.duration);
          allStats[state.context.statistics.id].display.remaining[v] = prettyTime(allStats[state.context.statistics.id].metrics[v].remaining);
          allStats[state.context.statistics.id].display.remaining[n] = prettyTime(allStats[state.context.statistics.id].metrics[n].remaining);
          allStats[state.context.statistics.id].display.remaining.total = prettyTime(allStats[state.context.statistics.id].metrics.total.remaining);
          allStats['total'].display.remaining[v] = prettyTime(allStats['total'].metrics[v].remaining);
          allStats['total'].display.remaining[n] = prettyTime(allStats['total'].metrics[n].remaining);
          allStats['total'].display.remaining.total = prettyTime(allStats['total'].metrics.total.remaining);
        }
        allStats[state.context.statistics.id].display.actual.total = prettyTime(allStats[state.context.statistics.id].metrics.total.actual);
        allStats['total'].display.actual.total = prettyTime(allStats['total'].metrics.total.actual);
        allStats['total'].display.thoroughput_rate[v] = Math.floor(1000 / allStats['total'].metrics[v].rate);
        allStats['total'].display.thoroughput_rate[n] = Math.floor(1000 / allStats['total'].metrics[n].rate);
        allStats['total'].display.thoroughput_rate.total = Math.floor(1000 / allStats['total'].metrics.total.rate);
        if (allStats['total'].display.thoroughput_rate[v] < 1) {
          allStats['total'].display.thoroughput_rate[v] = Math.floor(60 / allStats['total'].display.thoroughput_rate[v]) + ' entries/min';
        } else {
          allStats['total'].display.thoroughput_rate[v] += ' entries/sec';
        }
        if (allStats['total'].display.thoroughput_rate[n] < 1) {
          allStats['total'].display.thoroughput_rate[n] = Math.floor(60 / allStats['total'].display.thoroughput_rate[n]) + ' entries/min';
        } else {
          allStats['total'].display.thoroughput_rate[n] += ' entries/sec';
        }
        if (allStats['total'].display.thoroughput_rate.total < 1) {
          allStats['total'].display.thoroughput_rate.total = Math.floor(60 / allStats['total'].display.thoroughput_rate.total) + ' entries/min';
        } else {
          allStats['total'].display.thoroughput_rate.total += ' entries/sec';
        }
        allStats['total'].display.thoroughput_average[v] = Math.floor(1000 / allStats['total'].metrics[v].average);
        allStats['total'].display.thoroughput_average[n] = Math.floor(1000 / allStats['total'].metrics[n].average);
        allStats['total'].display.thoroughput_average.total = Math.floor(1000 / allStats['total'].metrics.total.average);
        if (allStats['total'].display.thoroughput_average[v] < 1) {
          allStats['total'].display.thoroughput_average[v] = Math.floor(60 / allStats['total'].display.thoroughput_average[v]) + ' entries/min';
        } else {
          allStats['total'].display.thoroughput_average[v] += ' entries/sec';
        }
        if (allStats['total'].display.thoroughput_average[n] < 1) {
          allStats['total'].display.thoroughput_average[n] = Math.floor(60 / allStats['total'].display.thoroughput_average[n]) + ' entries/min';
        } else {
          allStats['total'].display.thoroughput_average[n] += ' entries/sec';
        }
        if (allStats['total'].display.thoroughput_average.total < 1) {
          allStats['total'].display.thoroughput_average.total = Math.floor(60 / allStats['total'].display.thoroughput_average.total) + ' entries/min';
        } else {
          allStats['total'].display.thoroughput_average.total += ' entries/sec';
        }
        allStats[state.context.statistics.id].display.thoroughput_rate[v] = Math.floor(1000 / allStats[state.context.statistics.id].metrics[v].rate);
        allStats[state.context.statistics.id].display.thoroughput_rate[n] = Math.floor(1000 / allStats[state.context.statistics.id].metrics[n].rate);
        allStats[state.context.statistics.id].display.thoroughput_rate.total = Math.floor(1000 / allStats[state.context.statistics.id].metrics.total.rate);
        if (allStats[state.context.statistics.id].display.thoroughput_rate[v] < 1) {
          allStats[state.context.statistics.id].display.thoroughput_rate[v] = Math.floor(60 / allStats[state.context.statistics.id].display.thoroughput_rate[v]) + ' entries/min';
        } else {
          allStats[state.context.statistics.id].display.thoroughput_rate[v] += ' entries/sec';
        }
        if (allStats[state.context.statistics.id].display.thoroughput_rate[n] < 1) {
          allStats[state.context.statistics.id].display.thoroughput_rate[n] = Math.floor(60 / allStats[state.context.statistics.id].display.thoroughput_rate[n]) + ' entries/min';
        } else {
          allStats[state.context.statistics.id].display.thoroughput_rate[n] += ' entries/sec';
        }
        if (allStats[state.context.statistics.id].display.thoroughput_rate.total < 1) {
          allStats[state.context.statistics.id].display.thoroughput_rate.total = Math.floor(60 / allStats[state.context.statistics.id].display.thoroughput_rate.total) + ' entries/min';
        } else {
          allStats[state.context.statistics.id].display.thoroughput_rate.total += ' entries/sec';
        }
        allStats[state.context.statistics.id].display.thoroughput_average[v] = Math.floor(1000 / allStats[state.context.statistics.id].metrics[v].average);
        allStats[state.context.statistics.id].display.thoroughput_average[n] = Math.floor(1000 / allStats[state.context.statistics.id].metrics[n].average);
        allStats[state.context.statistics.id].display.thoroughput_average.total = Math.floor(1000 / allStats[state.context.statistics.id].metrics.total.average);
        if (allStats[state.context.statistics.id].display.thoroughput_average[v] < 1) {
          allStats[state.context.statistics.id].display.thoroughput_average[v] = Math.floor(60 / allStats[state.context.statistics.id].display.thoroughput_average[v]) + ' entries/min';
        } else {
          allStats[state.context.statistics.id].display.thoroughput_average[v] += ' entries/sec';
        }
        if (allStats[state.context.statistics.id].display.thoroughput_average[n] < 1) {
          allStats[state.context.statistics.id].display.thoroughput_average[n] = Math.floor(60 / allStats[state.context.statistics.id].display.thoroughput_average[n]) + ' entries/min';
        } else {
          allStats[state.context.statistics.id].display.thoroughput_average[n] += ' entries/sec';
        }
        if (allStats[state.context.statistics.id].display.thoroughput_average.total < 1) {
          allStats[state.context.statistics.id].display.thoroughput_average.total = Math.floor(60 / allStats[state.context.statistics.id].display.thoroughput_average.total) + ' entries/min';
        } else {
          allStats[state.context.statistics.id].display.thoroughput_average.total += ' entries/sec';
        }
        allStats['total'].display.speed_rate[v] = Math.floor(allStats['total'].metrics[v].rate);
        allStats['total'].display.speed_rate[n] = Math.floor(allStats['total'].metrics[n].rate);
        allStats['total'].display.speed_rate.total = Math.floor(allStats['total'].metrics.total.rate);
        if (allStats['total'].display.speed_rate[v] < 1) {
          allStats['total'].display.speed_rate[v] = Math.floor(60 / allStats['total'].display.speed_rate[v]) + ' ms/entry';
        } else {
          allStats['total'].display.speed_rate[v] += ' ms/entry';
        }
        if (allStats['total'].display.speed_rate[n] < 1) {
          allStats['total'].display.speed_rate[n] = Math.floor(60 / allStats['total'].display.speed_rate[n]) + ' ms/entry';
        } else {
          allStats['total'].display.speed_rate[n] += ' ms/entry';
        }
        if (allStats['total'].display.speed_rate.total < 1) {
          allStats['total'].display.speed_rate.total = Math.floor(60 / allStats['total'].display.speed_rate.total) + ' ms/entry';
        } else {
          allStats['total'].display.speed_rate.total += ' ms/entry';
        }
        allStats['total'].display.speed_average[v] = Math.floor(allStats['total'].metrics[v].average);
        allStats['total'].display.speed_average[n] = Math.floor(allStats['total'].metrics[n].average);
        allStats['total'].display.speed_average.total = Math.floor(allStats['total'].metrics.total.average);
        if (allStats['total'].display.speed_average[v] < 1) {
          allStats['total'].display.speed_average[v] = Math.floor(60 / allStats['total'].display.speed_average[v]) + ' ms/entry';
        } else {
          allStats['total'].display.speed_average[v] += ' ms/entry';
        }
        if (allStats['total'].display.speed_average[n] < 1) {
          allStats['total'].display.speed_average[n] = Math.floor(60 / allStats['total'].display.speed_average[n]) + ' ms/entry';
        } else {
          allStats['total'].display.speed_average[n] += ' ms/entry';
        }
        if (allStats['total'].display.speed_average.total < 1) {
          allStats['total'].display.speed_average.total = Math.floor(60 / allStats['total'].display.speed_average.total) + ' ms/entry';
        } else {
          allStats['total'].display.speed_average.total += ' ms/entry';
        }
        allStats[state.context.statistics.id].display.speed_rate[v] = Math.floor(allStats[state.context.statistics.id].metrics[v].rate);
        allStats[state.context.statistics.id].display.speed_rate[n] = Math.floor(allStats[state.context.statistics.id].metrics[n].rate);
        allStats[state.context.statistics.id].display.speed_rate.total = Math.floor(allStats[state.context.statistics.id].metrics.total.rate);
        if (allStats[state.context.statistics.id].display.speed_rate[v] < 1) {
          allStats[state.context.statistics.id].display.speed_rate[v] = Math.floor(60 / allStats[state.context.statistics.id].display.speed_rate[v]) + ' ms/entry';
        } else {
          allStats[state.context.statistics.id].display.speed_rate[v] += ' ms/entry';
        }
        if (allStats[state.context.statistics.id].display.speed_rate[n] < 1) {
          allStats[state.context.statistics.id].display.speed_rate[n] = Math.floor(60 / allStats[state.context.statistics.id].display.speed_rate[n]) + ' ms/entry';
        } else {
          allStats[state.context.statistics.id].display.speed_rate[n] += ' ms/entry';
        }
        if (allStats[state.context.statistics.id].display.speed_rate.total < 1) {
          allStats[state.context.statistics.id].display.speed_rate.total = Math.floor(60 / allStats[state.context.statistics.id].display.speed_rate.total) + ' ms/entry';
        } else {
          allStats[state.context.statistics.id].display.speed_rate.total += ' ms/entry';
        }
        allStats[state.context.statistics.id].display.speed_average[v] = Math.floor(allStats[state.context.statistics.id].metrics[v].average);
        allStats[state.context.statistics.id].display.speed_average[n] = Math.floor(allStats[state.context.statistics.id].metrics[n].average);
        allStats[state.context.statistics.id].display.speed_average.total = Math.floor(allStats[state.context.statistics.id].metrics.total.average);
        if (allStats[state.context.statistics.id].display.speed_average[v] < 1) {
          allStats[state.context.statistics.id].display.speed_average[v] = Math.floor(60 / allStats[state.context.statistics.id].display.speed_average[v]) + ' ms/entry';
        } else {
          allStats[state.context.statistics.id].display.speed_average[v] += ' ms/entry';
        }
        if (allStats[state.context.statistics.id].display.speed_average[n] < 1) {
          allStats[state.context.statistics.id].display.speed_average[n] = Math.floor(60 / allStats[state.context.statistics.id].display.speed_average[n]) + ' ms/entry';
        } else {
          allStats[state.context.statistics.id].display.speed_average[n] += ' ms/entry';
        }
        if (allStats[state.context.statistics.id].display.speed_average.total < 1) {
          allStats[state.context.statistics.id].display.speed_average.total = Math.floor(60 / allStats[state.context.statistics.id].display.speed_average.total) + ' ms/entry';
        } else {
          allStats[state.context.statistics.id].display.speed_average.total += ' ms/entry';
        }
      };
    if (!theirs.exists(state.context.statistics)) {
      var id = theirs.random();
      allStats[id] = model();
      state.context.statistics = {
        total: allStats['total'],
        request: allStats[id],
        id: id
      };
    }
    if (!this.contains(['resolve', 'notify', 'error'], state.type)) {
      allStats[state.context.statistics.id] = model();
      allStats[state.context.statistics.id].started = new Date().getTime();
      allStats['total'].started = allStats['total'].started || new Date().getTime();
      allStats[state.context.statistics.id].type = state.method;
      if ( !! state.method && ('count.entries' !== state.method && null !== state.method.match(/\.entries$/) && this.is(state.context.forecast, true))) {
        deferred = this.deferred();
        promise(function (st) {
          var context = st.context;
          var processTotal = function (total) {
            if (!verb || !noun) {
              state.promise = promise;
              deferred.resolve(state.context);
              return;
            }
            if (theirs.exists(state.context.limit) && state.context.limit < total) {
              allStats[state.context.statistics.id].metrics[verb].expected = state.context.limit;
              allStats[state.context.statistics.id].metrics.total.expected = state.context.limit;
              allStats[state.context.statistics.id].metrics[noun].expected = state.context.limit;
              allStats['total'].metrics[verb].expected += state.context.limit;
              allStats['total'].metrics[noun].expected += state.context.limit;
              allStats['total'].metrics.total.expected += state.context.limit;
            } else {
              allStats[state.context.statistics.id].metrics[verb].expected = total;
              allStats[state.context.statistics.id].metrics[noun].expected = total;
              allStats[state.context.statistics.id].metrics.total.expected = total;
              allStats['total'].metrics[verb].expected += total;
              allStats['total'].metrics[noun].expected += total;
              allStats['total'].metrics.total.expected += total;
            }
            allStats[state.context.statistics.id].metrics[verb].expected += 1;
            allStats[state.context.statistics.id].metrics[noun].expected += 1;
            allStats['total'].metrics[verb].expected += 1;
            allStats['total'].metrics[noun].expected += 1;
            allStats[state.context.statistics.id].metrics.total.expected += 1;
            allStats['total'].metrics.total.expected += 1;
            calculate(verb, noun);
            state.promise = promise;
            deferred.resolve(state.context);
          };
          if ( !! state.context.total) {
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
            }, function (context) {
              deferred.error(state.context);
            }, function (context) {
              deferred.notify(state.context);
            });
          }
        });
        if (theirs.is(state.context.forecast, true)) {
          allStats[state.context.statistics.id].metrics[verb].expected += 1;
          allStats[state.context.statistics.id].metrics[noun].expected += 1;
          allStats['total'].metrics[verb].expected += 1;
          allStats['total'].metrics[noun].expected += 1;
          allStats[state.context.statistics.id].metrics.total.expected += 1;
          allStats['total'].metrics.total.expected += 1;
        }
        state.promise = deferred.promise;
      } else {
        if (theirs.is(state.context.forecast, true)) {
          allStats[state.context.statistics.id].metrics[verb].expected += 1;
          allStats[state.context.statistics.id].metrics[noun].expected += 1;
          allStats['total'].metrics[verb].expected += 1;
          allStats['total'].metrics[noun].expected += 1;
          allStats[state.context.statistics.id].metrics.total.expected += 1;
          allStats['total'].metrics.total.expected += 1;
        }
        if ( !! verb && !! noun) {
          calculate(verb, noun);
        }
      }
    } else {
      if ( !! allStats[state.context.statistics.id].type) {
        pieces = allStats[state.context.statistics.id].type.split('.');
        verb = pieces[0];
        noun = pieces[1];
        allStats[state.context.statistics.id].metrics[verb].requests += 1;
        allStats['total'].metrics[verb].requests += 1;
        allStats[state.context.statistics.id].metrics[noun].requests += 1;
        allStats['total'].metrics[noun].requests += 1;
        allStats[state.context.statistics.id].metrics[state.type].requests += 1;
        allStats['total'].metrics[state.type].requests += 1;
        allStats[state.context.statistics.id].metrics.total.requests += 1;
        allStats['total'].metrics.total.requests += 1;
        if ('notify' !== state.type || this.is(state.context.progress, true)) {
          calculate(verb, noun);
          state.context.statistics.total = theirs.clone(allStats['total']);
          state.context.statistics.request = theirs.clone(allStats[state.context.statistics.id]);
          allStats[state.context.statistics.id].last = datetime;
        } else if (this.contains(['resolve', 'error'], state.type)) {
          delete allStats[state.context.statistics.id];
        }
      }
    }
    return state;
  };
}(self));
