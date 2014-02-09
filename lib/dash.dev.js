
/* Documentation -> http://dashdb.com
 * Repo -> http://github.com/editor/dash
 * License -> MIT
 * Author -> Taylor Buley (@taylorbuley)
 * Copyright -> (c) 2011-2014 Buley LLC
 */

var dash = (function () {

  'use strict';

  var w = window,
    API = {
      dbs: {},
      database: {},
      databases: {},
      store: {},
      stores: {},
      index: {},
      indexes: {},
      range: {},
      object: {},
      objects: {},
      transaction: {},
      db: w.indexedDB,
      tx: w.IDBTransaction,
      cur: w.IDBCursor,
      kr: w.IDBKeyRange
    };

  /* Begin Utils */

  /* This method copies an object by value (deeply) */
  //warning: recursive
  API.clone = function (obj) {
    var clone = {};
    if (API.isNumber(obj)) {
      return parseInt(obj, 10);
    }
    if (API.isArray(obj)) {
      return obj.slice(0);
    }
    API.safeIterate(obj, function (x, val) {
      if (API.isObject(val) && !API.isFunction(val) && !API.isArray(val)) {
        clone[x] = API.clone(val);
      } else {
        clone[x] = val;
      }
    });
    return clone;
  };

  /* This method checks whether a variable has a value */
  API.isEmpty = function (mixed_var) {
    return (API.isnt(mixed_var, undefined) && API.isnt(mixed_var, null) && API.isnt(mixed_var, "") && (!API.isArray(mixed_var) || mixed_var.length > 0)) ? false : true;
  };

  /* This method returns the inverse of API.isEmpty(mixed_var) */
  API.exists = function (mixed_var) {
    return (API.isEmpty(mixed_var)) ? false : true;
  };

  /* This method tdetermins whether a given `haystack` contains a `needle` */
  API.contains = function (haystack, needle, use_key) {
    var result = false;
    if (API.exists(haystack)) {
      API.safeIterate(haystack, function (key, value) {
        if ((API.is(use_key, true) && API.is(key, needle)) || API.is(value, needle)) {
          result = true;
        }
      });
    }
    return result;
  };

  API.hasPath = function (obj, key) {
    var keys = key.split('.'),
      k = keys.shift();
    if (API.isEmpty(obj)) {
      return false;
    }
    while (k) {
      if (API.isEmpty(obj[k])) {
        return false;
      }
      obj = obj[k];
      k = keys.shift();
    }
    return true;
  };

  API.getPath = function (obj, key) {
    var keys = key.split('.'),
      k = keys.shift(),
      value;
    while (k) {
      if (API.exists(obj[k])) {
        value = obj[k];
      }
      obj = obj[k];
      k = keys.shift();
    }
    return value;
  };

  /* These are various utilitty methods used in type checls
   * and other assertions.
   */

  API.is = function (a, b) {
    return b === a;
  };

  API.isnt = function (a, b) {
    return b !== a;
  };

  API.isObject = function (mixed_var) {
    return !API.isNull(mixed_var) && API.isType("object", mixed_var) && API.is("[object Object]", mixed_var.toString());
  };

  API.isString = function (mixed_var) {
    return API.isType("string", mixed_var);
  };

  API.isFunction = function (mixed_var) {
    return API.isType("function", mixed_var);
  };
  API.isStore = function(os) {
    return os instanceof IDBObjectStore;
  }
  API.isTransaction = function(tx) {
    return tx instanceof IDBTransaction;
  };
  API.isDatabase = function(db) {
    return db instanceof IDBDatabase;
  };
  API.isVersionChange = function(tx) {
    return API.isTransaction(tx) && API.is(tx, API.transaction.versionChange);
  };
  API.transactionIsAtLeast = function(test, at_least) {
    if (API.is(test, API.transaction.versionChange)) {
      return true;
    } else {
      if (API.is(test,API.transaction.readWrite)) {
        if (API.is(at_least,API.transaction.versionChange)){
          return false;
        }
        return true;
      } else {
        if (API.is(at_least,API.transaction.read)){
          return true;
        }
        return false;
      }
    }
  };

  //arraylike works (e.g. DOMStringList)
  API.isArray = function (mixed_var) {
    return (mixed_var instanceof Array || mixed_var instanceof DOMStringList);
  };

  API.toNumber = function (mixed_var) {
    var result = parseInt(mixed_var, 10);
    return API.is(false, API.isNumber(result)) ? null : result;
  };

  API.isNumber = function (mixed_var) {
    return API.isType("number", mixed_var) || API.is(isNaN(parseInt(mixed_var, 10), false));
  };

  API.isNull = function (mixed_var) {
    return API.is(mixed_var, null);
  };

  API.isUndefined = function (mixed_var) {
    return API.is(mixed_var, undefined);
  };

  API.isBoolean = function (mixed_var) {
    return API.isType("boolean", mixed_var) || API.is(mixed_var, 'true') || API.is(mixed_var, 'false');
  };

  API.isType = function (str, mixed_var) {
    return API.is(str, typeof mixed_var);
  };

  /* This method clones `from` and applies it's values to `to`.
   * When optional `deep` is true, it does this recursively on objects.
   */
  API.extend = function (to, from, deep) {
    API.safeIterate(API.clone(from), function (key, value) {
      if (API.is(true, deep) && API.isObject(value)) {
        to[key] = API.extend({}, value, deep);
      } else {
        to[key] = value;
      }
    });
    return to;
  };

  /* This method safely iterates through an object */
  API.safeIterate = function (item, callback) {
    var attr;
    for (attr in item) {
      if (item.hasOwnProperty(attr)) {
        callback(attr, item[attr]);
      }
    }
  };

  /* This method safely iterates through an array */
  API.safeEach = function (items, callback, backwards) {
    var x,
      count = items.length,
      inc = 1;
    if (true === backwards) {
      inc = -inc;
    }
    for (x = 0; x < count; x += inc) {
      API.safeApply(callback, [x, items[x]]);
    }
  };

  /* This method collects responses from given `items` */
  API.safeEnumerate = function (items, callback, on_complete) {
    var collect = [];
    if (API.isArray(items)) {
      API.safeEach(items, function () {
        collect.push(API.safeApply(callback, arguments));
      });
    } else if (API.isObject(items)) {
      API.safeIterate(items, function () {
        collect.push(API.safeApply(callback, arguments));
      });
    }
    API.safeApply(on_complete, [collect]);
    return collect;
  };

  /* This method collects responses from given `items` */
  API.safeCollect = function (items, context, on_complete, on_each) {
    var collect = [];
    if (API.isArray(items)) {
      API.safeEach(items, function (key, value) {
        collect.push(API.safeApply(API.isFunction(value) ? value : on_each, context));
      });
    } else if (API.isObject(items)) {
      API.safeIterate(items, function (key, value) {
        collect.push(API.safeApply(API.isFunction(value) ? value : on_each, context));
      });
    } else {
      collect = [];
    }
    API.safeApply(on_complete, [collect]);
    return collect;
  };

  /* This method maybe applys a `fn` */
  //warning: recursive
  API.safeApply = function (fn, args, context, err) {
    if (API.isFunction(fn)) {
      return fn.apply(context || API, args || []);
    }
    if (API.isFunction(err)) {
      return API.safeApply(err, []);
    }
  };

  /* End Utils */

  /* Begin API */

  /*
   *  Helpers
   */

  API.success = function (context) {
    API.safeApply(context.on_success, [context]);
    return context;
  };
  API.error = function (context) {
    API.safeApply(context.on_error, [context]);
    return context;
  };
  API.complete = function (context) {
    API.safeApply(context.on_complete, [context]);
    return context;
  };
  API.abort = function (context) {
    API.safeApply(context.on_abort, [context]);
    return context;
  };
  API.upgrade = function (context) {
    API.safeApply(context.on_upgrade_needed, [context]);
    return context;
  };
  API.standardCallbackNames = ['on_success', 'on_error', 'on_abort', 'on_blocked', 'on_upgrade_needed', 'on_close', 'on_complete' ];
  API.standardRequest = function (context) {
    var request = context.request;
    context = API.standardCallbacks(context);
    if (API.exists(request) && API.is(request.readyState, 'done')) {
      context.result = API.objectResult(context);
      return API.success(context);
    }
    context.request = API.extend(request, {
      onsuccess: context.on_success,
      onerror: context.on_error,
      onabort: context.on_abort,
      onclose: context.on_close,
      onblocked: context.on_blocked,
      onupgradeneeded: context.on_upgrade_needed,
      oncomplete: context.on_complete
    });
    return context;
  };

  API.standardCursor = function(ctx, getRequest) {
    var total = 0,
      decorate = function (event) {
        ctx.event = event;
        return ctx;
      },
      their_on_success = ctx.on_success,
      their_on_error = ctx.on_error;
    ctx.direction = ctx.direction || API.objects.next();
    ctx.range = ctx.range || API.range.get(ctx);
    ctx.type = API.transaction.readWrite;
    ctx.transaction = API.transaction.create(ctx);
    ctx.objectstore = ctx.transaction.objectStore(ctx.store);
    ctx.data = API.isFunction(ctx.data) ? ctx.data() : API.clone(ctx.data);
    try {
      if (!API.isEmpty(ctx.index)) {
        ctx.idx = ctx.objectstore.index(ctx.index);
        ctx.request = ctx.idx.openCursor(ctx.range, ctx.direction);
      } else {
        ctx.request = ctx.objectstore.openCursor(ctx.range, ctx.direction);
      }
      API.extend(ctx.request, {
        onsuccess: function (event) {
          var maybeFinish = function () {
              total += 1;
              if (API.isNumber(ctx.limit) && total >= ctx.limit) {
                API.complete(ctx);
              } else {
                if (API.exists(ctx.cursor)) {
                  if (API.exists(ctx.skip_each)) {
                    try {
                      ctx.cursor.advance(ctx.skip_each);
                    } catch (error) {
                      ctx.error = error;
                      API.error(ctx);
                    }
                  } else if (API.isFunction(ctx.cursor['continue'])) {
                    try {
                      ctx.cursor['continue']();
                    } catch (error) {
                      ctx.result = error;
                      API.complete(ctx);
                    }
                  }
                }
              }
            };
          ctx.cursor = event.target.result;
          ctx.result = event.target.result.value;
          ctx.flagged = false;
          ctx.event = event;
          if (API.exists(ctx.expecting)) {
            API.safeIterate(ctx.expecting, function (attr, expected) {
              var value = (API.hasPath(ctx.result, attr)) ? ctx.result[attr] : null;
              if (API.isFunction(expected)) {
                expected = expected(value);
              }
              if (API.exists(value) && API.exists(expected) && API.isnt(value, expected)) {
                ctx.flagged = true;
              }
            });
          }
          if (API.is(ctx.flagged, false) && API.exists(ctx.cursor) && API.exists(ctx.result)) {
            ctx.data = API.is(ctx.replace, true) ? ctx.result : API.extend(ctx.result, ctx.data);
            try {
              API.extend(getRequest(ctx), {
                onsuccess: function () {
                  maybeFinish();
                  ctx.on_success = their_on_success;
                  return API.success(ctx);
                },
                onerror: function () {
                  ctx.on_error = their_on_error;
                  return API.error(ctx);
                }
              });
            } catch (error) {
              ctx.error = error;
              return API.error(ctx);
            }
          } else {
            return API.error(ctx);
          }
        },
        onerror: function (event) {
          return API.error(decorate(event));
        },
        onabort: function (event) {
          return API.abort(decorate(event));
        }
      });
    } catch (error) {
      ctx.error = error;
      return API.error(ctx);
    }
  };

  /* This helper method plucks a value from a request row
   * This allows us to normalize request responses */
  /* Although namespaced, this method is not public-facing */
  API.objectResult = function (context) {
    var event = context.event,
      result = null;
    //cursors
    if (context.request instanceof IDBOpenDBRequest) {
      return null;
    }
    if (API.hasPath(event, 'target.result.value')) {
      result = event.target.result.value;
      //TODO: document what what each of these corresponds to
    } else if (API.hasPath(event, 'target.result')) {
      result = event.target.result;
    } else if (API.hasPath(event, 'result')) {
      result = event.result;
    } else if (API.hasPath(event, 'request.result')) {
      result = event.request.result;
    }
    return result;
  };

  API.standardCallbacks = function (context) {
    var clone = {},
      decorate = function (event) {
        context.event = event;
        context.transaction = context.request ? context.request.transaction : event.target.transaction;
        context.result = API.objectResult(context);
        if (API.exists(context.transaction) && API.exists(context.transaction.db)) {
          context.db = context.transaction.db;
        }
        if (API.exists(event.newVersion)) {
          context.new_version = event.newVersion;
          context.old_version = event.oldVersion;
          if (API.isnt(context.old_version, context.new_version)) {
            context.upgrade = true;
          } else {
            context.upgrade = false;
          }
        } else {
          context.upgrade = false;
        }
        return context;
      };
    API.safeEach(API.standardCallbackNames, function (i, fn) {
      clone[fn] = (function () {
        return function (event) {
          API.safeApply(context[fn], [decorate(event)]);
        };
      }());
    });
    return clone;
  };


  /* This provides a layer of protection against dead transactions. 
   * Without being an active listener on a transaction at the time of 
   * completion it's not possible to know whether it's complete. 
   * This throws a "mutation" error in FF and "The transaction has finished."
   * in Chrone. Kickstarting transactions lazily allows us to reuse as 
   * much as possible passing from method to method */
  API.safeRequest = function(workToDo, context, doRequest) {
    var result;
    context = context || {};
    if (API.isEmpty(context.transaction)) {
      context.transaction = API.transaction.create(context);
    }
    if (API.exists(context.transaction)) {
      context.objectstore = API.maybeAttachStore(context);
    }
    context = workToDo(context);
    if(API.isnt(doRequest,false)) {
      API.standardRequest(context);
    }      
    return context;
  };

  API.maybeAttachStore = function(context) {
    if (API.exists(context.objectstore)) {
      return context.objectstore;
    }
    if (API.exists(context.store) && API.isTransaction(context.transaction)) {
      try {
        context.objectstore = API.safeApply(context.transaction.objectStore, [context.store], context.transaction);
      } catch( error ) {
        //couln't attach store (may have been deleted)
      }
    }
    return context.objectstore;
  };


  /*
   *  Transactions
   *  Namespaces:
   *      API.transaction
   *  Methods:
   *      API.transaction.read
   *      API.transaction.readWrite
   */

  /* Transaction types */
  API.transaction.read = "readonly";
  API.transaction.readWrite = "readwrite";
  API.transaction.versionChange = "versionchange";

  /* This method is a transaction factory for transaction of a given `type` on a given
   * `database` and `store` */
  /* This method returns a transaction rather than a context and is not public facing */
  API.transaction.create = function (context) {
    if (API.exists(context.transaction) && API.isTransaction(context.transaction)
        && API.transactionIsAtLeast(context.transaction.mode, context.type)
        && ( API.hasPath(context, 'request.readyState') || API.isnt(context.request.readyState, 'done'))) {
      return context.transaction;
    } else {
      delete context.transaction;
    }
    if (API.is(context.type, API.transaction.versionChange)) {
      return null;
    } else if (API.isDatabase(context.db)) {
      try {
        context.transaction = context.db.transaction([context.store], context.type);
      } catch ( error ) {
        context.error = error;
        API.error(context);
      } finally {
        return context.transaction;
      }
    } else {
      return null;
    }
  };

  /*
   *   Database
   *   Namespaces:
   *       API.database
   *  Methods:
   *      API.database.remove
   *      API.database.close
   *      API.database.open
   *      API.database.upgrade
   *      API.database.upgradeRequest
   */

  /* Close a single db named `database`, aborting any transactions. */

  API.database.close = function (context) {
    return API.safeRequest( function(ctx) {
      if (API.exists(ctx.db)) {
        API.safeApply(ctx.db.close, [], ctx.db);
        return API.success(ctx);
      }
    }, context, false);
  };

  /* This method deletes a `database`. */
  API.database['delete'] = function (context) {
    return API.safeRequest( function(ctx) {
      var their_on_success = ctx.on_success;
      ctx.request = API.safeApply(API.db.deleteDatabase, [ctx.database], API.db);
      return API.extend(ctx, {
        on_success: function (passed_ctx) {
          passed_ctx.db = passed_ctx.result;
          delete passed_ctx.result;
          passed_ctx.on_success = their_on_success;
          API.success(passed_ctx);
        }
      });
    }, context, false);
  };

  /* This is a safe method for opening a given `database` at a given
   * `version`, and optionally a given `store` along with it.
   * This will handle any upgrade events by either opening a database with higher
   * version or triggering a versionchange event.
   */
  API.database.upgrade = function (context) {
    return API.safeRequest( function(ctx) {
      var their_upgrade = ctx.on_upgrade_needed,
          their_success = ctx.on_success;
      if (API.isEmpty(ctx.db) && API.isEmpty(ctx.version)) {
        ctx.error = 'requires a version or db reference';
        return API.error(ctx);
      } else {
        if (API.isTransaction(ctx.transaction) && API.is(ctx.transaction.mode, API.transaction.versionChange)) {
            API.success(ctx);
        } else {
          ctx.version = ctx.version || (ctx.db.version + 1 );
          ctx.on_upgrade_needed = function(passed_ctx) {
            passed_ctx.on_upgrade_needed = their_upgrade;
            passed_ctx.on_success = their_success;
            API.success(passed_ctx);
          };
          API.database.open(ctx);
        }
      }
    }, context, false );
  };

  /* This method loads a database given a database name and version.
   * The database can be retrived on successful callback via the `db`
   * attribute on the context object */
  API.database.open = function (context) {
    return API.safeRequest( function(ctx) {
     var args = [ctx.database],
        their_upgrade = ctx.on_upgrade_needed,
        their_success = ctx.on_success;
      if (API.isDatabase(ctx.db) && API.is(ctx.db.version, ctx.version)) {
        ctx.upgrade = false;
        ctx.opened = false;
        return API.success(ctx);
      } else if (API.isDatabase(ctx.db) && API.isnt(ctx.db.version, ctx.version)) {
        ctx.db.close();
      }
      if (API.exists(ctx.version)) {
        ctx.request = API.db.open(ctx.database, ctx.version)
      } else {
        ctx.request = API.db.open(ctx.database)
      }
      return API.standardRequest( API.extend(ctx, {
        on_success: function (passed_ctx) {
          passed_ctx.upgrade = false;
          passed_ctx.opened = true;
          passed_ctx.on_success = their_success;
          if(API.exists(passed_ctx.request) && API.exists(passed_ctx.request.transaction)) { 
            passed_ctx.request.transaction.oncomplete = function() {
              passed_ctx.db = passed_ctx.request.result;
              passed_ctx.transaction = passed_ctx.request.transaction;
              API.success(passed_ctx);
            }; 
          } else {
            passed_ctx.db = passed_ctx.event.target.result || ( API.exists(passed_ctx.request) ? passed_ctx.request.result : null );
            return API.success(passed_ctx);
          }
        },
        on_upgrade_needed: function (passed_ctx) {
          passed_ctx.upgrade = true;
          passed_ctx.opened = true;
          passed_ctx.on_upgrade_needed = their_upgrade;
          passed_ctx.db = passed_ctx.request.result;
          API.upgrade(passed_ctx);
        }
      }));
    }, context, false);
  };


  /* Returns all stores syncronously, or asyncronously through
   * an on_success callback, given a database. */
  API.databases.get = function (context) {
    return API.safeRequest( function(ctx) {
      var theirs = ctx.on_success;
      if (!API.isFunction(API.db.webkitGetDatabaseNames)) {
        ctx.error = 'webkitGetDatabaseNames unavailable';
        return API.error(ctx);
      }
      ctx.request = API.db.webkitGetDatabaseNames();
      ctx.on_success = function (ctx) {
        ctx.databases = ctx.result;
        delete ctx.result;
        ctx.on_success = theirs;
        return API.success(ctx);
      };
      API.standardRequest(ctx);
      return ctx;
    }, context, false );
  };

  /*
   *  Stores
   *  Namespaces
   *      API.store
   *      API.stores
   *  Methods:
   *      API.store.create
   *      API.store.delete
   *      API.store.get
   *      API.stores.get
   */

  /* This method clears a `database` object `store` of any objects. */
  API.store.clear = function (context) {
    context.type = API.transaction.readWrite;
    return API.safeRequest( function(ctx) {
      ctx.request = API.safeApply(ctx.objectstore.clear, [], ctx.objectstore);
      return ctx;
    }, context );
  };

  /* This method delete a `database` object `store` */
  API.store['delete'] = function (context) {
    var their_on_success = context.on_success;
    context.type = API.transaction.versionChange;
    return API.safeRequest( function(ctx) {
      ctx.on_success = function(passed_ctx) {
        try {
          //returns a void
          passed_ctx.db.deleteObjectStore(passed_ctx.store);
          passed_ctx.on_success = their_on_success;
        } catch (error) {
          passed_ctx.error = error;
        }
        return API.isEmpty(passed_ctx.error) ? API.success(passed_ctx) : API.error(passed_ctx);
      };
      return API.database.upgrade(ctx);
    }, context, false );
  };

  /* This method creates a store named `name` on the given `database`
   * return true if request is successfully requested (no bearing on result)
   * autoincrement defaults to false if a key is specified;
   * key gets set to "key" and autoincrements when key is not specified */
  API.store.create = function (context) {
    var their_on_success = context.on_success,
        their_upgrade = context.on_upgrade_needed;
    context.type = API.transaction.versionChange;
    context.on_success = function(ctx) {
      try {
        ctx.objectstore = ctx.db.createObjectStore(ctx.store, {
          keyPath: API.isString(ctx.store_key_path) ? ctx.store_key_path : null,
          autoIncrement: API.isBoolean(ctx.auto_increment) ? ctx.auto_increment : false
        });
        ctx.on_success = their_on_success;
        return API.success(ctx);
      } catch (error) {
        ctx.error = error;
        API.error(ctx);
      };
    };
    API.database.upgrade(context);
  };


  /* Returns a single store syncronously, or asyncronously through
   * an on_success callback, given a database and store. */
  API.store.get = function (context) {
    context.type = API.transaction.read;
    return API.safeRequest( function(ctx) {
      return API.success(ctx);
    }, context, false );
  };

  /* Returns all stores syncronously, or asyncronously through
   * an on_success callback, given a database. */
  API.stores.get = function (context) {
    context.stores = context.db.objectStoreNames;
    return API.success(context);
  };

  /*
   *  Indexes
   *  Namespaces
   *      API.index
   *      API.indexes
   *  Methods:
   *      API.index.create
   *      API.index.exists
   *      API.index.get
   *      API.index.delete
   *      API.indexes.get
   *      API.indexes.create
   */

  /* This method creates a given index on `key` using `name` and optiona
   * `unique` and `multi_entry` params (both default to false).
   */
  API.index.create = function (context) {
    return API.safeRequest( function(ctx) {
      var their_on_success = ctx.on_success;
      if (API.exists(ctx.transaction) && API.isnt(ctx.transaction.mode, 'versionchange')) {
        delete ctx.transaction;
      }
      ctx.on_success = function(passed_ctx) {
        try {
          passed_ctx.idx = passed_ctx.objectstore.createIndex(passed_ctx.index, passed_ctx.index_key_path, {
            'unique': passed_ctx.index_unique || false,
            'multiEntry': passed_ctx.index_multi_entry || false
          });
          passed_ctx.transaction = passed_ctx.objectstore.transaction;
          passed_ctx.on_success = their_on_success;
          return API.success(passed_ctx);
        } catch (error) {
          passed_ctx.error = error;
          return API.error(passed_ctx);
        }
      };
      API.database.upgrade(ctx);
    }, context, false);
  };

  /* Returns a single index syncronously, or asyncronously through
   * an on_complete callback, given a database, store and index. */
  API.index.get = function (context) {
    context.type = API.transaction.read;
    API.safeRequest( function(ctx) {
      ctx.idx = ctx.objectstore.index(ctx.index);
      API.success(ctx);
    }, context, false);
  };

  /* This method deletes an index with a given `name` on a given
   * `database` and `store`. It creates an implicit database version upgrade.
   */
  API.index['delete'] = function (context) {
    return API.safeRequest( function(ctx) {
      var their_success = ctx.on_success;
      ctx.on_success = function (passed_ctx) {
        try {
          //returns a void
          passed_ctx.objectstore.deleteIndex(ctx.index);
          passed_ctx.on_success = their_success;
          API.success(passed_ctx);
        } catch (error) {
          passed_ctx.error = error;
          API.error(passed_ctx);
        }
      };
      API.database.upgrade(ctx);
    }, context, false);
  };

  /* Returns all indexes syncronously, or asyncronously through
   * an on_success callback, given a database and store. */
  API.indexes.get = function (context) {
    return API.safeRequest( function(ctx) {
      ctx.type = API.transaction.read;
      ctx.transaction = API.transaction.create(ctx);
      ctx.objectstore = ctx.transaction.objectStore(ctx.store);
      ctx.indexes = ctx.objectstore.indexNames;
      return API.success(ctx);
    }, context, false);
  };


  /*
   *  Emtries
   *
   *  Namespaces:
   *      API.entry
   *      API.entries
   *
   *  Methods:
   *      API.object.add
   *      API.object[ 'delete' ]
   *      API.object.get
   *      API.object.put
   *      API.objectResult
   *
   */

  /* This method adds a `data` object to an object `store` `database`. */
  API.object.add = function (context) {
    var their_on_success = context.on_success;
    context.type = API.transaction.readWrite;
    return API.safeRequest( function(ctx) {
      ctx.data = API.isFunction(ctx.data) ? ctx.data() : API.clone(ctx.data);
      ctx.on_success = function(c) {
        c.key = c.result;
        delete c.result;
        c.on_success = their_on_success;
        API.success(c);
      };
      try {
        ctx.request = ctx.objectstore.add(ctx.data);
      } catch( err ) {
        /* DataError: The object store uses out-of-line keys and has no key generator and the key parameter was not provided. */
        /* DataError: Evaluating the object store's key path did not yield a value. */
        /* DataError: Data provided to an operation does not meet requirements. */
        ctx.error = err;
        API.error(ctx);
      }
      return ctx;
    }, context);
  };

  /* This method deletes a `database`'s object `store` row given a `key` */
  API.object['delete'] = function (context) {
    var their_on_success = context.on_success;
    context.type = API.transaction.readWrite;
    return API.safeRequest( function(ctx) {
      var has_range = API.exists(ctx.range) || API.exists(ctx.upper) || API.exists(ctx.lower) || API.exists(ctx.only);
      ctx.on_success = function(passed_ctx) {
        delete passed_ctx.result;
        passed_ctx.on_success = their_on_success;
        API.success(passed_ctx);
      };
      ctx.transaction = API.transaction.create(ctx);
      ctx.key = has_range ? ctx.range || API.range.get(ctx) : ctx.key;
      ctx.request = ctx.objectstore["delete"](ctx.key);
      return ctx;
    }, context );
  };

  /* This method gets a row from an object store named `store` in a database
   * named `database` using an optional `index` and `key`
   */
  API.object.get = function (context) {
    var their_on_success = context.on_success;
    context.type = API.transaction.readWrite;
    return API.safeRequest( function(ctx) {
      var has_range = API.exists(ctx.range) || API.exists(ctx.upper) || API.exists(ctx.lower) || API.exists(ctx.only);
      ctx.key = has_range ? ctx.range || API.range.get(ctx) : ctx.key;
      ctx.type = API.transaction.read;
      ctx.transaction = API.transaction.create(ctx);
      ctx.objectstore = ctx.transaction.objectStore(ctx.store);
      if (API.exists(ctx.index)) {
        try {
          ctx.idx = ctx.objectstore.index(ctx.index);
          ctx.request = API.is(ctx.value, false) ? ctx.idx.getKey(ctx.key) : ctx.idx.get(ctx.key);
        } catch (error) {
          ctx.error = error;
          return API.error(ctx);
        }
      } else {
        ctx.request = ctx.objectstore.get(ctx.key);
      }
      ctx.on_success = function(passed_ctx) {
        passed_ctx.entry = passed_ctx.result;
        delete passed_ctx.result;
        passed_ctx.on_success = their_on_success;
        API.success(passed_ctx);
      };
      return ctx;
    }, context );
  };

  /* This method puts a `data` object to a `database` object `store` using a `key`.
   * This change is made without regard to its previous state. */
  API.object.put = function (context) {
    var their_on_success = context.on_success;
    context.type = API.transaction.readWrite;
    return API.safeRequest( function(ctx) {
      ctx.on_success = function(passed_ctx) {
        passed_ctx.key = passed_ctx.result;
        delete passed_ctx.result;
        passed_ctx.on_success = their_on_success;
        API.success(passed_ctx);
      };
      ctx.data = API.isFunction(ctx.data) ? ctx.data() : ctx.data;
      ctx.objectstore = ctx.transaction.objectStore(ctx.store);
      ctx.request = API.exists(ctx.key) ? ctx.objectstore.put(ctx.data, ctx.key) : ctx.objectstore.put(ctx.data);
      return ctx;
    }, context );
  };


  /* This method deletes rows from a `database` `store` matching the
   * `index` cursor with the given `key_range`
   */
  API.objects['delete'] = function (context) {
    return API.safeRequest( function(ctx) {
      API.standardCursor(ctx, function(passed_ctx) {
        return passed_ctx.cursor['delete']();
      });
    }, context, false );
  };

  /* This method gets rows from a `database` object `store` using a cursor creating
   * with an `index`, `key_range` and optional `direction`. */
  API.objects.get = function (context) {
    return API.safeRequest( function(ctx) {
      API.standardCursor(ctx, function(passed_ctx) {
        return (function() {
          var that = {};
          setTimeout(function() {
            API.safeApply(that.on_success, [passed_ctx], null, that.on_error);
          });
          return that;
        })();
      });
    }, context, false );
  };

  /* This method updates rows in a `database` `store` matching the
   * `index` cursor with the given `key_range`
   */
  API.objects.update = function (context) {
    return API.safeRequest( function(ctx) {
      API.standardCursor(ctx, function(passed_ctx) {
        return passed_ctx.cursor.update(passed_ctx.data);
      });
    }, context, false );
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
  API.range.get = function (context) {
    var result = null,
      left_bound = context.left_bound,
      right_bound = context.right_bound,
      includes_left_bound = context.includes_left_bound,
      includes_right_bound = context.includes_right_bound;
    if (API.exists(left_bound) && API.exists(right_bound) && API.exists(includes_left_bound) && API.exists(includes_right_bound)) {
      result = API.kr.bound(left_bound, right_bound, includes_left_bound, includes_right_bound);
    } else if (API.exists(left_bound) && API.exists(includes_left_bound)) {
      result = API.kr.lowerBound(left_bound, includes_left_bound);
    } else if (API.exists(right_bound) && API.exists(includes_right_bound)) {
      result = API.kr.upperBound(right_bound, includes_right_bound);
    } else if (API.exists(context.value)) {
      result = API.kr.only(context.value);
    }
    context.result = result;
    API.success(context);
    return result;
  };

  /**
   * Directions
   *
   **/

  /* Direction types */

  API.objects.next = function (context) {
    return API.is(false, context.duplicates) ? API.cur.NEXT_NO_DUPLICATE : API.cur.NEXT;
  };

  API.objects.previous = function (context) {
    return API.is(false, context.duplicates) ? API.cur.PREV_NO_DUPLICATE : API.cur.PREV;
  };

  API.deferred = function () {
    var complete = false,
      wasSuccess = null,
      completed = [],
      children = [],
      notifies = [],
      successes = [],
      errors = [],
      finallys = [],
      doFinally = function (args) {
        API.safeIterate(finallys, function (on_finally) {
          API.safeApply(on_finally, args);
        });
      };
    return {
      promise: {
        then: function (on_success, on_error, on_notify) {
          var deferred = API.deferred();
          children.push(deferred);
          var ownchildren;
          if (API.is(complete, true)) {
            API.safeApply(wasSuccess ? on_success : on_error, completed);
          } else {
            API.safeEach([
              [successes, on_success],
              [errors, on_error],
              [notifies, on_notify]
            ], function (i, pair) {
              var fn = pair[1];
              if (API.isFunction(fn)) {
                pair[0].push(fn);
              }
            });
          }
          return deferred.promise;
        },
        'finally': function (on_finally) {
          if (API.is(complete, false)) {
            finallys.push(on_finally);
          } else {
            API.safeApply(on_finally, completed);
          }
        }
      },
      resolve: function () {
        var args = arguments, newargs;
        wasSuccess = true;
        if (API.is(complete, false)) {
          complete = true;
          completed = args;
          API.safeEach(successes, function (i, on_success) {
            newargs = [ API.safeApply(on_success, args) ];
          });
          API.safeEach(children, function (i, child) {
            newargs = [ API.safeApply(child.resolve, args) ];
          });
          doFinally(args);
        }
      },
      notify: function () {
        var args = arguments;
        if (API.is(complete, false)) {
          API.safeEach(notifies, function (i, on_notify) {
            API.safeApply(on_notify, args);
          });
        }
      },
      reject: function () {
        var args = arguments;
        wasSuccess = false;
        completed = args;
        if (API.is(complete, false)) {
          complete = true;
          API.safeEach(errors, function (i, on_error) {
            API.safeApply(on_error, args);
          });
          doFinally(args);
        }
      }
    };
  };

  API.wrap = function (fn, method) {
    return function (context) {
      context = context || {};
      var deferred = API.deferred(),
        reject = deferred.reject,
        resolve = deferred.resolve,
        notify = deferred.notify,
        complex = API.contains(['indexes.create', 'stores.create'], method),
        their_on_success = null,
        their_on_error = null,
        their_on_abort = null,
        their_on_complete = null,
        their_on_upgrade_needed = null,
        their_on_blocked = null,
        their_on_close = null,
        reconstitute = function (args) {
          var obj = args[0];
          if (API.isObject(obj)) {
            /* Only define if previously defined, otherwise wipe. */
            if (API.exists(their_on_success)) {
              obj.on_success = their_on_success;
            } else {
              delete obj.on_success;
            }
            if (API.exists(their_on_error)) {
              obj.on_error = their_on_error;
            } else {
              delete obj.on_error;
            }
            if (API.exists(their_on_abort)) {
              obj.on_abort = their_on_abort;
            } else {
              delete obj.on_abort;
            }
            if (API.exists(their_on_complete)) {
              obj.on_complete = their_on_complete;
            } else {
              delete obj.on_complete;
            }
            if (API.exists(their_on_blocked)) {
              obj.on_blocked = their_on_blocked;
            } else {
              delete obj.on_blocked;
            }
            if (API.exists(their_on_upgrade_needed)) {
              obj.on_upgrade_needed = their_on_upgrade_needed;
            } else {
              delete obj.on_upgrade_needed;
            }
            if (API.exists(their_on_close)) {
              obj.on_close = their_on_close;
            } else {
              delete obj.their_on_close;
            }
            delete obj.event;
          }
          args[0] = obj;
          return args;
        },
        maybeComplete = function (args, type) {
          var actions = [];
          args = reconstitute(args);
          switch (type) {
            case 's':
              actions.push(complex ? notify : resolve);
              break;
            case 'e':
              actions.push(reject);
              break;
            case 'a':
              actions.push(reject);
              break;
            case 'c':
              actions.push(resolve);
              break;
            case 'u':
              actions.push(resolve);
              break;
            case 'b':
              actions.push(reject);
              break;
            case 'l':
              actions.push(resolve);
              break;
            default:
              break;
          }
          API.safeEach(actions, function (i, action) {
            API.safeApply(action, args);
          });
        };
      their_on_success = context.on_success;
      their_on_error = context.on_error;
      their_on_abort = context.on_abort;
      their_on_complete = context.on_complete;
      their_on_upgrade_needed = context.on_upgrade_needed;
      their_on_blocked = context.on_blocked;
      their_on_close = context.on_close;
      if (API.is(complex, false) && API.is(method.split('.')[0], 'record')) {
        complex = API.exists(context.index);
      }
      API.safeApply(fn, [ API.extend(context, {
        on_success: function () {
          //API.safeApply(their_on_success, arguments);
          maybeComplete(arguments, 's');
        },
        on_error: function () {
          //API.safeApply(their_on_error, arguments);
          maybeComplete(arguments, 'e');
        },
        on_abort: function () {
          //API.safeApply(their_on_abort, arguments);
          maybeComplete(arguments, 'a');
        },
        on_complete: function () {
          //API.safeApply(their_on_complete, arguments);
          maybeComplete(arguments, 'c');
        },
        on_upgrade_needed: function () {
          //API.safeApply(their_on_upgrade_needed, arguments);
          maybeComplete(arguments, 'u');
        },
        on_blocked: function () {
          //API.safeApply(their_on_blocked, arguments);
          maybeComplete(arguments, 'b');
        }, 
        on_close: function () {
          //API.safeApply(their_on_close, arguments);
          maybeComplete(arguments, 'l');
        }
      }) ] );
      return deferred.promise;
    };
  };
  /* We programmatically construct the public-facing API for a couple of
   * reasons: less code and protects namespace in advance minification,
   */
  return (function (internal) {
    var Public = {},
      names = [],
      name,
      reg = /^_/;
    API.safeIterate(internal, function (signature, fn) {
      names = signature.split('.');
      if (API.isnt(names[0].match(reg), null)) {
        name = names[0].replace(reg, '');
        Public[name] = Public[name] || {};
        Public[name][names[1]] = fn;
      } else {
        name = names[0];
        Public[name] = Public[name] || {};
        Public[name][names[1]] = API.wrap(fn, signature);
      }
    });
    return Public;
  }({
    'close.database': API.database.close,
    'open.database': API.database.open,
    'remove.database': API.database['delete'],
    'upgrade.database': API.database.upgrade,
    'get.databases': API.databases.get,
    'add.store': API.store.create,
    'clear.store': API.store.clear,
    'get.store': API.store.get,
    'remove.store': API.store['delete'],
    'get.stores': API.stores.get,
    'add.index': API.index.create,
    'get.index': API.index.get,
    'remove.index': API.index['delete'],
    'get.indexes': API.indexes.get,
    'add.entry': API.object.add,
    'remove.entry': API.object['delete'],
    'get.entry': API.object.get,
    'put.entry': API.object.put,
    'remove.entries': API.objects['delete'],
    'get.entries': API.objects.get,
    'update.entries': API.objects.update,
    'tools.each': API.safeEnumerate,
    'tools.extend': API.extend,
    'tools.defer': API.deferred,
    'tools.is': API.is,
    'tools.isnt': API.isnt,
    'tools.exists': API.exists,
    'tools.empty': API.isEmpty
  }));

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

}());