/* Documentation -> http://dashdb.com
 * Repo -> http://github.com/editor/dash
 * License -> MIT
 * Author -> Taylor Buley (@taylorbuley)
 * Copyright -> (c) 2011-2014 Buley LLC
 */
var dash = (function (environment) {

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
	      entry: {},
	      entries: {},
              behavior: {},
	      transaction: {},
	      db: environment.indexedDB || indexedDB,
	      kr: environment.IDBKeyRange || IDBKeyRange,
	      sl: environment.DOMStringList || ( self ? Array : DOMStringList )
    },
      Public;

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

  API.standardCallbackNames = ['on_success', 'on_error', 'on_abort', 'on_blocked', 'on_upgrade_needed', 'on_close', 'on_complete'];
  API.attribs = [
    'amount',
    'auto_increment',
    'callback',
    'collect',
    'data',
    'database',
    'databases',
    'db',
    'direction',
    'duplicates',
    'entries',
    'entry',
    'idx',
    'index',
    'index_key_path',
    'index_multi_entry',
    'index_unique',
    'indexes',
    'key',
    'key_path',
    'last_entry',
    'next_key',
    'next_primary_key',
    'limit',
    'match',
    'map',
    'multi_entry',
    'new_version',
    'objectstore',
    'old_version',
    'primary_key',
    'skip',
    'store',
    'store_key_path',
    'stores',
    'total',
    'throttle',
    'type',
    'unique',
    'value',
    'version'
  ];

  API.attribs.push.apply(API.attribs, API.standardCallbackNames);

  API.results = function (results_ctx) {
    var obj = {},
        toArray = function(list) {
          var copied = [];
	  API.safeEach(list, function(el) {
            copied.push(el);
          } );
	  return copied;
        };
    API.safeEach(API.attribs, function (k) {
      if (API.exists(results_ctx[k])) {
        if (API.is(k, 'db')) {
          obj[k] = {
            name: results_ctx[k].name,
            version: results_ctx[k].version,
            objectStoreNames: toArray( results_ctx[k].objectStoreNames )
          };
        } else if (API.is(k, 'objectstore')) {
          obj[k] = {
            name: results_ctx[k].name,
            indexNames: toArray( results_ctx[k].indexNames ),
            autoIncrement: results_ctx[k].autoIncrement,
            keyPath: results_ctx[k].keyPath
          };
        } else if (API.is(k, 'idx')) {
          obj[k] = {
            name: results_ctx[k].name,
            multiEntry: results_ctx[k].multiEntry,
            unique: results_ctx[k].unique,
            keyPath: results_ctx[k].keyPath
          };
        } else if (API.is(k, 'indexes') || API.is(k, 'stores') || API.is(k, 'databases')){
          obj[k] = toArray(results_ctx[k]);
        } else {
          obj[k] = results_ctx[k];
        }
      }
    });
    return obj;
  };

  API.args = function (args_ctx) {
    var obj = {};
    API.safeEach(API.attribs, function (k) {
      if (API.exists(args_ctx[k])) {
        obj[k] = args_ctx[k];
      }
    });
    return obj;
  };

  //arraylike works (e.g. DOMStringList)
  API.isArray = function (mixed_var) {
    var result = false;
    if (mixed_var instanceof Array || mixed_var instanceof API.sl) {
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
  API.safeEach = function (items, callback, inc) {
    var x,
      count = items.length;
    inc = inc || 1;
    for (x = 0; x < count; x += inc) {
      API.safeApply(callback, [items[x], x]);
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

  /* Metaprogramming API.callback shortcuts */
  API.safeEach(API.standardCallbackNames, function (cb) {
    API[cb.replace(/^on_/g, '')] = function (context) {
      API.safeApply(context[cb], [context]);
      return context;
    };
  });

  API.standardCursor = function (cursor_ctx, getRequest) {
    var decorate = function (event) {
      cursor_ctx.event = event;
      return cursor_ctx;
    },
      request,
      count = 0,
      limit = cursor_ctx.limit,
      skip = cursor_ctx.skip,
      skips = 0,
      finish = function(e) {
        cursor_ctx.cursor = request.result;
        cursor_ctx = decorate(e);
        cursor_ctx.next_key = cursor_ctx.key;
        delete cursor_ctx.key;
        cursor_ctx.next_primary_key = cursor_ctx.primary_key;
        delete cursor_ctx.primary_key;
        cursor_ctx.last_entry = cursor_ctx.entry;
        delete cursor_ctx.entry;
        delete cursor_ctx.direction;
        cursor_ctx.db.close();
        API.complete(cursor_ctx);
      };
    cursor_ctx.direction = cursor_ctx.direction || API.entries.next();
    cursor_ctx.range = cursor_ctx.range || API.range.get(cursor_ctx);
    if (API.is(cursor_ctx.collect, true)) {
      cursor_ctx.entries = [];
    }
    cursor_ctx.data = API.isFunction(cursor_ctx.data) ? cursor_ctx.data() : API.clone(cursor_ctx.data);
    if (API.isEmpty(cursor_ctx.transaction)) {
      cursor_ctx.db = cursor_ctx.event.target.result;
      cursor_ctx.transaction = cursor_ctx.db.transaction([cursor_ctx.store], cursor_ctx.type);
    }
    if (API.isEmpty(cursor_ctx.objectstore)) {
      cursor_ctx.objectstore = cursor_ctx.transaction.objectStore(cursor_ctx.store);
    }
    if (API.isEmpty(cursor_ctx.idx) && !API.isEmpty(cursor_ctx.index)) {
      cursor_ctx.idx = cursor_ctx.objectstore.index(cursor_ctx.index);
    }
    if (!API.isEmpty(cursor_ctx.index)) {
      request = cursor_ctx.idx.openCursor(cursor_ctx.range, cursor_ctx.direction);
    } else {
      request = cursor_ctx.objectstore.openCursor(cursor_ctx.range, cursor_ctx.direction);
    }
    cursor_ctx.amount = cursor_ctx.amount || 0;
    request.transaction.addEventListener('complete', function (e) {
      finish(e);
    });
    request.transaction.addEventListener('error', function (e) {
      cursor_ctx.error = e;
      cursor_ctx = decorate(e);
      API.error(cursor_ctx);
    });
    request.addEventListener('success', function (e) {
      cursor_ctx.cursor = request.result;
      if (API.is(cursor_ctx.collect, true)) {
        cursor_ctx.entries = cursor_ctx.entries || [];
      }
      if (API.exists(cursor_ctx.cursor)) {
        cursor_ctx.primary_key = cursor_ctx.cursor.primaryKey;
        cursor_ctx.key = cursor_ctx.cursor.key;
        cursor_ctx.direction = cursor_ctx.cursor.direction;
      }
      cursor_ctx = decorate(e);
      if ( !API.isEmpty(skip) ) {
        if (API.exists(cursor_ctx.cursor.advance)) {
          cursor_ctx.cursor.advance(skip);
        }
	skip = null;
      } else {
        if ( API.isEmpty(limit) || count++ < limit ) {
  	  API.safeApply(getRequest, [cursor_ctx]);
        } else {
	  cursor_ctx.entry = cursor_ctx.cursor.value;
  	  finish(e);
        }       
      }
    });
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


  /*
   *   Database
   *   Namespaces:
   *       API.database
   *  Methods:
   *      API.database.remove
   *      API.database.close
   *      API.database.get
   */

  /* Close a single db named `database`, aborting any transactions. */
  /* IDB returns a void on deletes which makes these essentially
   * syncronous calls. We support both techniques through the silent param */
  API.database.close = function (close_ctx, silent) {
    close_ctx.db.close();
    if (API.isnt(silent, true)) {
      API.success(close_ctx);
    }
  };

  /* This method deletes a `database`. */
  /* As with `database.close`, a no-callback ("silent") syncronous approach 
   * is supported with an optional true value for the `silent` param */
  API.database.remove = function (remove_context, silent) {
    API.db.deleteDatabase(remove_context.database);
    if (API.isnt(silent, true)) {
      API.success(remove_context);
    }
  };

  /* This method loads a database given a database name and version.
   * The database can be retrived on successful callback via the `db`
   * attribute on the context object */
  // TODO: Localize open_ctx.request and provide any results from within this method
  API.database.get = function (open_ctx) {
    var their_upgrade = open_ctx.on_upgrade_needed,
      their_success = open_ctx.on_success,
      their_on_blocked = open_ctx.on_blocked,
      was_upgrade = false,
      decorate = function (event, context) {
        context.event = event;
        context.transaction = context.request ? context.request.transaction : event.target.transaction;
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
    open_ctx.request = API.isNumber(open_ctx.version) ? API.db.open(open_ctx.database, open_ctx.version) : API.db.open(open_ctx.database);
    if (open_ctx.db) {
      open_ctx.db.close();
    }
    open_ctx.request.addEventListener('success', function (event) {
      if (was_upgrade) {
        return;
      }
      open_ctx = decorate(event, open_ctx);
      open_ctx.upgrade = false;
      open_ctx.opened = true;
      open_ctx.on_success = their_success;
      open_ctx.db = open_ctx.event.target.result;
      API.success(open_ctx);
    });
    open_ctx.request.addEventListener('upgradeneeded', function (event) {
      was_upgrade = true;
      open_ctx = decorate(event, open_ctx);
      open_ctx.upgrade = true;
      open_ctx.opened = true;
      open_ctx.on_upgrade_needed = their_upgrade;
      API.upgrade_needed(open_ctx);
    });
    open_ctx.request.addEventListener('blocked', function (event) {
      open_ctx = decorate(event, open_ctx);
      API.safeApply(their_on_blocked, [open_ctx]);
    });

  };


  /* Returns all stores syncronously, or asyncronously through
   * an on_success callback, given a database. */
  API.databases.get = function (get_ctx) {
    var theirs = get_ctx.on_success;
    if (!API.isFunction(API.db.webkitGetDatabaseNames)) {
      return API.error(get_ctx);
    }
    get_ctx.request = API.db.webkitGetDatabaseNames();
    get_ctx.request.addEventListener('success', function (event) {
      get_ctx.databases = event.target.result;
      get_ctx.on_success = theirs;
      API.success(get_ctx);
    });
  };

  /*
   *  Stores
   *  Namespaces
   *      API.store
   *      API.stores
   *  Methods:
   *      API.store.delete
   *      API.store.get
   *      API.stores.get
   */

  /* This method clears a `database` object `store` of any objects. */
  API.store.clear = function (clear_ctx) {
    clear_ctx.objectstore.clear();
    API.success(clear_ctx);
  };

  /* This method delete a `database` object `store` */
  API.store.remove = function (remove_context) {
    remove_context.db.deleteObjectStore(remove_context.store);
    API.success(remove_context);
  };

  /* Returns a single store syncronously, or asyncronously through
   * an on_success callback, given a database and store. */
  API.store.get = function (get_ctx) {
    API.success(get_ctx);
  };

  /* Returns all stores syncronously, or asyncronously through
   * an on_success callback, given a database. */
  API.stores.get = function (get_ctx) {
    get_ctx.stores = get_ctx.db.objectStoreNames;
    API.success(get_ctx);
  };

  /*
   *  Indexes
   *  Namespaces
   *      API.index
   *      API.indexes
   *  Methods:
   *      API.index.exists
   *      API.index.get
   *      API.index.delete
   *      API.indexes.get
   *      API.indexes.create
   */

  /* Returns a single index syncronously, or asyncronously through
   * an on_complete callback, given a database, store and index. */
  API.index.get = function (get_ctx) {
    get_ctx.idx = get_ctx.objectstore.index(get_ctx.index);
    API.success(get_ctx);
  };

  /* This method deletes an index with a given `name` on a given
   * `database` and `store`. It creates an implicit database version upgrade.
   */
  API.index.remove = function (remove_ctx) {
    remove_ctx.objectstore.deleteIndex(remove_ctx.index);
    API.success(remove_ctx);
  };

  /* Returns all indexes syncronously, or asyncronously through
   * an on_success callback, given a database and store. */
  API.indexes.get = function (get_ctx) {
    get_ctx.indexes = get_ctx.objectstore.indexNames;
    API.success(get_ctx);
  };


  /*
   *  Entries
   *
   *  Namespaces:
   *      API.entry
   *      API.entries
   *
   *  Methods:
   *      API.entry.add
   *      API.entry[ 'delete' ]
   *      API.entry.get
   *      API.entry.put
   *      API.entryResult
   *
   */

  /* This method adds a `data` object to an object `store` `database`. */
  API.entry.add = function (add_ctx) {
    var request;
    add_ctx.data = API.isFunction(add_ctx.data) ? add_ctx.data() : API.clone(add_ctx.data);
    request = add_ctx.objectstore.add(add_ctx.data);
    add_ctx.transaction.addEventListener('error', function (event) {
      add_ctx.error = event.target.error.message;
      API.error(add_ctx);
    });
    request.addEventListener('success', function () {
      add_ctx.key = request.result;
      API.success(add_ctx);
    });
  };

  /* This method deletes a `database`'s object `store` row given a `key` */
  API.entry.remove = function (remove_ctx) {
    var request,
      has_range = API.exists(remove_ctx.range) || API.exists(remove_ctx.upper) || API.exists(remove_ctx.lower) || API.exists(remove_ctx.only);
    remove_ctx.data = API.isFunction(remove_ctx.data) ? remove_ctx.data() : API.clone(remove_ctx.data);
    request = remove_ctx.objectstore["delete"](has_range ? (remove_ctx.range || API.range.get(remove_ctx)) : remove_ctx.key);
    remove_ctx.transaction.addEventListener('complete', function () {
      remove_ctx.entry = request.result;
      API.success(remove_ctx);
    });
    remove_ctx.transaction.addEventListener('error', function (event) {
      remove_ctx.error = event.target.error.message;
      API.error(remove_ctx);
    });
  };

  /* This method gets a row from an object store named `store` in a database
   * named `database` using an optional `index` and `key`
   */
  API.entry.get = function (get_ctx) {
    var request;
    get_ctx.data = API.isFunction(get_ctx.data) ? get_ctx.data() : API.clone(get_ctx.data);
    if (API.exists(get_ctx.index)) {
      get_ctx.idx = get_ctx.objectstore.index(get_ctx.index);
      request = API.is(get_ctx.value, false) ? get_ctx.idx.getKey(get_ctx.key) : get_ctx.idx.get(get_ctx.key);
    } else {
      request = get_ctx.objectstore.get(get_ctx.key);
    }

    get_ctx.transaction.addEventListener('error', function (event) {
      get_ctx.error = event.target.error.message;
      API.error(get_ctx);
    });

    request.addEventListener('success', function () {
      get_ctx.entry = request.result;
      API.success(get_ctx);
    });
  };

  /* This method puts a `data` object to a `database` object `store` using a `key`.
   * This change is made without regard to its previous state. */
  API.entry.put = function (put_ctx) {
    var request;
    put_ctx.data = API.isFunction(put_ctx.data) ? put_ctx.data() : API.clone(put_ctx.data);
    request = API.exists(put_ctx.key) ? put_ctx.objectstore.put(put_ctx.data, put_ctx.key) : put_ctx.objectstore.put(put_ctx.data);
    put_ctx.transaction.addEventListener('complete', function () {
      put_ctx.key = request.result;
      API.success(put_ctx);
    });
    put_ctx.transaction.addEventListener('error', function (event) {
      put_ctx.error = event.target.error.message;
      API.error(put_ctx);
    });
  };

  /* This method deletes rows from a `database` `store` matching the
   * `index` cursor with the given `key_range`
   */
  API.entries.remove = function (remove_ctx) {
    remove_ctx.type = API.transaction.readWrite;
    var their_on_success = remove_ctx.on_success;
    API.standardCursor(remove_ctx, function (passed_remove_ctx) {
      passed_remove_ctx.entry = passed_remove_ctx.request;
      if (API.exists(passed_remove_ctx.cursor)) {
        passed_remove_ctx.on_success = their_on_success;
        passed_remove_ctx.entry = passed_remove_ctx.cursor.value;
        if (API.is(passed_remove_ctx.collect, true)) {
          passed_remove_ctx.entries = passed_remove_ctx.entries || [];
          passed_remove_ctx.entries.push(passed_remove_ctx.entry);
        }
        passed_remove_ctx.amount = passed_remove_ctx.amount || 0;
        passed_remove_ctx.amount += 1;
        passed_remove_ctx.cursor['delete']();
        API.success(passed_remove_ctx);
        if (API.exists(passed_remove_ctx.cursor['continue'])) {
          passed_remove_ctx.cursor['continue']();
        }
      }
    });
  };

  /* This method gets rows from a `database` object `store` using a cursor creating
   * with an `index`, `key_range` and optional `direction`. */
  API.entries.get = function (get_ctx) {
    get_ctx.type = API.transaction.read;
    var their_on_success = get_ctx.on_success;
    get_ctx.on_success = null;
    API.standardCursor(get_ctx, function (passed_get_ctx) {
      if (API.exists(passed_get_ctx.cursor)) {
        passed_get_ctx.on_success = their_on_success;
        passed_get_ctx.entry = passed_get_ctx.cursor.value;
        if (API.is(passed_get_ctx.collect, true)) {
          passed_get_ctx.entries = passed_get_ctx.entries || [];
          passed_get_ctx.entries.push(passed_get_ctx.entry);
        }
        passed_get_ctx.amount = passed_get_ctx.amount || 0;
        passed_get_ctx.amount += 1;
        API.success(passed_get_ctx);
        if (API.exists(passed_get_ctx.cursor['continue'])) {
          passed_get_ctx.cursor['continue']();
        }
      }
    });
  };
 
  /* This method returns the number of records associated with
     an index request */
  API.entries.count = function (count_ctx) {
    var request;
    count_ctx.data = API.isFunction(count_ctx.data) ? count_ctx.data() : API.clone(count_ctx.data);
    if (API.exists(count_ctx.index)) {
      count_ctx.idx = count_ctx.objectstore.index(count_ctx.index);
      request = API.isEmpty(count_ctx.key) ? count_ctx.idx.count() : count_ctx.idx.count(count_ctx.key);
    } else {
      request = API.isEmpty(count_ctx.key) ? count_ctx.objectstore.count() : count_ctx.objectstore.count(count_ctx.key);
    }

    count_ctx.transaction.addEventListener('error', function (event) {
      count_ctx.error = event.target.error.message;
      API.error(count_ctx);
    });

    request.addEventListener('success', function () {
      count_ctx.total = request.result;
      API.success(count_ctx);
    });

  };



  /* This method updates rows in a `database` `store` matching the
   * `index` cursor with the given `key_range`
   */
  API.entries.update = function (update_ctx) {
    update_ctx.type = API.transaction.readWrite;
    var their_on_success = update_ctx.on_success;
    API.standardCursor(update_ctx, function (passed_update_ctx) {
      if (API.exists(passed_update_ctx.cursor)) {
        passed_update_ctx.on_success = their_on_success;
        passed_update_ctx.entry = passed_update_ctx.cursor.value;
        if (API.is(passed_update_ctx.collect, true)) {
          passed_update_ctx.entries = passed_update_ctx.entries || [];
          passed_update_ctx.entries.push(passed_update_ctx.entry);
        }
        passed_update_ctx.amount = passed_update_ctx.amount || 0;
        passed_update_ctx.amount += 1;
        passed_update_ctx.cursor.update(passed_update_ctx.data);
        API.success(passed_update_ctx);
        if (API.exists(passed_update_ctx.cursor['continue'])) {
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
  API.range.get = function (get_ctx) {
    var result = null,
      left_bound = get_ctx.left_bound,
      right_bound = get_ctx.right_bound,
      includes_left_bound = get_ctx.includes_left_bound,
      includes_right_bound = get_ctx.includes_right_bound;
    if (API.exists(left_bound) && API.exists(right_bound) && API.exists(includes_left_bound) && API.exists(includes_right_bound)) {
      result = API.kr.bound(left_bound, right_bound, includes_left_bound, includes_right_bound);
    } else if (API.exists(left_bound) && API.exists(includes_left_bound)) {
      result = API.kr.lowerBound(left_bound, includes_left_bound);
    } else if (API.exists(right_bound) && API.exists(includes_right_bound)) {
      result = API.kr.upperBound(right_bound, includes_right_bound);
    } else if (API.exists(get_ctx.value)) {
      result = API.kr.only(get_ctx.value);
    }
    get_ctx.result = result;
    API.success(get_ctx);
    return result;
  };

  /**
   * Directions
   *
   **/

  /* Direction types */

  API.entries.next = function (cursor_ctx) {
    return API.exists(cursor_ctx) && API.is(false, cursor_ctx.duplicates) ? 'nextunique' : 'next';
  };

  API.entries.previous = function (cursor_ctx) {
    return API.exists(cursor_ctx) && API.is(false, cursor_ctx.duplicates) ? 'prevunique' : 'prev';
  };

  API.promise = function () {
    var complete = false,
      wasSuccess = null,
      completed = [],
      children = [],
      notifies = [],
      successes = [],
      errors = [];
    return {
      'promise': function (on_success, on_error, on_notify) {
        var deferred = API.promise();
        children.push(deferred);
        if (API.is(complete, true)) {
          API.safeApply(wasSuccess ? on_success : on_error, completed);
        } else {
          API.safeEach([
            [successes, on_success],
            [errors, on_error],
            [notifies, on_notify]
          ], function (pair) {
            var fn = pair[1];
            if (API.isFunction(fn)) {
              pair[0].push(fn);
            }
          });
        }
        return deferred.promise;
      },
      'resolve': function () {
        var args = arguments;
        if (API.is(complete, false)) {
          wasSuccess = true;
          complete = true;
          completed = args;
          API.safeEach(successes, function (on_success) {
            API.safeApply(on_success, args);
          });
          API.safeEach(children, function (child) {
            API.safeApply(child.resolve, args);
          });
        }
      },
      'notify': function () {
        var args = arguments;
        API.safeEach(notifies, function (on_notify) {
          API.safeApply(on_notify, args);
        });
        API.safeEach(children, function (child) {
          API.safeApply(child.notify, args);
        });
      },
      'reject': function () {
        var args = arguments;
        if (API.is(complete, false)) {
          wasSuccess = false;
          complete = true;
          completed = args;
          API.safeEach(errors, function (on_error) {
            API.safeApply(on_error, args);
          });
        }
      }
    };
  };

  API.transaction.queues = [];

  API.transaction.type = function (method) {
    if (API.contains(['add.index', 'remove.index', 'add.store', 'remove.store'], method)) {
      return API.transaction.versionChange;
    }
    if (API.contains(['get.entry', 'get.entries'], method)) {
      return API.transaction.read;
    }
    return API.transaction.readWrite;
  };

  //TODO: Why isn't this yet refactored out
  API.detachContext = function (context) {
    return {
      database: context.database,
      store: context.store,
      version: null,
      store_key_path: context.store_key_path,
      unique: context.unique,
      multi_entry: context.multi_entry,
      data: context.data,
      auto_increment: context.auto_increment,
      on_complete: context.on_complete,
      on_error: context.on_error,
      on_success: context.on_success,
      on_abort: context.on_abort,
      key: context.key,
      index: context.index,
      index_key_path: context.index_key_path,
      index_multi_entry: context.index_multi_entry,
      index_unique: context.index_unique,
      limit: context.limit,
      skip: context.skip,
      collect: context.collect
    };
  };

  API.stage = function (method, args, methodname) {
    var determined_type = API.transaction.type(methodname),
      checkQueue = function () {
        var process_context = API.transaction.queues.shift(),
            their_on_upgrade_needed = process_context ? process_context.on_upgrade_needed : undefined,
            their_on_success = process_context ? process_context.on_success : undefined;
        if (API.exists(process_context)) {
          if (API.contains(['get.database', 'remove.database'], methodname)) {
            return finishWrapAndRespond(process_context);
          }
          process_context.on_success = null;
          process_context.on_upgrade_needed = null;
          maybeAddDatabase(process_context, function (process_context_2) {
            maybeAddObjectStore(process_context_2, function (process_context_3) {
              maybeAddIndex(process_context_3, function (process_context_4) {
                process_context_4.on_success = their_on_success;
                process_context_4.on_upgrade_needed = their_on_upgrade_needed;
                finishWrapAndRespond(process_context_4);
              });
            });
          });
        }
      },
      maybeAddDatabase = function (context, callback) {
        var owncontext = API.detachContext(context);
        if (API.isEmpty(context.database)) {
          return API.safeApply(callback, [context]);
        }
        owncontext.on_success = function (db_ctx) {
          db_ctx.on_success = null;
          db_ctx.version = db_ctx.db.version;
          db_ctx.db.close();
          API.safeApply(callback, [db_ctx]);
        };
        owncontext.on_upgrade_needed = function (db_ctx) {
          db_ctx.upgraded = true;
          db_ctx.version = db_ctx.new_version;
          db_ctx.on_upgrade_needed = null;
          db_ctx.transaction.oncomplete = function () {
            db_ctx.db.close();
            API.safeApply(callback, [db_ctx]);
          };
        };
        API.database.get(owncontext);
      }, maybeAddObjectStore = function (context, callback) {
        var owncontext = API.detachContext(context);
        if (API.isEmpty(context.store) || API.contains(['add.store'], methodname)) {
          return API.safeApply(callback, [context]);
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
                API.safeApply(callback, [upg_os_ctx]);
              });
              upg_os_ctx.objectstore = upg_os_ctx.db.createObjectStore(upg_os_ctx.store, {
                keyPath: API.isString(upg_os_ctx.store_key_path) ? upg_os_ctx.store_key_path : null,
                autoIncrement: API.isBoolean(upg_os_ctx.auto_increment) ? upg_os_ctx.auto_increment : false
              });
            };
            API.database.get(os_ctx);
          } else {
            if (API.isnt(os_ctx.transaction, null)) {
              os_ctx.objectstore = os_ctx.transaction.objectStore([os_ctx.store], determined_type);
            }
            os_ctx.db.close();
            API.safeApply(callback, [os_ctx]);
          }
        };
        owncontext.version = null;
        API.database.get(owncontext);

      }, maybeAddIndex = function (context, callback) {
        var owncontext = API.detachContext(context);
        if (API.isEmpty(context.store) || API.isEmpty(context.index) || API.contains(['add.store', 'get.store', 'remove.store', 'get.stores', 'remove.stores', 'remove.index', 'add.index'], methodname)) {
          return API.safeApply(callback, [context]);
        }
        owncontext.on_success = function (idx_ctx) {
          idx_ctx.on_success = null;
          idx_ctx.db = idx_ctx.request.result;
          idx_ctx.objectstore = idx_ctx.db.transaction([idx_ctx.store], API.transaction.read).objectStore(idx_ctx.store);
          idx_ctx.transaction = idx_ctx.objectstore.transaction;
          if (!idx_ctx.objectstore.indexNames.contains(context.index)) {
            idx_ctx.version = idx_ctx.db.version + 1;
            idx_ctx.on_success = null;
            idx_ctx.on_upgrade_needed = function (upg_idx_ctx) {
              upg_idx_ctx.objectstore = upg_idx_ctx.transaction.objectStore([upg_idx_ctx.store]);
              upg_idx_ctx.on_upgrade_needed = null;
              upg_idx_ctx.transaction.addEventListener('complete', function () {
                upg_idx_ctx.on_success = null;
                API.safeApply(callback, [upg_idx_ctx]);
                upg_idx_ctx.db.close();
              });
              upg_idx_ctx.on_success = null;
              upg_idx_ctx.idx = upg_idx_ctx.objectstore.createIndex(upg_idx_ctx.index, upg_idx_ctx.index_key_path, {
                'unique': upg_idx_ctx.index_unique || false,
                'multiEntry': upg_idx_ctx.index_multi_entry || false
              });
            };
            idx_ctx.db.close();
            API.database.get(idx_ctx);
          } else {
            idx_ctx.db.close();
            API.safeApply(callback, [idx_ctx]);
          }
        };
        API.database.get(owncontext);
      },
      finishWrapAndRespond = function (context) {
        var their_on_success = context.on_success,
          their_on_complete = context.on_complete,
          their_on_error = context.on_error,
          owncontext = API.detachContext(context),
          cb = function (cb_ctx) {
            if (API.exists(cb_ctx.store) && API.isnt(determined_type, API.transaction.versionChange)) {
              if (API.is(cb_ctx.transaction, null)) {
                cb_ctx.transaction = cb_ctx.db.transaction([cb_ctx.store], determined_type);
              }
              cb_ctx.objectstore = cb_ctx.transaction.objectStore(cb_ctx.store);
              cb_ctx.transaction.addEventListener('complete', function () {
                cb_ctx.db.close();
                checkQueue();
              });
            } else if (API.exists(cb_ctx.store)) {
              cb_ctx.db = cb_ctx.request.result;
              cb_ctx.transaction = cb_ctx.request.transaction;
              if (API.is(cb_ctx.transaction, null)) {
                cb_ctx.transaction = cb_ctx.db.transaction([cb_ctx.store], determined_type);
              }
              if (!API.contains(['add.store', 'remove.store'], methodname)) {
                cb_ctx.objectstore = cb_ctx.transaction.objectStore(cb_ctx.store);
              }
              cb_ctx.transaction.addEventListener('complete', function () {
                cb_ctx.db.close();
                checkQueue();
              });
            }
            cb_ctx.on_success = function (succ_ctx) {
              succ_ctx = API.results(succ_ctx);
              succ_ctx.on_success = their_on_success;
              API.success(succ_ctx);
            };
            cb_ctx.on_complete = function (comp_ctx) {
              comp_ctx = API.results(comp_ctx);
              comp_ctx.on_complete = their_on_complete;
              API.safeApply(comp_ctx.on_complete, [comp_ctx]);
            };
            cb_ctx.on_error = function (err_ctx) {
              err_ctx = API.results(err_ctx);
              err_ctx.on_error = their_on_error;
              API.error(err_ctx);
            };
            API.safeApply(method, [cb_ctx]);
          };
        owncontext.version = context.version;
        if (API.contains(['get.databases', 'remove.database', 'get.database'], methodname)) {
          return API.safeApply(method, [ API.results( context ) ]);
        }
        if (API.isnt(API.transaction.versionChange, determined_type)) {
          owncontext.on_success = cb;
          owncontext.on_upgrade_needed = null;
        } else {
          owncontext.version = context.db.version + 1;
          owncontext.on_upgrade_needed = cb;
          owncontext.on_success = null;
        }
        owncontext.on_complete = null;
        API.database.get(owncontext);
      },
      model = API.args(args);
    model.type = determined_type;
    API.transaction.queues.push(model);
    checkQueue();
  };
  API.behavior.filters = [];
  API.behavior.actions = [];
  API.behavior.context = {
	clone: API.clone,
	contains: API.contains,
	promise: API.promise,
	exists: API.exists,
	extend: API.extend,
	is: API.is,
	isnt: API.isnt,
	isArray: API.isArray,
	isBoolan: API.isBoolean,
	isFunction: API.isFunction,
	isNumber: API.isNumber,
	isString: API.isString,
	apply: API.safeApply,
	each: API.safeEach,
	iterate: API.safeIterate
  };
  API.behavior.add = function(influence) {
	if ( API.isArray(influence) ) {
		API.behavior.pre(influence[0]);
		API.behavior.post(influence[1]);
	} else {
		API.behavior.pre(influence);
		API.behavior.post(influence);
	}
  };
  API.behavior.pre = function(pre) {
    if (API.isFunction(pre)) {
      API.behavior.filters.push(pre);
    }
  };
  API.behavior.post = function(post) {
    if (API.isFunction(post)) {
      API.behavior.actions.push(post);
    }
  };
  API.wrap = function (fn, method) {
    return function (context) {
      context = context || {};
      var callbackMap = {};
      API.safeEach(API.standardCallbackNames, function (key) {
        callbackMap[key.replace(/^on_/, '')] = context[key];
      });
      /* This method adds an on_something to proxy the requests before they
       * make it to the original objects, which are stored in callbackMap */
      return (function (args, map, callback, signature) {
        var deferred = API.promise(),
          count = 0,
          complex = API.contains(['get.entries', 'update.entries', 'remove.entries'], method),
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
	  response;
        /* We've dirtied up the "context" object with our own callbacks. 
         * Before returning the context (arguments) to the user, this
         * method removes the stuff we've added so they don't
         * get inherited into chained contexts. */
        API.safeIterate(map, function (map_key) {
          /* These methods proxy requests for promise-keeping */
          args['on_' + map_key] = (function (type, maphash) {
            return function (obj) {
              if (API.isObject(obj)) {
                /* Only define if previously defined, otherwise wipe. */
                API.safeIterate(maphash, function (key, value) {
                  var k = 'on_' + key;
                  if (API.isFunction(value)) {
                    obj[k] = value;
                  } else {
                    delete obj[k];
                  }
                });
              }
              obj = API.args(obj);
              var slug,
		  args,
		  response,
		  count = 0;
              /* This is the little bit of logic that maps 
               * IDB events (abort, success, etc.) to our own 
               * promise success/error/notify model */
              if (API.is(type, 's') && API.is(complex, true)) {
                slug = 'notify';
              } else if (API.is(type, 'e') || API.is(type, 'a') || API.is(type, 'b')) {
                slug = 'reject';
              } else {
                slug = 'resolve';
              }
	      args = API.results( obj );
              API.safeEach( API.behavior.actions, function(act) {
		response = API.safeApply(act, [ { type: slug, context: args, priority: ++count } ], API.extend({}, API.behavior.context));
                args = response.context;
		/* Notifies can't be turned into anything but rejects and
		 * resolves can be... resolved and rejected, respectively */
		if ( API.contains( [ 'reject', 'resolve' ], slug ) ) {
                  slug = response.type;
                }
              }); 
              API.safeApply(deferred[slug], [ API.results(obj) ], deferred);
            };
          }(codeMap[map_key], map));
        });
        /* Runs setup for the method */
	if ( null !== signature.match(/\.behavior/) ) {
		API.safeApply(callback, [args]);
	} else {
		try {
		  API.safeEach( API.behavior.filters, function(filter) {
		    response = API.safeApply(filter, [ { type: signature, context: args, priority: ++count, promise: deferred } ], API.extend({}, API.behavior.context));
		    args = response.context;
		    signature = response.type;
		    deferred = response.deferred;
		  }); 
		  API.stage(callback, args, signature);
		} catch (err) {
		  args.error = err;
		}
	}
	return deferred.promise;
      }(context, callbackMap, fn, method));
    };
  };
  /* We programmatically construct the public-facing API for a couple of
   * reasons: less code and protects namespace in advance minification,
   */
  Public = (function (internal) {
    var Public = {},
      names = [],
      name;
    API.safeIterate(internal, function (sig, fnref) {
      names = sig.split('.');
      name = names[0];
      Public[name] = Public[name] || {};
      Public[name][names[1]] = API.wrap(fnref, sig);
    });
    return Public;
  }({
    'add.entry': API.entry.add,
    'add.behavior': API.behavior.add,
    'count.entries': API.entries.count,
    'get.database': API.database.get,
    'get.databases': API.databases.get,
    'get.store': API.store.get,
    'get.stores': API.stores.get,
    'get.index': API.index.get,
    'get.indexes': API.indexes.get,
    'get.entry': API.entry.get,
    'get.entries': API.entries.get,
    'get.behaviors': API.behavior.get,
    'update.entries': API.entries.update,
    'put.entry': API.entry.put,
    'clear.store': API.store.clear,
    'remove.database': API.database.remove,
    'remove.store': API.store.remove,
    'remove.index': API.index.remove,
    'remove.entry': API.entry.remove,
    'remove.entries': API.entries.remove
  }));


	if (null !== environment.constructor.toString().match(/WorkerGlobalScope/)) {
	  environment.addEventListener('message', function(e) {
		  var input = e.data,
		      method = input.dash.split('.'),
		      verb = method[ 0 ],
		      noun = method[ 1 ],
                      end = function(ctx) {
			input.context = ctx;
			environment.postMessage(input);
		      };
		  if ( undefined !== dash[ verb ] && undefined !== dash[ verb ][ noun ] ) {
			  Public[ verb ][ noun ]( input.context )(
				function(context) {
					input.type = 'success';
					end(context);	
				}, function(context) {
					input.type = 'error';
					end(context);	
				}, function(context) {
					input.type = 'notify';
					end(context);	
				}
			  );
		} else {
			input.type = 'error';
			end( { error: 'No such method' } );
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

}( self || window || {} ));


