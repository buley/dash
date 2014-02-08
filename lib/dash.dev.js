
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
    return API.isType("object", mixed_var) && API.is("[object Object]", mixed_var.toString());
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
      context.result = API.object.result(context);
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

  API.standardCallbacks = function (context) {
    var clone = {},
      decorate = function (event) {
        context.event = event;
        context.transaction = event.target.transaction;
        context.result = API.object.result(context);
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

  API.maybeAttachStore = function(context) {
    if (API.exists(context.objectstore)) {
      return context.objectstore;
    }
    if (API.exists(context.store) && API.isTransaction(context.transaction)) {
      try {
        context.objectstore = API.safeApply(context.transaction.objectStore, [context.store], context.transaction);
      } catch( error ) {
        context.error = error;
      }
    }
    return context.objectstore;
  };

  /*
   *   Database
   *   Namespaces:
   *       API.database
   *  Methods:
   *      API.database.remove
   *      API.database.close
   *      API.database.open
   *      API.database.set
   *      API.database.setVersionRequest
   *      API.database.upgrade
   *      API.database.upgradeRequest
   *      API.database.get
   */

  /* Close a single db named `database`, aborting any transactions. */

  API.database.close = function (context) {

    if (API.hasPath(context, 'db.close')) {
      context.request = API.safeApply(context.db.close, [], context.db);
      context = API.extend( {}, {
        on_success: context.on_success,
        on_error: context.on_error,
        on_abort: context.on_abort,
        on_blocked: context.on_blocked,
        request: context.request
      } );
      delete API.dbs[context.database];
      return API.success(context);
    } else {
      context.error = 'No close method exists';
      return API.error(context);
    }

  };

  /* This method caches a loaded database for later use */
  API.database.set = function (context) {
    API.dbs[context.database] = context.db;
    return context.db;
  };

  API.database.get = function (context) {
    return API.exists(context.db) ? context.db : API.dbs[context.database];
  };

  /* This method deletes a `database`. */
  API.database['delete'] = function (context) {
    var their_on_success = context.on_success;
    context.request = API.safeApply(API.db.deleteDatabase, [context.database], API.db);
    API.standardRequest( API.extend(context, {
      on_success: function (passed_context) {
        passed_context.db = passed_context.result;
        delete passed_context.result;
        passed_context.on_success = their_on_success;
        API.success(passed_context);
      }
    }));
  };

  /* This is a safe method for opening a given `database` at a given
   * `version`, and optionally a given `store` along with it.
   * This will handle any upgrade events by either opening a database with higher
   * version or triggering a versionchange event.
   */
  API.database.upgrade = function (context) {
    var their_upgrade = context.on_upgrade_needed,
        their_success = context.on_success;
    if (API.isEmpty(context.db) && API.isEmpty(context.version)) {
      context.error = 'requires a version or db reference';
      return API.error(context);
    } else {
      if (API.isTransaction(context.transaction) && API.is(context.transaction.mode, API.transaction.versionChange)) {
          API.success(context);
      } else {
        context.version = context.version || (context.db.version + 1 );
        delete context.on_success;
        context.on_upgrade_needed = function(passed_context) {
          passed_context.on_upgrade_needed = their_upgrade;
          passed_context.on_success = their_success;
          API.success(passed_context);
        };
        API.database.open(context);
      }
    }
  };

  /* This method loads a database given a database name and version.
   * The database can be retrived on successful callback via the `db`
   * attribute on the context object */
  API.database.open = function (context) {
    var args = [context.database],
      their_upgrade = context.on_upgrade_needed,
      their_success = context.on_success;
    if (API.isDatabase(context.db) && API.is(context.db.version, context.version)) {
      context.upgrade = false;
      context.opened = false;
      return API.success(context);
    }
    if (API.exists(context.version)) {
      context.request = API.db.open(context.database, context.version)
    } else {
      context.request = API.db.open(context.database)
    }
    delete context.on_success;
    delete context.on_upgrade_needed;
    API.standardRequest(API.extend(context, {
      on_success: function (passed_context) {
        passed_context.upgrade = false;
        passed_context.opened = true;
        passed_context.on_success = their_success;
        if(passed_context.request.transaction) { 
          passed_context.request.transaction.oncomplete = function() {
            passed_context.db = passed_context.request.result;
            passed_context.transaction = passed_context.request.transaction;
            return API.success(passed_context);
          }; 
        } else {
          if (API.exists(passed_context.event)) {
            passed_context.db = passed_context.event.target.result;
            passed_context.transaction = passed_context.event.target.transaction;
          } else {
            passed_context.transaction = passed_context.request.transaction;
          }
          return API.success(passed_context);
        }
      },
      on_upgrade_needed: function (passed_context) {
        passed_context.upgrade = true;
        passed_context.opened = true;
        passed_context.on_upgrade_needed = their_upgrade;
        passed_context.db = passed_context.request.result;
        passed_context.transaction = passed_context.request.transaction;
        API.upgrade(passed_context);
      }
    }));
  };

  /* This method shows a database either from the
   * cache or by passing the request to API.database.open(().
   * The database can be retrived on successful callback via the `db`
   * attribute on the context object. */
  API.database.get = function (context) {
    var database = context.database,
      theirs = context.on_success;
    if (API.exists(API.dbs[database])) {
      context.db = API.dbs[database];
      API.success(context);
    } else {
      API.database.open(API.extend(context, {
        on_success: function (context) {
          context.db = context.result;
          delete context.result;
          context.on_success = theirs;
          API.success(context);
        }
      }));
    }
  };

  /* Returns all stores syncronously, or asyncronously through
   * an on_success callback, given a database. */
  API.databases.get = function (context) {
    var theirs = context.on_success;
    if (!API.isFunction(API.db.webkitGetDatabaseNames)) {
      context.error = 'webkitGetDatabaseNames unavailable';
      return API.error(context);
    }
    context.request = API.db.webkitGetDatabaseNames();
    return API.standardRequest(API.extend(context, {
      on_success: function (context) {
        context.databases = context.result;
        delete context.result;
        context.on_success = theirs;
        return API.success(context);
      }
    }));
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
    context = API.maybeAttachStore(context);
    if (API.exists(context.objectsstore)) {
      context.request = API.safeApply(context.objectstore.clear, context.objectstore);
      API.standardRequest(context);
    }

    return context;
  };

  /* This method delete a `database` object `store` */
  API.store['delete'] = function (context) {
    var their_on_success = context.on_success;
    if (API.exists(context.transaction) && API.isnt(context.transaction.mode, 'versionchange')) {
      delete context.transaction;
    }
    context.on_success = function(passed_context) {
      try {
        //returns a void
        passed_context.db.deleteObjectStore(passed_context.store);
        passed_context.on_success = their_on_success;
      } catch (error) {
        passed_context.error = error;
      }
      return API.isEmpty(passed_context.error) ? API.success(passed_context) : API.error(passed_context);
    };
    return API.database.upgrade(context);
  };

  /* This method creates a store named `name` on the given `database`
   * return true if request is successfully requested (no bearing on result)
   * autoincrement defaults to false if a key is specified;
   * key gets set to "key" and autoincrements when key is not specified */
  API.store.create = function (context) {
    var their_on_success = context.on_success,
        their_upgrade = context.on_upgrade_needed;
    if (API.exists(context.transaction) && API.isnt(context.transaction.mode, 'versionchange')) {
      delete context.transaction;
    }
    context.on_success = function(passed_context) {
      try {
        passed_context.objectstore = passed_context.db.createObjectStore(passed_context.store, {
          keyPath: API.isString(passed_context.store_key_path) ? passed_context.store_key_path : null,
          autoIncrement: API.isBoolean(passed_context.auto_increment) ? passed_context.auto_increment : false
        });
        passed_context.transaction = passed_context.objectstore.transaction;
        passed_context.on_success = their_on_success;
        return API.success(passed_context);
      } catch (error) {
        passed_context.error = error;
        return API.error(passed_context);
      }
    };
    API.database.upgrade(context);
  };


  /* Returns a single store syncronously, or asyncronously through
   * an on_success callback, given a database and store. */
  API.store.get = function (context) {
    context.type = API.transaction.read;
    context.transaction = API.transaction.create(context);
    context.objectstore = context.transaction.objectStore(context.store);
    return API.success(context);
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
    var their_on_success = context.on_success;
    if (API.exists(context.transaction) && API.isnt(context.transaction.mode, 'versionchange')) {
      delete context.transaction;
    }
    context.on_success = function(passed_context) {
      try {
        passed_context.idx = passed_context.objectstore.createIndex(passed_context.index, passed_context.index_key_path, {
          'unique': passed_context.index_unique || false,
          'multiEntry': passed_context.index_multi_entry || false
        });
        passed_context.transaction = passed_context.objectstore.transaction;
        passed_context.on_success = their_on_success;
        return API.success(passed_context);
      } catch (error) {
        passed_context.error = error;
        return API.error(passed_context);
      }
    };
    API.database.upgrade(context);
  };

  /* Returns a single index syncronously, or asyncronously through
   * an on_complete callback, given a database, store and index. */
  API.index.get = function (context) {
    if (!API.isStore(context.objectstore)) {
      context.type = API.transaction.read;
      context.transaction = API.transaction.create(context);
      context.objectstore = context.transaction.objectStore(context.store);
    }
    context.idx = context.objectstore.index(context.index);
    return API.success(context);
  };

  /* This method deletes an index with a given `name` on a given
   * `database` and `store`. It creates an implicit database version upgrade.
   */
  API.index['delete'] = function (context) {
    var their_success = context.on_success;
    context.on_success = function (passed_context) {
      try {
        //returns a void
        passed_context.objectstore.deleteIndex(context.index);
        passed_context.on_success = their_success;
        API.success(passed_context);
      } catch (error) {
        passed_context.error = error;
        API.error(passed_context);
      }
    };
    API.database.upgrade(context);
  };

  /* Returns all indexes syncronously, or asyncronously through
   * an on_success callback, given a database and store. */
  API.indexes.get = function (context) {
    context.type = API.transaction.read;
    context.transaction = API.transaction.create(context);
    context.objectstore = context.transaction.objectStore(context.store);
    context.indexes = context.objectstore.indexNames;
    return API.success(context);
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
    if (API.isTransaction(context.transaction) && API.transactionIsAtLeast(context.transaction.mode, context.type)) {
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
   *  Rows
   *
   *  Namespaces:
   *      API.record
   *
   *  Methods:
   *      API.object.add
   *      API.object[ 'delete' ]
   *      API.object.get
   *      API.object.put
   *      API.object.result
   *
   */

  /* This method adds a `data` object to an object `store` `database`. */
  API.object.add = function (context) {
    context.data = API.isFunction(context.data) ? context.data() : API.clone(context.data);
    context.type = API.transaction.readWrite;
    context.transaction = API.transaction.create(context);
    context.objectstore = context.transaction.objectStore(context.store);
    context.request = context.objectstore.add(context.data);
    return API.standardRequest(context);
  };

  /* This method deletes a `database`'s object `store` row given a `key` */
  API.object['delete'] = function (context) {
    context.type = API.transaction.readWrite;
    context.transaction = API.transaction.create(context);
    context.objectstore = context.transaction.objectStore(context.store);
    context.request = context.objectstore["delete"](context.key);
    return API.standardRequest(context);
  };

  /* This method gets a row from an object store named `store` in a database
   * named `database` using an optional `index` and `key`
   */
  API.object.get = function (context) {
    var has_range = API.exists(context.range) || API.exists(context.upper) || API.exists(context.lower) || API.exists(context.only);
    context.key = has_range ? context.range || API.range.get(context) : context.key;
    context.type = API.transaction.read;
    context.transaction = API.transaction.create(context);
    context.objectstore = context.transaction.objectStore(context.store);
    if (API.exists(context.index)) {
      try {
        context.idx = context.objectstore.index(context.index);
        context.request = API.is(context.value, false) ? context.idx.getKey(context.key) : context.idx.get(context.key);
      } catch (error) {
        context.error = error;
        return API.error(context);
      }
    } else {
      context.request = context.objectstore.get(context.key);
    }
    return API.standardRequest(context);
  };

  /* This method puts a `data` object to a `database` object `store` using a `key`.
   * This change is made without regard to its previous state. */
  API.object.put = function (context) {
    context.data = API.isFunction(context.data) ? context.data() : context.data;
    context.type = API.transaction.readWrite;
    context.transaction = API.transaction.create(context);
    context.objectstore = context.transaction.objectStore(context.store);
    context.request = API.exists(context.key) ? context.objectstore.put(context.data, context.key) : context.objectstore.put(context.data);
    return API.standardRequest(context);
  };

  /* This helper method plucks a value from a request row
   * This allows us to normalize request responses */
  /* Although namespaced, this method is not public-facing */
  API.object.result = function (context) {
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

  /* This method deletes rows from a `database` `store` matching the
   * `index` cursor with the given `key_range`
   */
  API.objects['delete'] = function (context) {
    var total = 0,
        decorate = function (event) {
          context.event = event;
          return context;
        },
        doError = function(error, ctx) {
          ctx.error = error;
          return API.error(ctx);
        },
        their_on_error = context.on_error,
        their_on_success = context.on_success;
    context.direction = context.direction || API.objects.next();
    context.range = context.range || API.range.get(context);
    context.type = API.transaction.readWrite;
    context.transaction = API.transaction.create(context);
    context.objectstore = context.transaction.objectStore(context.store);
    try {
      if (!API.isEmpty(context.index)) {
        context.idx = context.objectstore.index(context.index);
        context.request = context.idx.openCursor(context.range, context.direction);
      } else {
        context.request = context.objectstore.openCursor(context.range, context.direction);
      }
      API.extend(context.request, {
        onsuccess: function (event) {
          var ctx = {
              event: event
            },
            maybeFinish = function () {
              total += 1;
              if (API.isNumber(context.limit) && total >= context.limit) {
                API.complete(context);
              } else {
                if (API.exists(context.cursor)) {
                  if (API.exists(context.skip_each)) {
                    try {
                      context.cursor.advance(context.skip_each);
                    } catch (error) {
                      return doError(error, context);
                    }
                  } else if (API.isFunction(context.cursor['continue'])) {
                    try {
                      context.cursor['continue']();
                    } catch (error) {
                      return doError(error, context);
                    }
                  }
                }
              }
            };
          context.flagged = false;
          context.cursor = API.object.result(ctx);
          context.result = API.object.result(ctx);
          context.event = event;
          if (API.exists(context.expecting)) {
            API.safeIterate(context.expecting, function (attr, expected) {
              var value = (API.hasPath(context.result, attr)) ? context.result[attr] : null;
              if (API.isFunction(context.expected)) {
                context.expected = expected(value);
              }
              if (API.exists(value) && API.exists(context.expected) && API.isnt(value, context.expected)) {
                context.flagged = true;
              }
            });
          }
          if (API.is(context.flagged, false) && API.exists(context.cursor) && API.exists(context.result)) {
            if (API.exists(context.skip)) {
              try {
                context.cursor.advance(context.skip);
              } catch (error) {
                context.error = error;
                API.error(context);
              }
            } else {
              try {
                API.extend(context.cursor['delete'](), {
                  onsuccess: function (context) {
                    maybeFinish();
                    context.on_success = their_on_success;
                    API.success(context);
                  },
                  onerror: function () {
                    context.on_error = their_on_error;
                    API.error(context);
                  }
                });
              } catch (error) {
                context.error = error;
                API.error(context);
              }
            }
          } else {
            API.error(context);
          }
        },
        onerror: function (event) {
          API.error(decorate(event));
        },
        onabort: function (event) {
          API.abort(decorate(event));
        }
      });
    } catch (error) {
      context.error = error;
      API.error(context);
    }
  };

  /* This method gets rows from a `database` object `store` using a cursor creating
   * with an `index`, `key_range` and optional `direction`. */
  API.objects.get = function (context) {
    var total = 0,
      decorate = function (event) {
        context.event = event;
        return context;
      };
    context.range = context.range || API.range.get(context);
    context.type = API.transaction.readWrite;
    context.transaction = API.transaction.create(context);
    try {
      if (!API.isEmpty(context.index)) {
        context.request = context.transaction.index(context.index).openCursor(context.key_range, context.direction);
      } else {
        context.request = context.transaction.openCursor(context.key_range, context.direction);
      }
      API.extend(context.request, {
        onsuccess: function (event) {
          var maybeFinish = function () {
              total += 1;
              if (API.isNumber(context.limit) && total >= context.limit) {
                return API.complete(context);
              } 
              if (API.exists(context.cursor)) {
                if (API.exists(context.skip_each)) {
                  try {
                    context.cursor.advance(context.skip_each);
                  } catch (error) {
                    context.error = error;
                    return API.error(context);
                  }
                } else if (API.isFunction(context.cursor['continue'])) {
                  try {
                    context.cursor['continue']();
                  } catch (error) {
                    context.error = error;
                    return API.error(context);
                  }
                }
              }
            };
          context.event = event;
          context.cursor = API.object.result(context);
          context.result = API.object.result(context);
          if (API.exists(context.expecting)) {
            API.safeIterate(context.expecting, function (attr, expected) {
              var value = (API.hasPath(context.result, attr)) ? context.result[attr] : null;
              if (API.isFunction(expected)) {
                expected = expected(value);
              }
              if (API.exists(value) && API.exists(expected) && API.isnt(value, expected)) {
                context.flagged = true;
              }
            });
          }
          if (API.is(context.flagged, true) || API.isEmpty(context.cursor)) {
            API.error(context);
          } else {
            if (API.exists(context.skip)) {
              try {
                context.cursor.advance(context.skip);
              } catch (error) {
                context.error = error;
                API.error(context);
              }
            } else {
              API.success(context);
              maybeFinish();
            }
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
      context.error = error;
      return API.error(context);
    }
  };

  /* This method updates rows in a `database` `store` matching the
   * `index` cursor with the given `key_range`
   */
  API.objects.update = function (context) {
    var total = 0,
      decorate = function (event) {
        context.event = event;
        return context;
      },
      their_on_success = context.on_success,
      their_on_error = context.on_error;
    context.direction = context.direction || API.objects.next();
    context.range = context.range || API.range.get(context);
    context.type = API.transaction.readWrite;
    context.transaction = API.transaction.create(context);
    context.objectstore = context.transaction.objectStore(context.store);
    context.data = API.isFunction(context.data) ? context.data() : API.clone(context.data);
    try {
      if (!API.isEmpty(context.index)) {
        context.idx = context.objectstore.index(context.index);
        context.request = context.idx.openCursor(context.range, context.direction);
      } else {
        context.request = context.objectstore.openCursor(context.range, context.direction);
      }
      API.extend(context.request, {
        onsuccess: function (event) {
          var maybeFinish = function () {
              total += 1;
              if (API.isNumber(context.limit) && total >= context.limit) {
                API.complete(context);
              } else {
                if (API.exists(context.cursor)) {
                  if (API.exists(context.skip_each)) {
                    try {
                      context.cursor.advance(context.skip_each);
                    } catch (error) {
                      context.error = error;
                      API.error(context);
                    }
                  } else if (API.isFunction(context.cursor['continue'])) {
                    try {
                      context.cursor['continue']();
                    } catch (error) {
                      context.result = error;
                      API.complete(context);
                    }
                  }
                }
              }
            };
          context.cursor = event.target.result;
          context.result = event.target.result.value;
          context.flagged = false;
          context.event = event;
          if (API.exists(context.expecting)) {
            API.safeIterate(context.expecting, function (attr, expected) {
              var value = (API.hasPath(context.result, attr)) ? context.result[attr] : null;
              if (API.isFunction(expected)) {
                expected = expected(value);
              }
              if (API.exists(value) && API.exists(expected) && API.isnt(value, expected)) {
                context.flagged = true;
              }
            });
          }
          if (API.is(context.flagged, false) && API.exists(context.cursor) && API.exists(context.result)) {
            context.data = API.is(context.replace, true) ? context.result : API.extend(context.result, context.data);
            try {
              API.extend(context.cursor.update(context.data), {
                onsuccess: function () {
                  maybeFinish();
                  context.on_success = their_on_success;
                  return API.success(context);
                },
                onerror: function () {
                  context.on_error = their_on_error;
                  return API.error(context);
                }
              });
            } catch (error) {
              context.error = error;
              return API.error(context);
            }
          } else {
            return API.error(context);
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
      context.error = error;
      return API.error(context);
    }
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
        var args = arguments;
        wasSuccess = true;
        completed = args;
        if (API.is(complete, false)) {
          complete = true;
          API.safeEach(successes, function (i, on_success) {
            API.safeApply(on_success, args);
          });
          API.safeEach(children, function (i, child) {
            API.safeApply(child.resolve, args);
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
          maybeComplete(arguments, 's');
          API.safeApply(their_on_success, arguments);
        },
        on_error: function () {
          maybeComplete(arguments, 'e');
          API.safeApply(their_on_error, arguments);
        },
        on_abort: function () {
          maybeComplete(arguments, 'a');
          API.safeApply(their_on_abort, arguments);
        },
        on_complete: function () {
          maybeComplete(arguments, 'c');
          API.safeApply(their_on_complete, arguments);
        },
        on_upgrade_needed: function () {
          maybeComplete(arguments, 'u');
          API.safeApply(their_on_upgrade_needed, arguments);
        },
        on_blocked: function () {
          maybeComplete(arguments, 'b');
          API.safeApply(their_on_blocked, arguments);
        }, 
        on_close: function () {
          maybeComplete(arguments, 'l');
          API.safeApply(their_on_close, arguments);
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
    'get.database': API.database.get,
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
    'add.object': API.object.add,
    'remove.object': API.object['delete'],
    'get.object': API.object.get,
    'put.object': API.object.put,
    'remove.objects': API.objects['delete'],
    'get.objects': API.objects.get,
    'update.objects': API.objects.update,
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