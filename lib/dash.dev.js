
/* Documentation -> http://dashdb.com
 * Repo -> http://github.com/editor/dash
 * License -> MIT
 * Author -> Taylor Buley (@taylorbuley)
 * Copyright -> (c) 2011-2014 Buley LLC
 */

var dash = (function () {

  'use strict';

  var API = {
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
      kr: window.IDBKeyRange
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
    return API.isnt(mixed_var, null) && API.isType("object", mixed_var) && API.is("[object Object]", mixed_var.toString());
  };

  API.isString = function (mixed_var) {
    return API.isType("string", mixed_var);
  };

  API.isFunction = function (mixed_var) {
    return API.isType("function", mixed_var);
  };

  API.isTransaction = function(tx) {
    return (tx instanceof IDBTransaction) ? true : false;
  };

  API.isDatabase = function(db) {
    return (db instanceof IDBDatabase) ? true : false;
  };
  API.isCursorWithValue = function(c) {
    return (c instanceof IDBCursorWithValue) ? true : false;
  };
  API.isOpenRequest = function(o) {
    return (o instanceof IDBOpenDBRequest) ? true : false;
  };

  API.transactionIsAtLeast = function(test, at_least) {
    if (API.is(test, API.transaction.versionChange)) {
      return true;
    } 
    if (API.is(test,API.transaction.readWrite)) {
      if (API.is(at_least,API.transaction.versionChange)){
        return false;
      }
      return true;
    } 
    if (API.is(at_least,API.transaction.read)){
      return true;
    }
    return false;
  };

  //arraylike works (e.g. DOMStringList)
  API.isArray = function (mixed_var) {
    var result = false;
    if (mixed_var instanceof Array || mixed_var instanceof DOMStringList) {
      result = true;
    }
    return result;
  };

  API.isNumber = function (mixed_var) {
    return (API.isType("number", mixed_var) || API.is(isNaN(parseInt(mixed_var, 10), false))) ? true : false;
  };

  API.isBoolean = function (mixed_var) {
    return (API.isType("boolean", mixed_var) || API.is(mixed_var, 'true') || API.is(mixed_var, 'false')) ? true : false;
  };

  API.isType = function (str, mixed_var) {
    return API.is(str, typeof mixed_var);
  };

  /* This method clones `from` and applies it's values to `to`.
   * When optional `deep` is true, it does this recursively on objects.
   */
  API.extend = function (to, from, deep) {
    to = to || {};
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

  API.standardCallbackNames = ['on_success', 'on_error', 'on_abort', 'on_blocked', 'on_upgrade_needed', 'on_close', 'on_complete' ];

  /* Metaprogramming API.callback shortcuts */
  API.safeEach(API.standardCallbackNames, function(i, cb) {
    API[cb.replace(/^on_/g,'')] = function(context) {
      API.safeApply(context[cb], [context]);
      return context;    
    };
  });

  API.standardRequest = function (context) {
    var request = context.request,
        obj = {};
    context = API.standardCallbacks(context);
    if (API.exists(request) && API.is(request.readyState, 'done')) {
      context.result = API.objectResult(context);
      API.success(context);
    }
    API.safeEach(API.standardCallbackNames, function(i, cb) {
      obj[cb.replace(/_/g,'')] = context[cb];
    });
    context.request = API.extend(request, obj);
    return context;
  };

  API.standardCursor = function(ctx, getRequest) {
    var total = 0,
      decorate = function (event) {
        ctx.event = event;
        return ctx;
      },
      their_on_success = ctx.on_success,
      their_on_error = ctx.on_error,
      their_on_abort = ctx.on_abort,
      their_on_complete = ctx.on_complete,
      request;
    ctx.direction = ctx.direction || API.objects.next();
    ctx.range = ctx.range || API.range.get(ctx);
    ctx.type = API.transaction.readWrite;
    ctx.entries = [];
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
      API.standardRequest( API.extend(ctx, {
        on_success: function (passed_ctx) {
          var maybeFinish = function () {
              total += 1;
              if (API.isNumber(passed_ctx.limit) && total >= passed_ctx.limit) {
                API.complete(passed_ctx);
              } else {
                if (API.exists(passed_ctx.cursor)) {
                  if (API.exists(passed_ctx.skip_each)) {
                    try {
                      passed_ctx.cursor.advance(ctx.skip_each);
                    } catch (error) {
                      passed_ctx.error = error;
                      API.error(passed_ctx);
                    }
                  } else if (API.isFunction(passed_ctx.cursor['continue'])) {
                    passed_ctx.request.source.objectStore.transaction.oncomplete = function(event) {
                      passed_ctx.event = event;
                      passed_ctx.on_complete = their_on_complete;
                      API.complete(passed_ctx);
                    };
                    try {
                      passed_ctx.cursor['continue']();
                    } catch (error) {
                      passed_ctx.on_complete = their_on_complete;
                      API.complete(passed_ctx);
                    }
                  } else {
                    passed_ctx.on_complete = their_on_complete;
                    API.complete(passed_ctx);
                  }
                } else {
                  passed_ctx.on_complete = their_on_complete;
                  API.complete(passed_ctx);
                }
              }
            };
          passed_ctx.flagged = false;
          passed_ctx.cursor = passed_ctx.request.result;
          passed_ctx.result = API.exists(passed_ctx.cursor) ? passed_ctx.cursor.value : null;
          if (API.isCursorWithValue(passed_ctx.cursor)) {
            ctx.entries.push(passed_ctx.cursor.value);
          } else {
            return maybeFinish(passed_ctx);
          }
          if (API.exists(passed_ctx.expecting)) {
            API.safeIterate(passed_ctx.expecting, function (attr, expected) {
              var value = (API.hasPath(passed_ctx.result, attr)) ? passed_ctx.result[attr] : null;
              if (API.isFunction(expected)) {
                expected = expected(value);
              }
              if (API.exists(value) && API.exists(expected) && API.isnt(value, expected)) {
                passed_ctx.flagged = true;
              }
            });
          }
          if (API.is(passed_ctx.flagged, false) && API.exists(passed_ctx.cursor) && API.exists(passed_ctx.result)) {
            passed_ctx.data = API.is(passed_ctx.replace, true) ? passed_ctx.result : API.extend(passed_ctx.result, passed_ctx.data);
            try {
              request = getRequest(passed_ctx);
              if (API.exists(request)) {
                passed_ctx.on_success = function (event) {
                  passed_ctx.event = event;
                  maybeFinish(passed_ctx);
                  passed_ctx.on_success = their_on_success;
                  API.success(passed_ctx);
                };
                passed_ctx.on_error = function (event) {
                  passed_ctx.event = event;
                  maybeFinish(passed_ctx);
                  passed_ctx.on_error = their_on_error;
                  API.error(passed_ctx);
                };
                API.standardRequest(passed_ctx);
              } else {
                maybeFinish(passed_ctx);
              }
            } catch (error) {
              passed_ctx.error = error;
              passed_ctx.on_error = their_on_error;
              API.error(ctx);
            }
          } else {
            passed_ctx.on_error = their_on_error;
            API.error(passed_ctx);
          }
        },
        on_error: function (event) {
          ctx.on_error = their_on_error;
          API.error(decorate(event));
        },
        on_abort: function (event) {
          ctx.on_error = their_on_abort;
          return API.abort(decorate(event));
        }
      }));
    } catch (error) {
      ctx.error = error;
      API.error(ctx);
    }
  };

  /* This helper method plucks a value from a request row
   * This allows us to normalize request responses */
  /* Although namespaced, this method is not public-facing */
  API.objectResult = function (context) {
    var event = context.event,
      result = null;
    //cursors
    if (API.isOpenRequest(context.request)) {
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
    context = context || {};
    if (API.isEmpty(context.transaction)) {
      context.transaction = API.transaction.create(context);
    }
    if (API.exists(context.transaction)) {
      context.objectstore = API.maybeAttachStore(context);
    }
    try {
      context = workToDo(context);
      if(API.isnt(doRequest,false)) {
        API.standardRequest(context);
      } 
    } catch( err ) {
      context.error = err;
      API.error(context);
    }     
    return context;
  };

  API.maybeAttachStore = function(context) {
    if (API.exists(context.objectstore) && API.is(context.objectstore.transaction, context.transaction)) {
      return context.objectstore;
    }
    if (API.exists(context.store) && API.isTransaction(context.transaction)) {
      try {
        context.objectstore = API.safeApply(context.transaction.objectStore, [context.store], context.transaction);
      } catch( err ) {
        /* Do nothing, another request may have
         * purposefully deleted the object store */
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
    context.type = context.type || API.transaction.readWrite;
    if (API.exists(context.transaction) && API.isTransaction(context.transaction) && API.transactionIsAtLeast(context.transaction.mode, context.type) && ((!API.exists(context.request) || !API.exists(context.request.readyState)) || API.isnt(context.request.readyState,'done'))) {
      return context.transaction;
    } 
    delete context.transaction;
    if (API.is(context.type, API.transaction.versionChange)) {
      API.error(context);
    } else if (API.isDatabase(context.db)) {
      try {
        context.transaction = context.db.transaction([context.store], context.type);
      } catch ( error ) {
        context.error = error;
        API.error(context);
      } finally {
        return context.transaction;
      }
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
        API.success(ctx);
      }
    }, context, false);
  };

  /* This method deletes a `database`. */
  API.database['delete'] = function (context) {
    context.type = API.transaction.readWrite;
    try { 
      context.request = indexedDB.deleteDatabase(context.database);
      API.standardRequest(context);
    } catch( e ) {
      context.error = e;
      API.error(context);
    }
  };

  /* This is a safe method for opening a given `database` at a given
   * `version`, and optionally a given `store` along with it.
   * This will handle any upgrade events by either opening a database with higher
   * version or triggering a versionchange event.
   */
  API.database.upgrade = function (ctx) {
    var their_upgrade = ctx.on_upgrade_needed,
        their_success = ctx.on_success;
    if (API.isEmpty(ctx.db) && API.isEmpty(ctx.version)) {
      API.error(ctx);
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
  };

  /* This method loads a database given a database name and version.
   * The database can be retrived on successful callback via the `db`
   * attribute on the context object */
  API.database.open = function (ctx) {
    var their_upgrade = ctx.on_upgrade_needed,
        their_success = ctx.on_success;
    if (API.isDatabase(ctx.db) && API.is(ctx.db.version, ctx.version)) {
      ctx.upgrade = false;
      ctx.opened = false;
      return API.success(ctx);
    }
    ctx.request = API.exists(ctx.version) ? indexedDB.open(ctx.database, ctx.version) : indexedDB.open(ctx.database);
    API.standardRequest( API.extend(ctx, {
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
          API.success(passed_ctx);
        }
      },
      on_upgrade_needed: function (passed_ctx) {
        passed_ctx.upgrade = true;
        passed_ctx.opened = true;
        passed_ctx.on_upgrade_needed = their_upgrade;
        passed_ctx.db = passed_ctx.request.result;
        API.upgrade_needed(passed_ctx);
      }
    }));
  };


  /* Returns all stores syncronously, or asyncronously through
   * an on_success callback, given a database. */
  API.databases.get = function (context) {
    var theirs = context.on_success;
    return API.safeRequest( function(ctx) {
      if (!API.isFunction(indexedDB.webkitGetDatabaseNames)) {
        return API.error(ctx);
      }
      ctx.request = indexedDB.webkitGetDatabaseNames();
      ctx.on_success = function (ctx) {
        ctx.databases = ctx.result;
        delete ctx.result;
        ctx.on_success = theirs;
        API.success(ctx);
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
    context.on_success = function(passed_ctx) {
      return API.safeRequest( function(ctx) {
        ctx.db.deleteObjectStore(passed_ctx.store);
        ctx.on_success = their_on_success;
        API.success(ctx);
      }, passed_ctx, false );
    };
    API.database.upgrade(context);
  };

  /* This method creates a store named `name` on the given `database`
   * return true if request is successfully requested (no bearing on result)
   * autoincrement defaults to false if a key is specified;
   * key gets set to "key" and autoincrements when key is not specified */
  API.store.create = function (context) {
    var their_on_success = context.on_success;
    context.type = API.transaction.versionChange;
    context.on_success = function(ctx) {
      try {
        ctx.objectstore = ctx.db.createObjectStore(ctx.store, {
          keyPath: API.isString(ctx.store_key_path) ? ctx.store_key_path : null,
          autoIncrement: API.isBoolean(ctx.auto_increment) ? ctx.auto_increment : false
        });
        ctx.on_success = their_on_success;
        API.success(ctx);
      } catch (error) {
        ctx.error = error;
        API.error(ctx);
      }
    };
    API.database.upgrade(context);
  };


  /* Returns a single store syncronously, or asyncronously through
   * an on_success callback, given a database and store. */
  API.store.get = function (context) {
    context.type = API.transaction.read;
    return API.safeRequest( function(ctx) {
      API.success(ctx);
    }, context, false );
  };

  /* Returns all stores syncronously, or asyncronously through
   * an on_success callback, given a database. */
  API.stores.get = function (context) {
    context.stores = context.db.objectStoreNames;
    API.success(context);
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
  API.index.create = function (ctx) {
    var their_on_success = ctx.on_success;
    ctx.type = API.transaction.versionChange;
    ctx.on_success = function(passed_ctx) {
      return API.safeRequest( function(ctx) {
        ctx.idx = ctx.objectstore.createIndex(ctx.index, ctx.index_key_path, {
          'unique': ctx.index_unique || false,
          'multiEntry': ctx.index_multi_entry || false
        });
        ctx.on_success = their_on_success;
        API.success(ctx);
      }, passed_ctx, false );
    };
    API.database.upgrade(ctx);
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
    var their_success = context.on_success,
        their_error = context.on_error;
    context.type = API.transaction.versionChange;
    context.on_success = function (passed_ctx) {
      passed_ctx.on_error = their_error;
      API.safeRequest( function(ctx) {
        ctx.objectstore.deleteIndex(ctx.index);
        ctx.on_success = their_success;
        API.success(ctx);
      }, passed_ctx, false );
    };
    API.database.upgrade(context);
  };

  /* Returns all indexes syncronously, or asyncronously through
   * an on_success callback, given a database and store. */
  API.indexes.get = function (context) {
    context.type = API.transaction.readWrite;
    return API.safeRequest( function(ctx) {
      ctx.indexes = ctx.objectstore.indexNames;
      API.success(ctx);
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
      ctx.request = ctx.objectstore.add(ctx.data);
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
    context.type = API.transaction.read;
    return API.safeRequest( function(ctx) {
      var has_range = API.exists(ctx.range) || API.exists(ctx.upper) || API.exists(ctx.lower) || API.exists(ctx.only);
      ctx.key = has_range ? ctx.range || API.range.get(ctx) : ctx.key;
      if (API.exists(ctx.index)) {
        ctx.idx = ctx.objectstore.index(ctx.index);
        ctx.request = API.is(ctx.value, false) ? ctx.idx.getKey(ctx.key) : ctx.idx.get(ctx.key);
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
      ctx.request = API.exists(ctx.key) ? ctx.objectstore.put(ctx.data, ctx.key) : ctx.objectstore.put(ctx.data);
      return ctx;
    }, context );
  };


  /* This method deletes rows from a `database` `store` matching the
   * `index` cursor with the given `key_range`
   */
  API.objects['delete'] = function (context) {
    var their_on_success = context.on_success;
    API.standardCursor(context, function(passed_ctx) {
      passed_ctx.entry = passed_ctx.cursor.value;
      passed_ctx.on_success = their_on_success;
      API.success(passed_ctx);
      return passed_ctx.cursor['delete']();
    });
  };

  /* This method gets rows from a `database` object `store` using a cursor creating
   * with an `index`, `key_range` and optional `direction`. */
  API.objects.get = function (context) {
    var their_on_success = context.on_success;
    API.standardCursor(context, function(passed_ctx) {
      passed_ctx.entry = passed_ctx.cursor.value;
      passed_ctx.on_success = their_on_success;
      API.success(passed_ctx);
    });
  };

  /* This method updates rows in a `database` `store` matching the
   * `index` cursor with the given `key_range`
   */
  API.objects.update = function (context) {
    var their_on_success = context.on_success;
    API.standardCursor(context, function(passed_ctx) {
      passed_ctx.entry = passed_ctx.cursor.value;
      passed_ctx.on_success = their_on_success;
      API.success(passed_ctx);
      return passed_ctx.cursor.update(passed_ctx.data);
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
    return API.exists(context) && API.is(false, context.duplicates) ? 'nextunique' : 'next';
  };

  API.objects.previous = function (context) {
    return API.exists(context) && API.is(false, context.duplicates) ? 'prevunique' : 'prev';
  };

  API.deferred = function () {
    var complete = false,
      wasSuccess = null,
      completed = [],
      children = [],
      notifies = [],
      successes = [],
      errors = [];
    return {
      'promise': {
        'then': function (on_success, on_error, on_notify) {
          var deferred = API.deferred();
          children.push(deferred);
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
        'commit': function(on_success, on_error, on_notify) {
          this.then(function(context) {
            API.safeEach(['transaction', 'objectstore', 'idx', 'request', 'result' ], function(i, key) {
              delete context[key];
            });
            setTimeout(function() {  
              API.safeApply(on_success, [context]);
            }, 20);
          }, on_error, on_notify);
        }
      },
      'resolve': function () {
        var args = arguments;
        if (API.is(complete, false)) {
          wasSuccess = true;
          complete = true;
          completed = args;
          API.safeEach(successes, function (i, on_success) {
            API.safeApply(on_success, args);
          });
          API.safeEach(children, function (i, child) {
            API.safeApply(child.resolve, args);
          });
        }
      },
      'notify': function () {
        var args = arguments;
        API.safeEach(notifies, function (i, on_notify) {
          API.safeApply(on_notify, args);
        });
        API.safeEach(children, function (i, child) {
           API.safeApply(child.notify, args);
        });        
      },
      'reject': function () {
        var args = arguments;
        if (API.is(complete, false)) {
          wasSuccess = false;
          complete = true;
          completed = args;
          API.safeEach(errors, function (i, on_error) {
            API.safeApply(on_error, args);
          });
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
        complex = API.contains(['get.entries', 'update.entries', 'remove.entries' ], method),
        callbackMap = {
          success: context.on_success,
          error: context.on_error,
          abort: context.on_abort,
          complete: context.on_complete,
          upgrade_needed: context.on_upgrade_needed,
          blocked: context.on_blocked,
          close: context.on_close
        },
        codeMap = {
          success: 's',
          error: 'e',
          abort: 'a',
          complete: 'c',
          upgrade_needed: 'u',
          blocked: 'b',
          closed: 'l'
        },
        reconstitute = function (args) {
          var obj = args[0];
          if (API.isObject(obj)) {
            /* Only define if previously defined, otherwise wipe. */
            API.safeIterate( callbackMap, function( key, value ) {
              var k = 'on_' + key;
              if (API.isFunction(value)) {
                obj[k] = value;
              } else {
                delete obj[k];
              }
            });
          }
          args[0] = obj;
          return args;
        },
        maybeComplete = function (args, type) {
          var action = null;
          if (API.is(type,'s')){
            action = complex ? notify : resolve;
          } else if (API.is(type,'e')||API.is(type,'a')||API.is(type,'b')) {
            action = reject;
          } else {
            action = resolve;
          }
          API.safeApply(action, reconstitute(args));
        },
        obj = {};
      if (API.is(complex, false) && API.is(method.split('.')[0], 'record')) {
        complex = API.exists(context.index);
      }
      API.safeIterate( callbackMap, function(key, value) {
        obj['on_' + key] = function() {
          API.safeApply(callbackMap[key], arguments);
          maybeComplete(arguments, codeMap[key]);
        };
      });
      API.safeApply(fn, [ API.extend(context, obj) ]);
      return deferred['promise'];
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
    'tools.extend': API.extend,
    'tools.defer': API.deferred
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