/* Documentation -> http://dashdb.com
 * Repo -> http://github.com/editor/dash
 * License -> MIT
 * Author -> Taylor Buley (@taylorbuley)
 * Copyright -> (c) 2011-2014 Buley LLC
 */
var dash = (function (environment) {

  'use strict';

  var scripts = ( !! environment.document) ? environment.document.getElementsByTagName("script") : [],
    libraryScript = scripts[scripts.length - 1] || null,
    libraryPath =( null !== libraryScript && null === libraryScript.src.match(/chrome-extension/) ) ? libraryScript.src : null,
    database = {},
    databases = {},
    store = {},
    stores = {},
    index = {},
    indexes = {},
    range = {},
    entry = {},
    entries = {},
    behavior = {},
    db = environment.indexedDB || indexedDB,
    kr = environment.IDBKeyRange || IDBKeyRange,
    sl = environment.DOMStringList || (self ? Array : DOMStringList),
    workerEnvironment = null !== environment.constructor.toString().match(/WorkerGlobalScope/),
    webkitEnvironment = !! db.webkitGetDatabaseNames,
    workerPresent = !! self.Worker,
    /* This method copies an object by value (deeply) */
    //warning: recursive
    clone = function (obj) {
      var clo = {},
          key;
      if (isFunction(obj)) {
          clo = function() { return obj.apply(this, arguments); };
          for(key in obj) {
              if (obj.hasOwnProperty(key)) {
                  clo[key] = obj[key];
              }
          }
          return clo;
      }
      if (isNumber(obj)) {
        return parseInt(obj, 10);
      }
      if (isArray(obj)) {
        obj = obj.slice(0);
        safeEach(obj, function(obji, i) {
          obj[i] = clone(obji);
        });
        return obj;
      }
      if (!isObject(obj)) {
        return obj;
      }
      safeIterate(obj, function (x, val) {
        if (isObject(val) && !isFunction(val) && !isArray(val)) {
          clo[x] = clone(val);
        } else {
          clo[x] = val;
        }
      });
      return clo;
    },
    /* This method returns a new object with
     * the provided attributes "plucked" from
     * another object */
    pluck = function(fields, from) {
      var obj = {};
      if (isArray(fields)) {
        safeEach(fields, function(field) {
            obj[ field ] = clone(from[ field ]);
        });
      } else {
        safeIterate(fields, function(field) {
            obj[ field ] = clone(from[ field ]);
        });
      }
      return obj;
    },
    cloneError = function(err) {
      return pluck( ['message', 'name' ], err );
    },
    /* This method checks whether a variable has a value */
    isEmpty = function (mixed_var) {
      if (isObject(mixed_var)) {
        var count = 0;
        safeIterate(mixed_var, function() {
          count += 1;
        });
        if (is(count,0)) {
          return true;
        }
      }
      return (isnt(mixed_var, undefined) && isnt(mixed_var, null) && isnt(mixed_var, "") && (!isArray(mixed_var) || mixed_var.length > 0)) ? false : true;
    },
    /* This method maybe applys a `fn` */
    //warning: recursive
    safeApply = function (fn, args, context, err) {
      if (isFunction(fn)) {
        return fn.apply(context || {}, args || []);
      }
      if (isFunction(err)) {
        return safeApply(err, []);
      }
    },
    /* This method returns the inverse of isEmpty(mixed_var) */
    exists = function (mixed_var) {
      return (isEmpty(mixed_var)) ? false : true;
    },
    is = function (a, b) {
      return b === a;
    },
    detach = function (args_ctx) {
      var obj = {};
      safeEach(validAttrs, function (k) {
        if (exists(args_ctx[k])) {
          obj[k] = args_ctx[k];
        }
      });
      return obj;
    },
    isnt = function (a, b) {
      return b !== a;
    },
    //arraylike works (e.g. DOMStringList)
    isArray = function (mixed_var) {
      var result = false;
      if (mixed_var instanceof Array || mixed_var instanceof sl) {
        result = true;
      }
      return result;
    },
    isBoolean = function (mixed_var) {
      return (isType("boolean", mixed_var) || is(mixed_var, 'true') || is(mixed_var, 'false')) ? true : false;
    },
    isRegEx = function (mixed_var) {
      return isFunction(mixed_var.constructor) && null !== mixed_var.constructor.toString().match(/RegExp/);
    },
    isFunction = function (mixed_var) {
      return isType("function", mixed_var);
    },
    isObject = function (mixed_var) {
      return isnt(mixed_var, null) && isnt(mixed_var, undefined) && isType("object", mixed_var) && is("[object Object]", mixed_var.toString());
    },
    isNumber = function (mixed_var) {
      return (isType("number", mixed_var) || is(isNaN(parseInt(mixed_var, 10), false))) ? true : false;
    },
    isString = function (mixed_var) {
      return isType("string", mixed_var);
    },
    isType = function (str, mixed_var) {
      return is(str, typeof mixed_var);
    },
    randomId = function(len, charset) {
      var random = charset || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        count = len || 16,
        x = 0,
        xlength = 0,
        strlen = random.length,
        str = [];
      for (x = 0; x < count; x += 1) {
        str.push(random[Math.floor(Math.random() * 100) % strlen]);
      }
      return str.join('');
    },
    /* This method safely iterates through an array */
    safeEach = function (items, callback, inc) {
      var x,
        count = items ? items.length : 0;
      inc = inc || 1;
      for (x = 0; x < count; x += inc) {
        safeApply(callback, [items[x], x]);
      }
    },
    /* This method safely iterates through an object */
    safeIterate = function (item, callback) {
      var attr;
      for (attr in item) {
        if (item.hasOwnProperty(attr)) {
          callback(attr, item[attr]);
        }
      }
    },
    deferred = function () {
      var complete = false,
        wasSuccess = null,
        completed = [],
        children = [],
        notifies = [],
        successes = [],
        errors = [];
      return {
        'promise': function (on_success, on_error, on_notify) {
          var defd = deferred();
          children.push(deferred);
          if (is(complete, true)) {
            safeApply(wasSuccess ? on_success : on_error, completed);
          } 
          safeEach([
          [successes, on_success],
          [errors, on_error],
          [notifies, on_notify]
        ], function (pair) {
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
    /* This method determines whether a given `haystack` contains a `needle` */
    contains = function (haystack, needle, use_key) {
      var result = false;
      if (exists(haystack)) {
        if (isObject(haystack)) {
          safeIterate(haystack, function (key, value) {
            if ((is(use_key, true) && is(key, needle)) || is(value, needle)) {
              result = true;
            }
          });
        } else if (isArray(haystack)) {
          safeEach(haystack, function (value, key) {
            if ((is(use_key, true) && is(key, needle)) || is(value, needle)) {
              result = true;
            }
          });
        }
        
      }
      return result;
    },
    standardCallbackNames = ['on_success', 'on_error', 'on_abort', 'on_blocked', 'on_upgrade_needed', 'on_close', 'on_complete'],
    reservedAttrs = [
      'amount',
      'databases',
      'db',
      'entry',
      'entries',
      'idx',
      'error',
      'indexes',
      'key',
      'last_entry',
      'last_key',
      'last_primary_key',
      'primary_key',
      'new_version',
      'objectstore',
      'old_version',
      'stores',
      'value'
    ],
    validAttrs = [
      'auto_increment',
      'callback',
      'data',
      'database',
      'direction',
      'duplicates',
      'index',
      'index_key_path',
      'index_multi_entry',
      'index_unique',
      'key_path',
      'limit',
      'multi_entry',
      'skip',
      'store',
      'store_key_path',
      'unique',
      'version'
    ],
    //TODO: Why isn't this yet refactored out
    detachedAttributes = [
     'database',
     'store',
     'version',
     'store_key_path',
     'unique',
     'multi_entry',
     'data',
     'auto_increment',
     'on_complete',
     'on_error',
     'on_success',
     'on_abort',
     'key',
     'index',
     'index_key_path',
     'index_multi_entry',
     'index_unique',
     'limit',
     'skip'
    ],
    detachContext = function (context) {
      var detached = {};
      safeEach(detachedAttributes, function (detachable) {
        if (exists(context[detachable])) {
          detached[detachable] = context[detachable];
        }
      });
      return detached;
    },
    addAttribute = function (attrs) {
      var add = function (item) {
        if (false === contains(validAttrs, item)) {
          validAttrs.push(item);
        }
        if (false === contains(detachedAttributes, item)) {
          detachedAttributes.push(item);
        }
      };
      if (isArray(attrs)) {
        safeEach(attrs, function (obj) {
          add(obj);
        });
      } else {
        add(attrs);
      }
    },
    parseResults = function (results_ctx, methodname) {
      var obj = {},
        toArray = function (list) {
          var copied = [];
          safeEach(list, function (el) {
            copied.push(el);
          });
          return copied;
        };
      safeEach(validAttrs, function (k) {
        if (exists(results_ctx[k])) {
          if (is(k, 'db')) {
            obj[k] = providerCache({
              name: results_ctx[k].name,
              version: results_ctx[k].version,
              objectStoreNames: toArray(results_ctx[k].objectStoreNames)
            }, 'database', results_ctx);
          } else if (is(k, 'objectstore')) {
            obj[k] = providerCache({
              name: results_ctx[k].name,
              indexNames: toArray(results_ctx[k].indexNames),
              autoIncrement: results_ctx[k].autoIncrement,
              keyPath: results_ctx[k].keyPath
            }, 'store', results_ctx);
          } else if (is(k, 'idx')) {
            obj[k] = providerCache({
              name: results_ctx[k].name,
              multiEntry: results_ctx[k].multiEntry,
              unique: results_ctx[k].unique,
              keyPath: results_ctx[k].keyPath
            }, 'index', results_ctx);
          } else if (is(k, 'indexes') || is(k, 'stores') || is(k, 'databases')) {
            obj[k] = toArray(results_ctx[k]);
          } else {
            obj[k] = results_ctx[k];
          }
        }
      });
      if (is(transactionType(methodname), "versionchange")) {
        providerUncache(results_ctx);
      }
      return obj;
    },
    transactionType = function (method) {
      if (contains(['add.index', 'remove.index', 'add.store', 'remove.store'], method)) {
        return "versionchange";
      }
      if (contains(['get.entry', 'get.entries'], method)) {
        return "readonly";
      }
      return "readwrite";
    },
    standardCursor = function (cursor_ctx, getRequest) {
      var decorate = function (event) {
        cursor_ctx.event = event;
        return cursor_ctx;
      },
        request,
        count = 0,
        limit = cursor_ctx.limit,
        skip = cursor_ctx.skip,
        finish = function (e) {
          cursor_ctx.cursor = request.result;
          cursor_ctx = decorate(e);
          cursor_ctx.last_key = cursor_ctx.key;
          delete cursor_ctx.key;
          cursor_ctx.last_primary_key = cursor_ctx.primary_key;
          delete cursor_ctx.primary_key;
          cursor_ctx.last_entry = cursor_ctx.entry;
          delete cursor_ctx.entry;
          delete cursor_ctx.direction;
          if (cursor_ctx.last_entry instanceof IDBOpenDBRequest) {
            delete cursor_ctx.last_entry;
          }
          cursor_ctx.db.close();
          complete(cursor_ctx);
        };
      cursor_ctx.direction = cursor_ctx.direction || exists(cursor_ctx) && is(false, cursor_ctx.duplicates) ? 'nextunique' : 'next';
      cursor_ctx.range = cursor_ctx.range || range.get(cursor_ctx);
      if (exists(cursor_ctx.data)) {
        cursor_ctx.data = isFunction(cursor_ctx.data) ? cursor_ctx.data() : clone(cursor_ctx.data);
      }
      if (isEmpty(cursor_ctx.transaction)) {
        cursor_ctx.db = cursor_ctx.event.target.result;
        cursor_ctx.transaction = cursor_ctx.db.transaction([cursor_ctx.store], cursor_ctx.type);
      }
      if (isEmpty(cursor_ctx.objectstore)) {
        cursor_ctx.objectstore = cursor_ctx.transaction.objectStore(cursor_ctx.store);
      }
      if (isEmpty(cursor_ctx.idx) && !isEmpty(cursor_ctx.index)) {
        cursor_ctx.idx = cursor_ctx.objectstore.index(cursor_ctx.index);
      }
      if (!isEmpty(cursor_ctx.index)) {
        request = cursor_ctx.idx.openCursor(cursor_ctx.range, cursor_ctx.direction);
      } else {
        request = cursor_ctx.objectstore.openCursor(cursor_ctx.range, cursor_ctx.direction);
      }
      cursor_ctx.amount = cursor_ctx.amount || 0;
      request.transaction.addEventListener('complete', function (e) {
        finish(e);
      });
      request.transaction.addEventListener('error', function (e) {
        cursor_ctx.error = cloneError(e.error);
        cursor_ctx = decorate(e);
        error(cursor_ctx);
      });
      request.addEventListener('success', function (e) {
        cursor_ctx.cursor = request.result;
        if (exists(cursor_ctx.cursor)) {
          cursor_ctx.primary_key = cursor_ctx.cursor.primaryKey;
          cursor_ctx.key = cursor_ctx.cursor.key;
          cursor_ctx.direction = cursor_ctx.cursor.direction;
        }
        cursor_ctx = decorate(e);
        if (!isEmpty(skip)) {
          if (exists(cursor_ctx.cursor.advance)) {
            cursor_ctx.cursor.advance(skip);
          }
          skip = null;
        } else {
          if (isEmpty(limit) || count++ < limit) {
            safeApply(getRequest, [cursor_ctx]);
          }
        }
      });
    },
    workQueue = {},
    workRegister = function (worker, message, context, success, error, notify) {
      var id = randomId(),
        callback = function (e) {
          var data = e.data,
            queued = workQueue[data.uid];
          if (undefined !== queued) {
            switch (e.data.type) {
            case 'success':
              delete workQueue[data.uid];
              worker.removeEventListener('message', callback);
              safeApply(success, [data.context]);
              break;
            case 'error':
              delete workQueue[data.uid];
              worker.removeEventListener('message', callback);
              safeApply(error, [data.context]);
              break;
            case 'notify':
              safeApply(notify, [data.context]);
              break;
            default:
              break;
            }
          }
        },
        clean = function(obj) {
          if (isFunction(obj)) { 
            return undefined;
          } else if (isObject(obj)) {
            safeIterate(obj, function(key, val) {
              obj[ key ] = clean(val);
            });
          } else if (isArray(obj)) {
            safeEach(obj, function(v, i) {
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
        dash: message,
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
        worker = new Worker(libraryPath),
        getData = function (data) {
          safeIterate(callbacks, function (key, val) {
            data[key] = val;
          });
          return data;
        };
      safeIterate(callbacks, function (key, val) {
        delete context[key];
      });
      workRegister(worker, message, context, function (data) {
        defd.resolve(getData(data));
      }, function (data) {
        defd.reject(getData(data));
      }, function (data) {
        defd.notify(getData(data));
      });
      return defd.promise;
    },
    providerCacheObj = {},
    providerCached = function (ctx) {
      var cached = {
        database: false,
        store: false,
        index: false
      };
      if (exists(providerCacheObj[ctx.database]) && exists(providerCacheObj[ctx.database].data)) {
        cached.database = true;
        if (exists(providerCacheObj[ctx.database].stores[ctx.store]) && exists(providerCacheObj[ctx.database].stores[ctx.store].data)) {
          cached.store = true;
          if (exists(providerCacheObj[ctx.database].stores[ctx.store].indexes[ctx.index]) && exists(providerCacheObj[ctx.database].stores[ctx.store].indexes[ctx.index].data)) {
            cached.index = true
          }
        }
      }
      return cached;
    },
    providerCache = function (obj, type, ctx) {
      if (exists(ctx) && exists(ctx.database)) {
        providerCacheObj[ctx.database] = providerCacheObj[ctx.database] || {
          stores: {},
          data: null
        };
        if (is(type, 'database')) {
          providerCacheObj[ctx.database].data = obj;
          return obj;
        }
        if (exists(ctx.store)) {
          providerCacheObj[ctx.database].stores[ctx.store] = providerCacheObj[ctx.database].stores[ctx.store] || {
            indexes: {},
            data: null
          };
          if (is(type, 'store')) {
            providerCacheObj[ctx.database].stores[ctx.store].data = obj;
            return obj;
          }
          if (exists(ctx.index)) {
            providerCacheObj[ctx.database].stores[ctx.store].indexes[ctx.index] = providerCacheObj[ctx.database].stores[ctx.store].indexes[ctx.index] || {
              data: null
            };
            if (is(type, 'index')) {
              providerCacheObj[ctx.database].stores[ctx.store].indexes[ctx.index].data = obj;
              return obj;
            }
          }
        }
      }
      return obj;
    },
    providerUncache = function (ctx) {
      delete providerCacheObj[ctx.database];
      return ctx;
    },
    stageRequest = function (method, args, methodname) {
      var determined_type = transactionType(methodname),
        maybeAddDatabase = function (context, callback) {
          var owncontext = detachContext(context);
          if (isEmpty(context.database)) {
            return safeApply(callback, [context]);
          }
          owncontext.on_success = function (db_ctx) {
            db_ctx.on_success = null;
            db_ctx.version = db_ctx.db.version;
            db_ctx.db.close();
            safeApply(callback, [db_ctx]);
          };
          owncontext.on_upgrade_needed = function (db_ctx) {
            db_ctx.upgraded = true;
            db_ctx.version = db_ctx.new_version;
            db_ctx.on_upgrade_needed = null;
            db_ctx.transaction.oncomplete = function () {
              db_ctx.db.close();
              safeApply(callback, [db_ctx]);
            };
          };
          database.get(owncontext);
        }, maybeAddObjectStore = function (context, callback) {
          var owncontext = detachContext(context);
          if (isEmpty(context.store) || contains(['add.store'], methodname)) {
            return safeApply(callback, [context]);
          }
          owncontext.on_success = function (os_ctx) {
            os_ctx.on_success = null;
            os_ctx.db = os_ctx.request.result;
            if (!os_ctx.db.objectStoreNames.contains(os_ctx.store)) {
              os_ctx.version = os_ctx.db.version + 1;
              os_ctx.on_success = null;
              os_ctx.on_upgrade_needed = function (upg_os_ctx) {
                upg_os_ctx.on_upgrade_needed = null;
                upg_os_ctx.transaction.addEventListener('complete', function () {
                  upg_os_ctx.db.close();
                });
                upg_os_ctx.objectstore = upg_os_ctx.db.createObjectStore(upg_os_ctx.store, {
                  keyPath: isString(upg_os_ctx.store_key_path) ? upg_os_ctx.store_key_path : null,
                  autoIncrement: isBoolean(upg_os_ctx.auto_increment) ? upg_os_ctx.auto_increment : false
                });
                //Mitigate QuotaExceededError ("An attempt was made to add something to storage that exceeded the quota.")
                try {
                  if (isEmpty(upg_os_ctx.objectstore) || (!isEmpty(upg_os_ctx.transaction) && exists(upg_os_ctx.transaction.error))) {
                    if(exists(upg_os_ctx.transaction.error)) {
                      upg_os_ctx.error = cloneError(upg_os_ctx.transaction.error);
                    }
                    return error(upg_os_ctx);
                  }
                } catch(err) {
                  //TODO: Above catches quota errors in Chrome but Firefox throws error below. Why?
                  // InvalidStateError: An attempt was made to use an object that is not, or is no longer, usable
                }
                safeApply(callback, [upg_os_ctx]);
              };
              database.get(os_ctx);
            } else {
              if (isnt(os_ctx.transaction, null)) {
                os_ctx.objectstore = os_ctx.transaction.objectStore([os_ctx.store], determined_type);
              }
              os_ctx.db.close();
              safeApply(callback, [os_ctx]);
            }
          };
          owncontext.version = null;
          database.get(owncontext);

        }, maybeAddIndex = function (context, callback) {
          var owncontext = detachContext(context);
          if (isEmpty(context.store) || isEmpty(context.index) || contains(['add.store', 'get.store', 'remove.store', 'get.stores', 'remove.stores', 'remove.index', 'add.index'], methodname)) {
            return safeApply(callback, [context]);
          }
          owncontext.on_success = function (idx_ctx) {
            idx_ctx.on_success = null;
            idx_ctx.db = idx_ctx.request.result;
            idx_ctx.objectstore = idx_ctx.db.transaction([idx_ctx.store], "readonly").objectStore(idx_ctx.store);
            idx_ctx.transaction = idx_ctx.objectstore.transaction;
            if (!idx_ctx.objectstore.indexNames.contains(context.index)) {
              idx_ctx.version = idx_ctx.db.version + 1;
              idx_ctx.on_success = null;
              idx_ctx.on_upgrade_needed = function (upg_idx_ctx) {
                upg_idx_ctx.objectstore = upg_idx_ctx.transaction.objectStore([upg_idx_ctx.store]);
                upg_idx_ctx.on_upgrade_needed = null;
                upg_idx_ctx.transaction.addEventListener('complete', function () {
                  upg_idx_ctx.on_success = null;
                  safeApply(callback, [upg_idx_ctx]);
                  upg_idx_ctx.db.close();
                });
                upg_idx_ctx.on_success = null;
                upg_idx_ctx.idx = upg_idx_ctx.objectstore.createIndex(upg_idx_ctx.index, upg_idx_ctx.index_key_path, {
                  'unique': upg_idx_ctx.index_unique || false,
                  'multiEntry': upg_idx_ctx.index_multi_entry || false
                });
              };
              idx_ctx.db.close();
              database.get(idx_ctx);
            } else {
              idx_ctx.db.close();
              safeApply(callback, [idx_ctx]);
            }
          };
          database.get(owncontext);
        },
        finishWrapAndRespond = function (context) {
          var their_on_success = context.on_success,
            their_on_complete = context.on_complete,
            their_on_error = context.on_error,
            owncontext = detachContext(context),
            cb = function (cb_ctx) {
              if (exists(cb_ctx.store) && isnt(determined_type, "versionchange")) {
                if (is(cb_ctx.transaction, null)) {
                  cb_ctx.transaction = cb_ctx.db.transaction([cb_ctx.store], determined_type);
                }
                cb_ctx.objectstore = cb_ctx.transaction.objectStore(cb_ctx.store);
              } else if (exists(cb_ctx.store)) {
                cb_ctx.db = cb_ctx.request.result;
                cb_ctx.transaction = cb_ctx.request.transaction;
                if (is(cb_ctx.transaction, null)) {
                  cb_ctx.transaction = cb_ctx.db.transaction([cb_ctx.store], determined_type);
                }
                if (!contains(['add.store', 'remove.store'], methodname)) {
                  cb_ctx.objectstore = cb_ctx.transaction.objectStore(cb_ctx.store);
                }
              }
              cb_ctx.transaction.addEventListener('complete', function () {
                cb_ctx.db.close();
              });
              cb_ctx.on_success = function (succ_ctx) {
                succ_ctx = parseResults(succ_ctx, methodname);
                succ_ctx.on_success = their_on_success;
                success(succ_ctx);
              };
              cb_ctx.on_complete = function (comp_ctx) {
                comp_ctx = parseResults(comp_ctx, methodname);
                comp_ctx.on_complete = their_on_complete;
                safeApply(comp_ctx.on_complete, [comp_ctx]);
              };
              cb_ctx.on_error = function (err_ctx) {
                err_ctx = parseResults(err_ctx, methodname);
                err_ctx.on_error = their_on_error;
                error(err_ctx);
              };
              safeApply(method, [cb_ctx]);
            };
          owncontext.version = context.version;
          if (contains(['get.databases', 'remove.database', 'get.database'], methodname)) {
            return safeApply(method, [parseResults(context, methodname)]);
          }
          if (isnt("versionchange", determined_type)) {
            owncontext.on_success = cb;
            owncontext.on_upgrade_needed = null;
          } else {
            owncontext.version = context.db.version + 1;
            owncontext.on_upgrade_needed = cb;
            owncontext.on_success = null;
          }
          owncontext.on_complete = null;
          database.get(owncontext);
        },
        model = detach(args);
      model.type = determined_type;
      (function (process_context) {
        if (exists(process_context)) {
          var their_on_upgrade_needed = process_context ? process_context.on_upgrade_needed : undefined,
            their_on_success = process_context ? process_context.on_success : undefined,
            cache = providerCached(process_context);
          if (contains(['get.database', 'remove.database'], methodname) || (is(cache.database, true) && is(cache.store, true) && is(cache.index, true))) {
            return finishWrapAndRespond(process_context);
          }
          process_context.on_success = null;
          process_context.on_upgrade_needed = null;
          if (is(cache.database, false)) {
            maybeAddDatabase(process_context, function (process_context_2) {
              maybeAddObjectStore(process_context_2, function (process_context_3) {
                maybeAddIndex(process_context_3, function (process_context_4) {
                  process_context_4.on_success = their_on_success;
                  process_context_4.on_upgrade_needed = their_on_upgrade_needed;
                  finishWrapAndRespond(process_context_4);
                });
              });
            });
          } else if (is(cache.store, false)) {
            maybeAddObjectStore(process_context, function (process_context_2) {
              maybeAddIndex(process_context_2, function (process_context_3) {
                process_context_3.on_success = their_on_success;
                process_context_3.on_upgrade_needed = their_on_upgrade_needed;
                finishWrapAndRespond(process_context_3);
              });
            });
          } else {
            maybeAddIndex(process_context, function (process_context_2) {
              process_context_2.on_success = their_on_success;
              process_context_2.on_upgrade_needed = their_on_upgrade_needed;
              finishWrapAndRespond(process_context_2);
            });
          }
        }
      }(model));
    },
    behaviorFilters = [],
    behaviorActions = [],
    behaviorContext = {
      clone: clone,
      contains: contains,
      deferred: deferred,
      exists: exists,
      is: is,
      isEmpty: isEmpty,
      isnt: isnt,
      isArray: isArray,
      isBoolan: isBoolean,
      isRegEx: isRegEx,
      isFunction: isFunction,
      isObject: isObject,
      isNumber: isNumber,
      isString: isString,
      apply: safeApply,
      each: safeEach,
      iterate: safeIterate,
      random: randomId,
      api: Public
    },
    wrapRequest = function (fn, method) {
      return function (context) {
        context = context || {};
        var callbackMap = {};
        safeEach(standardCallbackNames, function (key) {
          callbackMap[key.replace(/^on_/, '')] = context[key];
        });
        if (is(workerEnvironment, true)) {
          safeIterate(context, function (attr) {
            if (true === contains(reservedAttrs, attr)) {
              delete context[attr];
            } else {
              addAttribute(attr);
            }
          });
        }
        /* This method adds an on_something to proxy the requests before they
         * make it to the original objects, which are stored in callbackMap */
        return (function (args, map, callback, signature) {
          var defd = deferred(),
            count = 0,
            complex = contains(['get.entries', 'update.entries', 'remove.entries'], method),
            /* This  method enforces promises and defines the behavior
             * of how they map to IDB concepts. The shorthand is to save bytes:
             * s: success
             * e: error
             * a: abort
             * b: blocked
             * */
            codeMap = {
              success: 's',
              error: 'e',
              abort: 'a',
              complete: 'c',
              upgrade_needed: 'u',
              blocked: 'b',
              closed: 'l'
            },
            response,
            promise = defd.promise;
          /* We've dirtied up the "context" object with our own callbacks. 
           * Before returning the context (arguments) to the user, this
           * method removes the stuff we've added so they don't
           * get inherited into chained contexts. */
          safeIterate(map, function (map_key) {
            /* These methods proxy requests for promise-keeping */
            args['on_' + map_key] = (function (type, maphash, sig) {
              return function (obj) {
                if (isObject(obj)) {
                  /* Only define if previously defined, otherwise wipe. */
                  safeIterate(maphash, function (key, value) {
                    var k = 'on_' + key;
                    if (isFunction(value)) {
                      obj[k] = value;
                    } else {
                      delete obj[k];
                    }
                  });
                }
                obj = detach(obj);
                var slug = null,
                  argums,
                  response,
                  count = 0,
                  def = deferred(),
                  pro = def.promise;
                /* This is the little bit of logic that maps 
                 * IDB events (abort, success, etc.) to our own
                 * promise success/error/notify model */
                if (is(type, 's') && is(complex, true)) {
                  slug = 'notify';
                } else if (is(type, 'e') || is(type, 'a') || is(type, 'b')) {
                  slug = 'reject';
                } else {
                  slug = 'resolve';
                }
                argums = parseResults(obj, sig);
                safeEach(behaviorActions, function (act) {
                  response = safeApply(act, [{
                    type: slug,
                    method: sig,
                    context: argums,
                    priority: ++count,
                    promise: pro
                }], clone(behaviorContext));
                  argums = response.context || argums;
                  pro = response.promise || pro;
                  /* Notifies can't be turned into anything but rejects and
                   * resolves can be... resolved and rejected, respectively */
                  if (contains(['reject', 'resolve'], slug)) {
                    slug = response.type || slug;
                  }
                });
                pro(function (st) {
                  if(!isEmpty(st.type)) {
                    defd[st.type](st.context);
                  }
                }, function (st) {
                  defd.reject(st.context);
                }, function (st) {
                  defd.notify(st.context);
                });
                def.resolve(clone({
                  method: sig,
                  type: slug,
                  context: argums
                }));
              };
            }(codeMap[map_key], map, signature));
          });
          /* Runs setup for the method */
          if (null !== signature.match(/\.behavior/)) {
            safeApply(callback, [args]);
          } else {
            try {
              var def = deferred(),
                pro = def.promise,
                prev = {},
                breakout = false,
                argtype = null;
              behaviorContext.api = Public;
              safeEach(behaviorFilters, function (filter) {
                if (!breakout) {
                  response = safeApply(filter, [{
                    type: argtype,
                    method: signature,
                    context: args,
                    priority: ++count,
                    promise: pro
                }], clone(behaviorContext));
                  args = response.context || args;
                  safeIterate(args, function (attr) {
                    addAttribute(attr);
                  });
                  if (is(response.type, 'resolve')) {
                    breakout = true;
                  } else {
                    signature = response.method || signature;
                  }
                  argtype = response.type;
                  pro = response.promise;
                }
              });
              pro(function (state) {
                if ((is(complex, true) || is(breakout, true)) && isnt(workerEnvironment, true) && is(webkitEnvironment, true) && exists(libraryPath) && is(workerPresent, true)) {
                  safeIterate({
                    on_success: state.context.on_success,
                    on_error: state.context.on_error,
                    on_abort: state.context.on_abort,
                    on_complete: state.context.on_complete,
                    on_upgrade_needed: state.context.on_upgrade_needed,
                    on_blocked: state.context.on_blocked,
                    on_close: state.context.on_close
                  }, function (attr, fn) {
                    prev[attr] = args[attr];
                    args[attr] = fn;
                  });
                  if (is(breakout, false)) {
                    pro = workDispatch(signature, args);
                  }
                  pro(function (ctx) {
                    ctx = ctx.context || ctx;
                    safeApply(prev['on_complete'], [ctx]);
                  }, function (ctx) {
                    ctx = ctx.context || ctx;
                    safeApply(prev['on_error'], [ctx]);
                  }, function (ctx) {
                    ctx = ctx.context || ctx;
                    safeApply(prev['on_success'], [ctx]);
                  });
                } else {
                  stageRequest(callback, args, state.method);
                }
              }, function (ctx) {
                args.error = ctx.error;
                error(args);
              });
              def.resolve(clone({
                method: signature,
                type: argtype,
                context: args
              }));
            } catch (err) {
              args.error = err;
              error(args);
            }
          }
          return promise;
        }(context, callbackMap, fn, method));
      };
    },
    that = self,
    Public;

  /*
   *  Helpers
   */

  /* Metaprogramming callback shortcuts */
  validAttrs.push.apply(validAttrs, standardCallbackNames);
  validAttrs.push.apply(validAttrs, reservedAttrs);
  safeEach(standardCallbackNames, function (cb) {
    that[cb.replace(/^on_/g, '')] = function (context) {
      safeApply(context[cb], [context]);
      return context;
    };
  });

  /* Begin API */

  /*
   *   Database
   *   Namespaces:
   *       database
   *  Methods:
   *      database.remove
   *      database.close
   *      database.get
   */

  /* Close a single db named `database`, aborting any transactions. */
  /* IDB returns a void on deletes which makes these essentially
   * syncronous calls. We support both techniques through the silent param */
  database.close = function (close_ctx, silent) {
    close_ctx.db.close();
    if (isnt(silent, true)) {
      success(close_ctx);
    }
  };

  /* This method deletes a `database`. */
  /* As with `database.close`, a no-callback ("silent") syncronous approach 
   * is supported with an optional true value for the `silent` param */
  database.remove = function (remove_context, silent) {
    db.deleteDatabase(remove_context.database);
    if (isnt(silent, true)) {
      success(remove_context);
    }
  };

  /* This method loads a database given a database name and version.
   * The database can be retrived on successful callback via the `db`
   * attribute on the context object */
  // TODO: Localize open_ctx.request and provide any results from within this method
  database.get = function (open_ctx) {
    var their_upgrade = open_ctx.on_upgrade_needed,
      their_success = open_ctx.on_success,
      their_on_blocked = open_ctx.on_blocked,
      was_upgrade = false,
      maybeClose = function() {
        if(exists(open_ctx.request.transaction)) {
          open_ctx.request.transaction.addEventListener('complete', function () {
            open_ctx.db.close();
          });        
        }
      },
      decorate = function (event, context) {
        context.event = event;
        context.transaction = context.request ? context.request.transaction : event.target.transaction;
        if (exists(context.transaction) && exists(context.transaction.db)) {
          context.db = context.transaction.db;
        }
        if (exists(event.newVersion)) {
          context.new_version = event.newVersion;
          context.old_version = event.oldVersion;
          if (isnt(context.old_version, context.new_version)) {
            context.upgrade = true;
          } else {
            context.upgrade = false;
          }
        } else {
          context.upgrade = false;
        }
        return context;
      };
    open_ctx.request = isNumber(open_ctx.version) ? db.open(open_ctx.database, open_ctx.version) : db.open(open_ctx.database);
    if (open_ctx.db && isFunction(open_ctx.db.close)) {
      open_ctx.db.close();
    }
    open_ctx.request.addEventListener('success', function (event) {
      if (was_upgrade) {
        return;
      }
      maybeClose();
      open_ctx = decorate(event, open_ctx);
      open_ctx.upgrade = false;
      open_ctx.opened = true;
      open_ctx.on_success = their_success;
      open_ctx.db = open_ctx.event.target.result;
      success(open_ctx);
    });
    open_ctx.request.addEventListener('upgradeneeded', function (event) {
      maybeClose();
      was_upgrade = true;
      open_ctx = decorate(event, open_ctx);
      open_ctx.upgrade = true;
      open_ctx.opened = true;
      open_ctx.on_upgrade_needed = their_upgrade;
      upgrade_needed(open_ctx);
    });
    open_ctx.request.addEventListener('blocked', function (event) {
      maybeClose();
      open_ctx = decorate(event, open_ctx);
      safeApply(their_on_blocked, [open_ctx]);
    });
  };


  /* Returns all stores syncronously, or asyncronously through
   * an on_success callback, given a database. */
  databases.get = function (get_ctx) {
    var theirs = get_ctx.on_success;
    if (is(webkitEnvironment, false)) {
      return error(get_ctx);
    }
    get_ctx.request = db.webkitGetDatabaseNames();
    get_ctx.request.addEventListener('success', function (event) {
      get_ctx.databases = event.target.result;
      get_ctx.on_success = theirs;
      success(get_ctx);
    });
  };

  /*
   *  Stores
   *  Namespaces
   *      store
   *      stores
   *  Methods:
   *      store.delete
   *      store.get
   *      stores.get
   */

  /* This method clears a `database` object `store` of any objects. */
  store.clear = function (clear_ctx) {
    clear_ctx.objectstore.clear();
    success(clear_ctx);
  };

  /* This method delete a `database` object `store` */
  store.remove = function (remove_context) {
    remove_context.db.deleteObjectStore(remove_context.store);
    success(remove_context);
  };

  /* Returns a single store syncronously, or asyncronously through
   * an on_success callback, given a database and store. */
  store.get = function (get_ctx) {
    success(get_ctx);
  };

  /* Returns all stores syncronously, or asyncronously through
   * an on_success callback, given a database. */
  stores.get = function (get_ctx) {
    get_ctx.stores = get_ctx.db.objectStoreNames;
    success(get_ctx);
  };

  /*
   *  Indexes
   *  Namespaces
   *      index
   *      indexes
   *  Methods:
   *      index.exists
   *      index.get
   *      index.delete
   *      indexes.get
   *      indexes.create
   */

  /* Returns a single index syncronously, or asyncronously through
   * an on_complete callback, given a database, store and index. */
  index.get = function (get_ctx) {
    get_ctx.idx = get_ctx.objectstore.index(get_ctx.index);
    success(get_ctx);
  };

  /* This method deletes an index with a given `name` on a given
   * `database` and `store`. It creates an implicit database version upgrade.
   */
  index.remove = function (remove_ctx) {
    remove_ctx.objectstore.deleteIndex(remove_ctx.index);
    success(remove_ctx);
  };

  /* Returns all indexes syncronously, or asyncronously through
   * an on_success callback, given a database and store. */
  indexes.get = function (get_ctx) {
    get_ctx.indexes = get_ctx.objectstore.indexNames;
    success(get_ctx);
  };


  /*
   *  Entries
   *
   *  Namespaces:
   *      entry
   *      entries
   *
   *  Methods:
   *      entry.add
   *      entry[ 'delete' ]
   *      entry.get
   *      entry.put
   *      entryResult
   *
   */

  /* This method adds a `data` object to an object `store` `database`. */
  entry.add = function (add_ctx) {
    var request;
    add_ctx.data = isFunction(add_ctx.data) ? add_ctx.data() : clone(add_ctx.data);
    request = add_ctx.objectstore.add(add_ctx.data);
    add_ctx.transaction.addEventListener('error', function (event) {
      add_ctx.error = cloneError(event.target.error);
      error(add_ctx);
    });
    request.addEventListener('success', function () {
      add_ctx.key = request.result;
      add_ctx.entry = add_ctx.data;
      if (!isEmpty(add_ctx.objectstore.keyPath)) {
        add_ctx.entry[ add_ctx.objectstore.keyPath ] = add_ctx.key;
      }
      success(add_ctx);
    });
  };

  /* This method deletes a `database`'s object `store` row given a `key` */
  entry.remove = function (remove_ctx) {
    var request,
      has_range = exists(remove_ctx.range) || exists(remove_ctx.upper) || exists(remove_ctx.lower) || exists(remove_ctx.only);
    request = remove_ctx.objectstore["delete"](has_range ? (remove_ctx.range || range.get(remove_ctx)) : remove_ctx.key);
    remove_ctx.transaction.addEventListener('complete', function () {
      remove_ctx.entry = request.result;
      success(remove_ctx);
    });
    remove_ctx.transaction.addEventListener('error', function (event) {
      remove_ctx.error = cloneError(event.target.error);
      error(remove_ctx);
    });
  };

  /* This method gets a row from an object store named `store` in a database
   * named `database` using an optional `index` and `key`
   */
  entry.get = function (get_ctx) {
    var request;
    try {
      if (exists(get_ctx.index)) {
        get_ctx.idx = get_ctx.objectstore.index(get_ctx.index);
        request = is(get_ctx.value, false) ? get_ctx.idx.getKey(get_ctx.key) : get_ctx.idx.get(get_ctx.key);
      } else {
        request = get_ctx.objectstore.get(get_ctx.key);
      } 
    } catch( err ) {
      get_ctx.error = cloneError(err);
      return error(get_ctx);
    }

    get_ctx.transaction.addEventListener('error', function (event) {
      get_ctx.error = cloneError(event.target.error);
      error(get_ctx);
    });

    request.addEventListener('success', function () {
      get_ctx.entry = request.result;
      if (isEmpty(get_ctx.entry)) {
        get_ctx.error = { message: 'missing', name: 'DashNoEntry' };
        error(get_ctx);
      } else {
        success(get_ctx);
      }
    });
  };

  /* This method puts a `data` object to a `database` object `store` using a `key`.
   * This change is made without regard to its previous state. */
  entry.put = function (put_ctx) {
    var request;
    try {
      put_ctx.data = isFunction(put_ctx.data) ? put_ctx.data() : clone(put_ctx.data);
      request = exists(put_ctx.key) ? put_ctx.objectstore.put(put_ctx.data, put_ctx.key) : put_ctx.objectstore.put(put_ctx.data);
      request.addEventListener('success', function () {
        put_ctx.key = request.result;
        put_ctx.entry = put_ctx.data;
        success(put_ctx);
      });
      put_ctx.transaction.addEventListener('error', function (event) {
        put_ctx.error = cloneError(event.target.error);
        error(put_ctx);
      });
    } catch (err) {
      put_ctx.error = cloneError(err);
      return error(put_ctx);
    }
  };

  /* This method deletes rows from a `database` `store` matching the
   * `index` cursor with the given `key_range`
   */
  entries.remove = function (remove_ctx) {
    remove_ctx.type = "readwrite";
    var their_on_success = remove_ctx.on_success;
    standardCursor(remove_ctx, function (passed_remove_ctx) {
      passed_remove_ctx.entry = passed_remove_ctx.request;
      if (exists(passed_remove_ctx.cursor)) {
        passed_remove_ctx.on_success = their_on_success;
        passed_remove_ctx.entry = passed_remove_ctx.cursor.value;
        passed_remove_ctx.amount = passed_remove_ctx.amount || 0;
        passed_remove_ctx.amount += 1;
        passed_remove_ctx.cursor['delete']();
        success(passed_remove_ctx);
        if (exists(passed_remove_ctx.cursor['continue'])) {
          passed_remove_ctx.cursor['continue']();
        }
      }
    });
  };

  /* This method gets rows from a `database` object `store` using a cursor creating
   * with an `index`, `key_range` and optional `direction`. */
  entries.get = function (get_ctx) {
    get_ctx.type = "readonly";
    var their_on_success = get_ctx.on_success;
    get_ctx.on_success = null;
    standardCursor(get_ctx, function (passed_get_ctx) {
      if (exists(passed_get_ctx.cursor)) {
        passed_get_ctx.on_success = their_on_success;
        passed_get_ctx.entry = passed_get_ctx.cursor.value;
        passed_get_ctx.amount = passed_get_ctx.amount || 0;
        passed_get_ctx.amount += 1;
        success(passed_get_ctx);
        if (exists(passed_get_ctx.cursor['continue'])) {
          passed_get_ctx.cursor['continue']();
        }
      }
    });
  };

  /* This method returns the number of records associated with
     an index request */
  entries.count = function (count_ctx) {
    var request;
    if (exists(count_ctx.index)) {
      count_ctx.idx = count_ctx.objectstore.index(count_ctx.index);
      request = isEmpty(count_ctx.key) ? count_ctx.idx.count() : count_ctx.idx.count(count_ctx.key);
    } else {
      request = isEmpty(count_ctx.key) ? count_ctx.objectstore.count() : count_ctx.objectstore.count(count_ctx.key);
    }

    count_ctx.transaction.addEventListener('error', function (event) {
      count_ctx.error = cloneError(event.target.error);
      error(count_ctx);
    });

    request.addEventListener('success', function () {
      count_ctx.total = request.result;
      success(count_ctx);
    });

  };



  /* This method updates rows in a `database` `store` matching the
   * `index` cursor with the given `key_range`
   */
  entries.update = function (update_ctx) {
    update_ctx.type = "readwrite";
    var their_on_success = update_ctx.on_success;
    standardCursor(update_ctx, function (passed_update_ctx) {
      if (exists(passed_update_ctx.cursor)) {
        passed_update_ctx.on_success = their_on_success;
        passed_update_ctx.entry = passed_update_ctx.cursor.value;
        passed_update_ctx.amount = passed_update_ctx.amount || 0;
        passed_update_ctx.amount += 1;
        passed_update_ctx.cursor.update(passed_update_ctx.data);
        success(passed_update_ctx);
        if (exists(passed_update_ctx.cursor['continue'])) {
          passed_update_ctx.cursor['continue']();
        }
      }
    });
  };

  /*
   * Key Ranges
   */

  /* This method returns an IDBKeyRange given a range type
   * and returns false if type is not valid.
   * Valid types include: bound, leftBound, only, rightBound */
  /* This approach adds syntatic sugar by using duck typing
   * to determine key type */
  /* For more info on key types: https://developer.mozilla.org/en/indexeddb/idbkeyrange*/
  range.get = function (get_ctx) {
    var result = null,
      left_bound = get_ctx.left_bound,
      right_bound = get_ctx.right_bound,
      includes_left_bound = get_ctx.includes_left_bound,
      includes_right_bound = get_ctx.includes_right_bound;
    if (exists(left_bound) && exists(right_bound) && exists(includes_left_bound) && exists(includes_right_bound)) {
      result = kr.bound(left_bound, right_bound, includes_left_bound, includes_right_bound);
    } else if (exists(left_bound) && exists(includes_left_bound)) {
      result = kr.lowerBound(left_bound, includes_left_bound);
    } else if (exists(right_bound) && exists(includes_right_bound)) {
      result = kr.upperBound(right_bound, includes_right_bound);
    } else if (exists(get_ctx.value)) {
      result = kr.only(get_ctx.value);
    }
    get_ctx.result = result;
    success(get_ctx);
    return result;
  };

  behavior.add = function (influence) {
    if (isArray(influence)) {
      if (isFunction(influence[0])) {
        behaviorFilters.push(influence[0]);
      }
      if (isFunction(influence[1])) {
        behaviorActions.push(influence[1]);
      }
    } else if (isFunction(influence)) {
      behaviorFilters.push(influence);
      behaviorActions.push(influence);
    }
  };


  /* We programmatically construct the public-facing API for a couple of
   * reasons: less code and protects namespace in advance minification,
   */
  Public = (function (internal) {
    var Public = {},
      names = [],
      name;
    safeIterate(internal, function (sig, fnref) {
      names = sig.split('.');
      name = names[0];
      Public[name] = Public[name] || {};
      Public[name][names[1]] = wrapRequest(fnref, sig);
    });
    return Public;
  }({
    'add.entry': entry.add,
    'add.behavior': behavior.add,
    'clear.store': store.clear,
    'count.entries': entries.count,
    'get.behaviors': behavior.get,
    'get.database': database.get,
    'get.databases': databases.get,
    'get.store': store.get,
    'get.stores': stores.get,
    'get.index': index.get,
    'get.indexes': indexes.get,
    'get.entries': entries.get,
    'get.entry': entry.get,
    'remove.database': database.remove,
    'remove.entries': entries.remove,
    'remove.index': index.remove,
    'remove.entry': entry.remove,
    'remove.store': store.remove,
    'update.entries': entries.update,
    'update.entry': entry.put
  }));

  if (is(workerEnvironment, true)) {
    environment.addEventListener('message', function (e) {
      var input = e.data,
        method = input.dash.split('.'),
        verb = method[0],
        noun = method[1],
        end = function (ctx) {
          input.context = ctx;
          environment.postMessage(input);
        };
      if (undefined !== dash[verb] && undefined !== dash[verb][noun]) {
        Public[verb][noun](input.context)(
          function (context) {
            input.type = 'success';
            end(context);
          }, function (context) {
            input.type = 'error';
            end(context);
          }, function (context) {
            input.type = 'notify';
            end(context);
          }
        );
      } else {
        input.type = 'error';
        end({
          error: 'No such method'
        });
      }
    }, false);
  }
  /*
   * The MIT License (MIT)
   * Copyright (c) 2011-2014 Buley LLC
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   *
   */

  return Public;

}(self || {}));