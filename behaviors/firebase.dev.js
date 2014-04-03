self.dashFirebase = self.dashFirebase || (function (environment) {
    "use strict";
    var that,
      deferred = function deferred() {
        var complete = false,
          wasSuccess = null,
          completed = [],
          children = [],
          notifies = [],
          successes = [],
          errors = [],
          safeApply = function (fn, args, context, err) {
            if (isFunction(fn)) {
              return fn.apply(context || {}, args || []);
            }
            if (isFunction(err)) {
              return safeApply(err, []);
            }
          }, safeEach = function (items, callback, inc) {
            var x,
              count = items.length;
            inc = inc || 1;
            for (x = 0; x < count; x += inc) {
              safeApply(callback, [items[x], x]);
            }
          }, isFunction = function (mixed_var) {
            return "function" === typeof mixed_var;
          };
          return {
            'promise': function (on_success, on_error, on_notify) {
              var defd = deferred();
              children.push(deferred);
              if (true === complete) {
                safeApply(wasSuccess ? on_success : on_error, completed);
              }
              safeEach([ [successes, on_success],
                      [errors, on_error],
                      [notifies, on_notify] ], function (pair) {
                var fn = pair[1];
                if (isFunction(fn)) {
                  pair[0].push(fn);
                }
              });
              return defd.promise;
            },
            'resolve': function () {
              var args = arguments;
              wasSuccess = true;
              complete = true;
              completed = args;
              safeEach(successes, function (on_success) {
                safeApply(on_success, args);
              });
              safeEach(children, function (child) {
                safeApply(child.resolve, args);
              });
            },
            'notify': function () {
              var args = arguments;
              safeEach(notifies, function (on_notify) {
                safeApply(on_notify, args);
              });
              safeEach(children, function (child) {
                safeApply(child.notify, args);
              });
            },
            'reject': function () {
              var args = arguments;
              wasSuccess = false;
              complete = true;
              completed = args;
              safeEach(errors, function (on_error) {
                safeApply(on_error, args);
              });
            }
          };
        },
        child = function (context) {
          var deferred = deferred();
          context.method = 'child';
          return defd.promise;
        },
        set = function (context) {
          var defd = deferred(),
            ref = firebase[[context.firebase, context.database, context.store].join('/')].child(context.primary_key);
          context.method = 'set';
          ref.set(context.entry, function (err) {
            if (that.err, null) {
              defd.resolve(context.entry);
            } else {
              defd.reject(err);
            }
          });
          return defd.promise;
        },
        update = function (context) {
          var defd = deferred(),
            ref = firebase[[context.firebase, context.database, context.store].join('/')].child(context.primary_key);
          context.method = 'update';
          ref.update(context.entry, function () {
            if (that.err, null) {
              defd.resolve(context.entry);
            } else {
              defd.reject(err);
            }
          });
          return defd.promise;
        },
        remove = function (context) {
          var defd = deferred(),
            ref = firebase[[context.firebase, context.database, context.store].join('/')].child(context.primary_key);
          context.method = 'remove';
          ref.remove(function () {
            if (that.err, null) {
              defd.resolve(context.entry);
            } else {
              defd.reject(err);
            }
          });
          return defd.promise;
        },
        whichMethod = function (signature) {
          if (that.contains(['get.entry', 'get.entries', 'get.index', 'get.database', 'get.store'], signature)) {
            return 'child';
          } else if (that.contains(['remove.entry', 'remove.entries', 'remove.index', 'remove.database', 'remove.store'], signature)) {
            return 'remove';
          } else if (that.contains(['add.entry'], signature)) {
            return 'set';
          } else if (that.contains(['update.entry', 'update.entries'], signature)) {
            return 'update';
          } else {
            return null;
          }
        },
        scripts = ( !! environment.document) ? environment.document.getElementsByTagName("script") : [],
        libraryScript = scripts[scripts.length - 1] || null,
        libraryPath = (null !== libraryScript && null === libraryScript.src.match(/chrome-extension/)) ? libraryScript.src : null,
        workerEnvironment = null !== environment.constructor.toString().match(/WorkerGlobalScope/),
        worker = workerEnvironment ? null : new Worker(libraryPath),
        workQueue = {},
        firebase = {},
        workRegister = function (worker, message, context, success, error, notify) {
          var id = that.random(),
            callback = function (e) {
              var data = e.data,
                queued = workQueue[data.uid];
              if (undefined !== queued) {
                switch (e.data.type) {
                case 'success':
                  delete workQueue[data.uid];
                  worker.removeEventListener('message', callback);
                  that.apply(success, [data]);
                  break;
                case 'error':
                  delete workQueue[data.uid];
                  worker.removeEventListener('message', callback);
                  that.apply(error, [data]);
                  break;
                case 'abort':
                  that.apply(notify, [data]);
                  break;
                default:
                  break;
                }
              }
            },
            clean = function (obj) {
              if (that.isFunction(obj)) {
                return undefined;
              } else if (that.isObject(obj)) {
                that.iterate(obj, function (key, val) {
                  obj[key] = clean(val);
                });
              } else if (that.isArray(obj)) {
                that.each(obj, function (v, i) {
                  obj[i] = clean(v);
                });
              }
              return obj;
            };
          workQueue[id] = {
            success: success,
            error: error,
            notify: notify
          };
          worker.addEventListener('message', callback);
          worker.postMessage({
            method: message,
            context: clean(context),
            uid: id
          });
          return id;
        },
        workDispatch = function (message, context) {
          var defd = deferred(),
            callbacks = {
              on_success: context.on_success,
              on_error: context.on_error,
              on_abort: context.on_abort,
              on_complete: context.on_complete,
              on_upgrade_needed: context.on_upgrade_needed,
              on_blocked: context.on_blocked,
              on_close: context.on_close
            },
            getData = function (data) {
              if (that.isObject(data)) {
                that.iterate(callbacks, function (key, val) {
                  if ( !! val) {
                    data[key] = val;
                  }
                });
              }
              return data;
            };
          that.iterate(callbacks, function (key, val) {
            delete context[key];
          });
          workRegister(worker, message, context, function (data) {
            var add_ctx = that.clone(context);
            add_ctx.data = data.context.entry;
            add_ctx.firebaseing = true;
            that.api.add.entry(add_ctx)(function (added_ctx) {
              delete added_ctx.firebaseing;
              defd.resolve(getData(added_ctx));
            }, function (added_ctx) {
              delete added_ctx.firebaseing;
              defd.reject(getData(added_ctx));
            }, function (added_ctx) {
              delete added_ctx.firebaseing;
              defd.notify(getData(added_ctx));
            })
          }, function (data) {
            defd.reject(getData(data));
          }, function (data) {
            defd.notify(getData(data));
          });
          return defd.promise;
        };
        if (true === workerEnvironment) {
          importScripts('https://cdn.firebase.com/js/client/1.0.6/firebase.js');
          console.log('firebase', Firebase);
          environment.addEventListener('message', function (e) {
            var input = e.data,
              method = input.method,
              value = input.value,
              key = input.key,
              context = input.context,
              params = context.params,
              expires = input.expires,
              end = function (ctx) {
                ctx.type = ctx.type || 'success';
                environment.postMessage(ctx);
              },
              callback = function (sig) {
                return function (data, error) {
                  delete input.context.callback;
                  if ( !! error) {
                    input.context.error = error;
                    input.context.message = data;
                    input.type = 'error';
                  } else {
                    input.context.entry = data;
                  }
                  end(input);
                }
              };
            if ('undefined' === typeof firebase[input.context.firebase]) {
              firebase[input.context.firebase] = new Firebase([context.firebase, context.database, context.store].join('/'));
            }
            if ('set' === method || 'update' === method || 'remove' === method || 'child' === method) {
              context.callback = callback(method);
              if (method === 'set') {
                set(context);
              } else if (method === 'child') {
                child(context);
              } else if (method === 'update') {
                update(context);
              } else if (method === 'remove') {
                remove(context);
              }
            } else {
              input.type = 'error';
              end({
                type: 'abort',
                context: input,
                error: 'No such method'
              });
            }
          }, false);
        } else {
          return [function (state) {
            that = this;
            if (this.isEmpty(state.context.firebase) || this.exists(state.context.firebaseing)) {
              return state;
            }
            if (this.is(state.context.sync, true)) {
              var promise = state.promise,
                outward = this.deferred(),
                inward,
                update = false,
                args;
              if (this.contains(['add.entry', 'update.entry', 'update.entries', 'remove.entry', 'remove.entries'], state.method)) {
                if (this.contains(['notify', 'resolve'], state.type)) {
                  update = true;
                }
              } else {
                if ((this.is('error', state.type) || (this.isEmpty(state.context.entry) && this.contains(['get.entry', 'get.entries'], state.method))) && (this.is(state.context.firebase, true) || this.is(state.context.fallback, true))) {
                  update = true;
                }
              }
              if (update) {
                state.promise = outward.promise;
                inward = workDispatch(whichMethod(state.method), state.context);
                inward(function (ctx2) {
                  state.context = ctx2;
                  state.type = 'resolve';
                  outward.resolve(state.context);
                }, function (ctx2) {
                  state.context = ctx2;
                  state.type = 'error';
                  outward.reject(state.context);
                }, function (ctx2) {
                  state.type = 'notify';
                  state.context = ctx2;
                  outward.notify(state.context);
                });
              }
            }
            return state;
          }, function (state) {
            if (this.isEmpty(state.context.firebase) || this.exists(state.context.firebaseing)) {
              return state;
            }
            var promise = state.promise,
              outward = this.deferred(),
              inward,
              update = false,
              args;
            if (this.contains(['add.entry', 'update.entry', 'update.entries', 'remove.entry', 'remove.entries'], state.method)) {
              if (this.contains(['notify', 'resolve'], state.type)) {
                update = true;
              }
            } else {
              if ((this.is('error', state.type) || (this.isEmpty(state.context.entry) && this.contains(['get.entry', 'get.entries'], state.method))) && (this.is(state.context.firebase, true) || this.is(state.context.fallback, true))) {
                update = true;
              }
            }
            if (update) {
              state.promise = outward.promise;
              inward = workDispatch(whichMethod(state.method), state.context);
              inward(function (ctx2) {
                state.context = ctx2;
                state.type = 'resolve';
                outward.resolve(state.context);
              }, function (ctx2) {
                state.context = ctx2;
                state.type = 'error';
                outward.reject(state.context);
              }, function (ctx2) {
                state.type = 'notify';
                state.context = ctx2;
                outward.notify(state.context);
              });
            }
            return state;
          }];
        }
      }(self));