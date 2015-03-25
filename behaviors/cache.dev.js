
self.dashCache = self.dashCache || (function(environment) {
    "use strict";
    var that,
        cache = {},
        set = function(request) {
            var key = request.key || null,
                value = request.value || null,
                expires = request.expires || 3000 //in millisecons
                ,
                current_date = new Date(),
                timestamp = (current_date.getTime() + expires);
            if ('undefined' === typeof key || null === key) {
                return;
            }
            cache = cache || {};
            cache[key] = {
                data: value,
                expire: timestamp
            };
            return cache[key].data;
        },
        get = function(request) {
            cache = cache || {};
            var key = request.key || '';
            if ('undefined' === typeof key || null === key) {
                return null;
            }
            if (cache[key]) {
                if (cache[key].expire > new Date().getTime()) {
                    cache[key].data = cache[key].data || {};
                    return cache[key].data;
                }
                delete cache[key];
            }
            return null;
        },
        zap = function(request) {
            cache = cache || {};
            var key = request.key || '',
                temp, keys = key.split('.'),
                result;
            if ('undefined' === typeof key || null === key) {
                return;
            }
            result = cache[key];
            delete cache[key];
            return result;
        },
        buildKey = function(key_ctx, type) {
            var key = [key_ctx.database, key_ctx.store, key_ctx.index, key_ctx.key, key_ctx.primary_key, key_ctx.limit].reduce(function(acc, current) {
                acc = acc || [];
                if (!!current) {
                    acc = [acc, current].join('.');
                }
                return acc;
            });
            return key;
        },
        workerEnvironment = null !== environment.constructor.toString().match(/WorkerGlobalScope/),
        worker,
        workQueue = {},
        workRegister = function(worker, message, context, success, error, notify) {
            var id = that.random(),
                callback = function(e) {
                    var data = e.data,
                        queued = workQueue[data.uid];
                    if (undefined !== queued) {
                        switch (e.data.type) {
                            case 'success':
                                delete workQueue[data.uid];
                                worker.removeEventListener('message', callback);
                                that.apply(success, [data.context]);
                                break;
                            case 'error':
                                delete workQueue[data.uid];
                                worker.removeEventListener('message', callback);
                                that.apply(error, [data.context]);
                                break;
                            case 'abort':
                                that.apply(notify, [data.context]);
                                break;
                            default:
                                break;
                        }
                    }
                },
                clean = function(obj) {
                    if (that.isFunction(obj)) {
                        return undefined;
                    } else if (that.isObject(obj)) {
                        that.iterate(obj, function(key, val) {
                            obj[key] = clean(val);
                        });
                    } else if (that.isArray(obj)) {
                        that.each(obj, function(v, i) {
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
            if (!!worker) {
                worker.addEventListener('message', callback);
                worker.postMessage({
                    method: message,
                    context: clean(context),
                    uid: id
                });
            } else {
                throw new Error('non-Worker interface not yet implemented');
            }
            return id;
        },
        workDispatch = function(message, context) {
            var defd = that.deferred(),
                callbacks = {
                    on_success: context.on_success,
                    on_error: context.on_error,
                    on_abort: context.on_abort,
                    on_complete: context.on_complete,
                    on_upgrade_needed: context.on_upgrade_needed,
                    on_blocked: context.on_blocked,
                    on_close: context.on_close
                },
                getData = function(data) {
                    if (that.isObject(data)) {
                        that.iterate(callbacks, function(key, val) {
                            data[key] = val;
                        });
                    }
                    return data;
                };
            that.iterate(callbacks, function(key, val) {
                delete context[key];
            });
            workRegister(worker, message, context, function(data) {
                defd.resolve(getData(data));
            }, function(data) {
                defd.reject(getData(data));
            }, function(data) {
                defd.notify(getData(data));
            });
            return defd.promise;
        };

    if (true === workerEnvironment) {
        environment.addEventListener('message', function(e) {
            var input = e.data,
                method = input.method,
                value = input.value,
                key = input.key,
                context = input.context,
                expires = input.expires,
                prune = function(obj) {
                    var isReducible = function(input) {
                            var attrs = 0,
                                attr;
                            if (undefined === input || null === input || 'string' === typeof input || 'number' === typeof input || 'function' === typeof input.slice) {
                                return false;
                            }
                            for (attr in input) {
                                if (true === input.hasOwnProperty(attr)) {
                                    attrs += 1;
                                }
                            }
                            return (attrs >= 1) ? true : false;
                        },
                        reduce = function(input) {
                            var attrs = {},
                                attr;
                            for (attr in input) {
                                if (true === input.hasOwnProperty(attr)) {
                                    if (!!input[attr] && !!input[attr].expire && (input[attr].expire < new Date().getTime())) {
                                        //skip
                                    } else if (isReducible(input[attr])) {
                                        attrs[attr] = reduce(input[attr]);
                                    } else {
                                        attrs[attr] = input[attr];
                                    }
                                }
                            }
                            return attrs
                        };
                    return reduce(obj);
                },
                end = function(ctx) {
                    input.context = ctx;
                    input.type = 'success';
                    environment.postMessage(input);
                    setTimeout(function() {
                        cache = prune(cache);
                    });
                };
            if (method === 'get' || method === 'set' || method === 'delete') {
                if (method === 'get') {
                    end(get(context));
                } else if (method === 'set') {
                    end(set(context));
                } else if (method === 'delete') {
                    end(zap(context));
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
        return function(libraryPath) {
            worker = !!workerEnvironment && !!libraryPath && null !== libraryPath.match(/cache/) ? new Worker(libraryPath) : null,
            return [function(state) {
                that = this;
                if (this.isEmpty(state.context.cache)) {
                    return state;
                }
                var promise = state.promise,
                    outward = this.deferred(),
                    inward,
                    response,
                    callbacks = {
                        on_success: state.context.on_success,
                        on_error: state.context.on_error,
                        on_abort: state.context.on_abort,
                        on_complete: state.context.on_complete,
                        on_upgrade_needed: state.context.on_upgrade_needed,
                        on_blocked: state.context.on_blocked,
                        on_close: state.context.on_close
                    }
                if (this.contains(['get.entry'], state.method)) {
                    inward = workDispatch('get', {
                        key: buildKey(state.context)
                    });
                    inward(function(response) {
                        if (that.isEmpty(response)) {
                            state.context.cached = false;
                        } else {
                            state = response;
                            state.promise = outward.promise;
                            state.context.cached = true;
                            that.iterate(callbacks, function(key, val) {
                                if (!that.isEmpty(val)) {
                                    state.context[key] = val;
                                }
                            });
                            state.type = 'resolve';
                            outward.resolve(state);
                        }
                    });
                }
                return state;
            }, function(state) {
                that = this;
                if (this.is(state.context.cached, true) || this.is(state.context.cache, false)) {
                    return state;
                }
                var promise = state.promise,
                    outward = this.deferred(),
                    inward,
                    response,
                    args;
                if (this.contains(['resolve', 'error'], state.type)) {
                    state.promise = outward.promise;
                    args = {
                        key: buildKey(state.context, state.type)
                    };
                    if (!this.isEmpty(state.context.purge) || this.contains(['remove.entry', 'remove.entries', 'remove.index', 'remove.store', 'remove.database'], state.method)) {
                        inward = workDispatch('zap', args);
                    } else {
                        args.expires = state.context.expires || 3000;
                        args.value = state;
                        inward = workDispatch('set', args);
                    }
                    inward(function(ctx2) {
                        outward.resolve(ctx2);
                    });
                }
                return state;
            }];
        };
    }
}(self));