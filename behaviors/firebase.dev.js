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
        notSame = function(a, b) {
          if ( that.isArray(a) ) {
            a = a.join('');
          }
          if ( that.isArray(b) ) {
            b = b.join('');
          }
          a = a ? a.toString() : a;
          b = b ? b.toString() : b;
          return that.isnt(a, b);
        },
        difference = function(one, two, shallow) {
          var diff = {};
          one = one || {};
          two = two || {};
          if (that.isObject(one)) {
            that.iterate(one, function(key, val) {
              if (notSame(val, two[key])) {
                if ( that.isEmpty(val) || that.isEmpty(one[key])) {
                  diff[ key ] = [val, one[key]];
                } else if ( that.isnt(shallow, true) && ( ( that.exists(two[key]) && that.isObject(two[key]) ) || that.isObject(val))) {
                  diff[ key ] = difference(val, two[key], shallow);
                } else {
                  diff[ key ] = [val, two[key]];
                }
              }
            });
          } else if (that.isArray(one)) {
            if (that.isArray(two)) { 
              that.each(one, function(val, i) {
                diff[ i ] = diff[ i ] || [];
                if ( that.isEmpty(val) || that.isEmpty(two[i])) {
                  diff[ key ] = [val, two[i]];
                } if ( that.isnt(shallow, true) && (that.exists(one[i]) && that.isObject(one[i]) ) || that.isObject(val) ) {
                  diff[i] = difference(val, two[i], shallow);
                } else {
                  diff[i] = [one[i], val];
                }
              });
            }     
          }
          if (that.isObject(two)) {
            that.iterate(two, function(key, val) {
              if (notSame(val, one[key]) && that.isEmpty(one[ key ])) {
                if ( that.isEmpty(val) || that.isEmpty(two[key])) {
                  diff[ key ] = [val, two[key]];
                } if ( that.isnt(shallow, true) && (that.exists(one[key]) && that.isObject(one[key]) ) || that.isObject(val) ) {
                  diff[ key ] = difference(one[key], val, shallow);
                } else {
                  diff[ key ] = [one[key], val];
                }
              }
            });
          } else if (that.isArray(two)) {
            if (that.isArray(two)) { 
              that.each(two, function(val, i) {
                diff[ i ] = diff[ i ] || [];
                if ( that.isEmpty(val) || that.isEmpty(one[i])) {
                  diff[ i ] = [val, one[i]];
                } if ( that.isnt(shallow, true) && (that.exists(one[i]) && that.isObject(one[i]) ) || that.isObject(val) ) {
                  diff[ i ] = difference(one[i], val, shallow);
                } else {
                  diff[ i ] = [one[i], val];
                }
              });
            }     
          }
          return diff;
        },
        child = function (context) {
          var defd = deferred(),
            key = context.entry && !!context.entry[context.objectstore.keyPath] ? context.entry[context.objectstore.keyPath] : ( context.primary_key || context.key ),
            ref = firebase[[context.firebase, context.database, context.store].join('/')].child(key);
          context.method = 'child';
          ref.on('value', function (snapshot) {
            var value = snapshot.val();
            defd.resolve(value);
          });
          return defd.promise;
        },
        set = function (context) {
          var defd = deferred(),
            key = context.entry && !!context.entry[context.objectstore.keyPath] ? context.entry[context.objectstore.keyPath] : ( context.primary_key || context.key ),
            ref = firebase[[context.firebase, context.database, context.store].join('/')].child(key);
          context.method = 'set';
          ref.set(context.data, function (err) {
            if (!err) {
              defd.resolve(context.data);
            } else {
              defd.reject(err);
            }
          });
          return defd.promise;
        },
        update = function (context) {
          var defd = deferred(),
            key = context.entry && !!context.entry[context.objectstore.keyPath] ? context.entry[context.objectstore.keyPath] : ( context.primary_key || context.key ),
            ref = firebase[[context.firebase, context.database, context.store].join('/')].child(key);
          context.method = 'update';
          ref.update(context.entry, function (err) {
            if (!err) {
              defd.resolve(context.entry);
            } else {
              defd.reject(err);
            }
          });
          return defd.promise;
        },
        remove = function (context) {
          var defd = deferred(),
            key = context.entry && !!context.entry[context.objectstore.keyPath] ? context.entry[context.objectstore.keyPath] : ( context.primary_key || context.key ),
            ref = firebase[[context.firebase, context.database, context.store].join('/')].child(key);
          context.method = 'remove';
          ref.remove(function (err) {
            if (!err) {
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
            return 'child';
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
        workRegister = function (worker, message, context, success, error, notify, signature, type) {
          var id = that.random(),
            callback = function (e) {
              var data = e.data,
                queued = workQueue[data.uid];
              data.method = signature;
              if (undefined !== queued) {
                switch (e.data.type) {
                case 'success':
                  data.type = type;
                  delete workQueue[data.uid];
                  worker.removeEventListener('message', callback);
                  that.apply(success, [data]);
                  break;
                case 'error':
                  data.type = type;
                  delete workQueue[data.uid];
                  worker.removeEventListener('message', callback);
                  that.apply(error, [data]);
                  break;
                case 'abort':
                  data.type = type;
                  that.apply(notify, [data]);
                  break;
                default:
                  data.type = type;
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
        workDispatch = function (message, context, signature, type) {
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
            defd.resolve(getData(data));
          }, function (data) {
            defd.reject(getData(data));
          }, function (data) {
            defd.notify(getData(data));
          }, signature, type);
          return defd.promise;
        };
        if (true === workerEnvironment) {
          importScripts('https://cdn.firebase.com/js/client/1.0.6/firebase.js');
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
              promise;
            if ('undefined' === typeof firebase[ [ context.firebase, context.database, context.store].join('/') ] ) {
              firebase[[context.firebase, context.database, context.store].join('/')] = new Firebase([context.firebase, context.database, context.store].join('/'));
            }
            if ('set' === method || 'update' === method || 'remove' === method || 'child' === method) {
              if (method === 'set') {
                promise = set(context);
              } else if (method === 'child') {
                promise = child(context);
              } else if (method === 'update') {
                promise = update(context);
              } else if (method === 'remove') {
                promise = remove(context);
              }
              input.context.local = input.context.entry;
              promise(function(entry) {
                input.type = 'success';
                input.context.remote = entry;
                end(input);
              }, function(entry) {
                input.type = 'error';
                input.context.remote = entry;
                end(input);
              }, function(ctx3) {
                input.type = 'abort';
                end(input);
              });
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
          return [null, function (state) {
            that = this;
            if (this.isEmpty(state.context.firebase) || this.is(state.context.firerebasing, true) || this.exists(state.context.firebaseing) || (this.is(state.context.sync, false) || this.isnt(state.context.sync, true)))  {
              return state;
            }
            var promise = state.promise,
              outward = this.deferred(),
              inward,
              update = false,
              args, 
              diff,
              finalized = {},
              remote = {},
              local = {},
              local_diff,
              remote_diff,
              dirty_remote = false,
              dirty_local = false,
              copy;
            if (this.contains(['add.entry', 'update.entry', 'update.entries', 'remove.entry', 'remove.entries'], state.method)) {
              if (this.contains(['notify', 'resolve'], state.type)) {
                update = true;
              }
            } else {
              if ((this.is('error', state.type) || (!this.isEmpty(state.context.entry) && this.contains(['get.entry', 'get.entries'], state.method))) && (this.is(state.context.firebase, true) || this.is(state.context.sync, true))) {
                update = true;
              }
            }
            if (update) {
              state.promise = outward.promise;
              inward = workDispatch(whichMethod(state.method), state.context, state.method, state.type);
              inward(function (ctx2) {
                state.context = ctx2.context;
                state.type = 'resolve';
                if (that.contains(['get.entry'], state.method)) {
                  diff = difference(ctx2.context.entry, ctx2.context.remote, true);
                  if (!that.isEmpty(diff)) {
                    if (that.is(ctx2.context.cautious, true)) {
                      state.context.conflict = diff;
                    } else {
                      ctx2.context.entry = that.clone(ctx2.context.entry);
                      ctx2.context.remote = that.clone(ctx2.context.remote);
                      local = that.clone(ctx2.context.entry);
                      remote = that.clone(ctx2.context.remote);

                      if (that.is(ctx2.context.merge, true)) {
                        if (that.is(ctx2.context.ours, true)) {
                          that.iterate(local, function(key, val) {
                            remote[key] = that.clone(val);
                          });
                        } else {
                          that.iterate(remote, function(key, val) {
                            local[key] = that.clone(val);
                          });
                        }
                      } else {
                        if (that.is(ctx2.context.ours, true)) {
                          remote = that.clone(local);
                        } else {
                          local = that.clone(remote);
                        }
                      }
                      local_diff = difference(local, ctx2.context.entry);
                      remote_diff = difference(remote, ctx2.context.remote);
                      state.context.merged = diff;
                      if (!that.isEmpty(local_diff)) {
                        dirty_local = true;
                      }
                      if (!that.isEmpty(remote_diff)) {
                        dirty_remote = true;
                      }
                    }
                  }
                } else if (that.contains(['add.entry'], state.method)) {
                    console.log("statestate",state);
                  delete state.context.firerebasing;
                  var addpro = workDispatch('update', state.context, ctx2.method, state.type);
                  addpro(function(ctx3) {
                    console.log("CTX3",ctx3);
                    diff = difference(ctx2.context.entry, ctx2.context.remote, true);
                    if (!that.isEmpty(diff)) {
                      console.log("ADDING MERGE CONF",diff);
                    }
                    return ctx3;
                  }, function(ctx3) {
                    //
                    return ctx3;
                  }, function(ctx3) {
                    //
                    return ctx3;
                  });
                }

                if (that.is(dirty_local,true)||that.is(dirty_remote,true)) {
                  var deff = deferred(),
                    prev = state.promise,
                    pro = deff.promise;
                  if (dirty_local) {
                    state.context.entry = local;
                    var localdef = deferred(),
                        localpro = pro;
                    pro = localdef.promise;
                    localpro(function(ctx2) {
                      var extra = that.clone(ctx2.context),
                          update_pro;
                      extra.data = that.clone(local);
                      delete extra.key;
                      extra.firerebasing = true;
                      update_pro = that.api.update.entry(extra);
                      update_pro(function(ctx3) {
                        localdef.resolve(ctx3);
                      }, function(ctx3) {
                        localdef.reject(ctx3);
                      }, function(ctx3) {
                        localdef.notify(ctx3);
                      });
                    });
                  }
                  if (dirty_remote) {
                    state.context.remote = remote;
                    var remotedef = deferred(),
                        remotepro = pro;
                    pro = remotedef.promise;
                    remotepro(function(ctx2) {
                      var extra = that.clone(ctx2.context),
                          update_pro;
                      extra.firerebasing = true;
                      update_pro = workDispatch('update', extra, ctx2.method, ctx2.type);
                      update_pro(function(ctx3) {
                        console.log('firebase updated',ctx3);
                        remotedef.resolve(ctx3);
                      }, function(ctx3) {
                        remotedef.reject(ctx3);
                      }, function(ctx3) {
                        remotedef.notify(ctx3);
                      });
                    });
                  } 
                  pro(function(ctx2) {
                    outward.resolve(ctx2);
                  },function(ctx2) {
                    outward.reject(ctx2);
                  },function(ctx2) {
                    outward.notify(ctx2);
                  });
                  deff.resolve(state);
                } else {
                  outward.resolve(state);
                }
              }, function (ctx2) {
                state.context = ctx2.context;
                state.type = 'error';
                outward.reject(state);
              }, function (ctx2) {
                state.type = 'notify';
                state.context = ctx2.context;
                outward.notify(state);
              });
            }
            return state;
          }];
        }
      }(self));