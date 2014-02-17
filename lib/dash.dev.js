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

    API.isTransaction = function (tx) {
        return (tx instanceof IDBTransaction) ? true : false;
    };

    API.isDatabase = function (db) {
        return (db instanceof IDBDatabase) ? true : false;
    };

    API.isCursorWithValue = function (c) {
        return (c instanceof IDBCursorWithValue) ? true : false;
    };

    API.isOpenRequest = function (o) {
        return (o instanceof IDBOpenDBRequest) ? true : false;
    };

    API.results = function (results_ctx) {
        var obj = {};
        API.safeEach([
            'key',
            'entry',
            'idx',
            'objectstore',
            'duplicats',
            'db',
            'store',
            'data',
            'entries',
            'database',
            'index',
            'databases',
            'indexes',
            'stores',
            'auto_increment',
            'multi_entry',
            'index_key_path',
            'index_unique',
            'index_multi_entry'
        ], function (i, k) {
            if (API.exists(results_ctx[k])) {
                if (API.is(k, 'db')) {
                    obj[k] = {
                        name: results_ctx[k].name,
                        version: results_ctx[k].version,
                        objectStoreNames: results_ctx[k].objectStoreNames
                    };
                } else if (API.is(k, 'objectstore')) {
                    obj[k] = {
                        name: results_ctx[k].name,
                        indexNames: results_ctx[k].indexNames,
                        autoIncrement: results_ctx[k].autoIncrement,
                        keyPath: results_ctx[k].keyPath
                    };
                } else if (API.is(k, 'objectstore') || API.is(k, 'idx')) {
                    obj[k] = {
                        name: results_ctx[k].name,
                        multiEntry: results_ctx[k].multiEntry,
                        unique: results_ctx[k].unique,
                        keyPath: results_ctx[k].keyPath
                    };
                } else {
                    obj[k] = results_ctx[k];
                }
            }
        });
        return obj;
    };

    API.args = function (args_ctx) {
        var obj = {};
        API.safeEach([
            'data',
            'on_success',
            'on_blocked',
            'on_upgrade_needed',
            'on_abort',
            'on_error',
            'duplicates',
            'key',
            'store_key_path',
            'store',
            'index',
            'index_key_path',
            'database',
            'db',
            'type',
            'entries',
            'objectstore',
            'idx',
            'store_creating',
            'db_creating',
            'idx_creating',
            'blocked_count',
            'callback',
            'event',
            'version',
            'on_complete',
            'auto_increment',
            'unique',
            'multi_entry',
            'index_key_path',
            'index_unique',
            'index_multi_entry'

        ], function (i, k) {
            if (API.exists(args_ctx[k])) {
                obj[k] = args_ctx[k];
            }
        });
        return obj;
    };

    API.transactionIsAtLeast = function (test, at_least) {
        if (API.is(test, API.transaction.versionChange)) {
            return true;
        }
        if (API.is(test, API.transaction.readWrite)) {
            if (API.is(at_least, API.transaction.versionChange)) {
                return false;
            }
            return true;
        }
        if (API.is(at_least, API.transaction.read)) {
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

    API.standardCallbackNames = ['on_success', 'on_error', 'on_abort', 'on_blocked', 'on_upgrade_needed', 'on_close', 'on_complete'];

    /* Metaprogramming API.callback shortcuts */
    API.safeEach(API.standardCallbackNames, function (i, cb) {
        API[cb.replace(/^on_/g, '')] = function (context) {
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
        API.safeEach(API.standardCallbackNames, function (i, cb) {
            obj[cb.replace(/_/g, '')] = context[cb];
        });
        context.request = API.extend(request, obj);
        return context;
    };

    API.standardCursor = function (cursor_ctx, getRequest) {
        var decorate = function (event) {
            cursor_ctx.event = event;
            return cursor_ctx;
        },
            request;
        cursor_ctx.direction = cursor_ctx.direction || API.objects.next();
        cursor_ctx.range = cursor_ctx.range || API.range.get(cursor_ctx);
        cursor_ctx.entries = [];
        cursor_ctx.data = API.isFunction(cursor_ctx.data) ? cursor_ctx.data() : API.clone(cursor_ctx.data);
        try {
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
            request.transaction.addEventListener('complete', function (e) {
                cursor_ctx.cursor = request.result;
                cursor_ctx = decorate(e);
                API.complete(cursor_ctx);
            });
            request.transaction.addEventListener('error', function (e) {
                cursor_ctx.error = e;
                cursor_ctx = decorate(e);
                API.error(cursor_ctx);
            });
            request.addEventListener('success', function (e) {
                cursor_ctx.cursor = request.result;
                cursor_ctx.entries = cursor_ctx.entries || [];
                cursor_ctx = decorate(e);
                API.safeApply(getRequest, [cursor_ctx]);
                if (API.isnt(null, cursor_ctx.cursor) && API.exists(cursor_ctx.cursor['continue'])) {
                    cursor_ctx.entries.push(cursor_ctx.cursor.value);
                    cursor_ctx.cursor['continue']();
                }
            });
        } catch (err) {
            cursor_ctx.error = err;
            API.error(cursor_ctx);
        }

    };

    /* This helper method plucks a value from a request row
     * This allows us to normalize request responses */
    /* Although namespaced, this method is not public-facing */
    API.objectResult = function (result_ctx) {
        var event = result_ctx.event,
            result = null;
        //cursors
        if (API.isOpenRequest(result_ctx.request)) {
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
     *      API.database.open
     *      API.database.upgrade
     *      API.database.upgradeRequest
     */

    /* Close a single db named `database`, aborting any transactions. */

    API.database.close = function (close_ctx) {
        close_ctx.db.close();
        API.success(close_ctx);
    };

    /* This method deletes a `database`. */
    API.database['delete'] = function (remove_context) {
        remove_context.type = API.transaction.readWrite;
        try {
            remove_context.request = indexedDB.deleteDatabase(remove_context.database);
            API.standardRequest(remove_context);
        } catch (e) {
            remove_context.error = e;
            API.error(remove_context);
        }
    };

    /* This is a safe method for opening a given `database` at a given
     * `version`, and optionally a given `store` along with it.
     * This will handle any upgrade events by either opening a database with higher
     * version or triggering a versionchange event.
     */
    API.database.upgrade = function (upgrade_ctx) {
        var their_upgrade = upgrade_ctx.on_upgrade_needed,
            their_success = upgrade_ctx.on_success;
        if (API.isEmpty(upgrade_ctx.db) && API.isEmpty(upgrade_ctx.version)) {
            API.error(upgrade_ctx);
        } else {
            if (API.isTransaction(upgrade_ctx.transaction) && API.is(upgrade_ctx.transaction.mode, API.transaction.versionChange)) {
                API.success(upgrade_ctx);
            } else {
                upgrade_ctx.version = upgrade_ctx.version || (upgrade_ctx.db.version + 1);
                upgrade_ctx.on_upgrade_needed = function (passed_upgrade_ctx) {
                    passed_upgrade_ctx.on_upgrade_needed = their_upgrade;
                    passed_upgrade_ctx.on_success = their_success;
                    API.success(passed_upgrade_ctx);
                };
                API.database.open(upgrade_ctx);
            }
        }
    };

    /* This method loads a database given a database name and version.
     * The database can be retrived on successful callback via the `db`
     * attribute on the context object */
    // TODO: Localize open_ctx.request and provide any results from within this method
    API.database.open = function (open_ctx) {
        var their_upgrade = open_ctx.on_upgrade_needed,
            their_success = open_ctx.on_success,
            their_on_blocked = open_ctx.on_blocked,
            was_upgrade = false;
        open_ctx.request = API.isNumber(open_ctx.version) ? indexedDB.open(open_ctx.database, open_ctx.version) : indexedDB.open(open_ctx.database);
        if (open_ctx.db) {
            open_ctx.db.close(); //API.database.close(open_ctx);
        }
        API.standardRequest(API.extend(open_ctx, {
            on_success: function (passed_open_ctx) {
                if (was_upgrade) {
                    return;
                }
                passed_open_ctx.upgrade = false;
                passed_open_ctx.opened = true;
                passed_open_ctx.on_success = their_success;
                passed_open_ctx.db = passed_open_ctx.event.target.result;
                API.success(passed_open_ctx);
            },
            on_upgrade_needed: function (passed_open_ctx) {
                was_upgrade = true;
                passed_open_ctx.upgrade = true;
                passed_open_ctx.opened = true;
                passed_open_ctx.on_upgrade_needed = their_upgrade;
                API.upgrade_needed(passed_open_ctx);
            },
            on_blocked: function (passed_open_ctx) {
                API.safeApply(their_on_blocked, [passed_open_ctx]);
            }
        }));
    };


    /* Returns all stores syncronously, or asyncronously through
     * an on_success callback, given a database. */
    API.databases.get = function (get_ctx) {
        var theirs = get_ctx.on_success;
        if (!API.isFunction(indexedDB.webkitGetDatabaseNames)) {
            return API.error(get_ctx);
        }
        get_ctx.request = indexedDB.webkitGetDatabaseNames();
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
     *      API.store.create
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
    API.store['delete'] = function (remove_context) {
        remove_context.db.deleteObjectStore(remove_context.store);
        API.success(remove_context);
    };

    /* This method creates a store named `name` on the given `database`
     * return true if request is successfully requested (no bearing on result)
     * autoincrement defaults to false if a key is specified;
     * key gets set to "key" and autoincrements when key is not specified */
    API.store.create = function (create_ctx) {
        create_ctx.objectstore = create_ctx.db.createObjectStore(create_ctx.store, {
            keyPath: API.isString(create_ctx.store_key_path) ? create_ctx.store_key_path : null,
            autoIncrement: API.isBoolean(create_ctx.auto_increment) ? create_ctx.auto_increment : false
        });
        API.success(create_ctx);
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
    API.index.create = function (create_ctx) {
        create_ctx.idx = create_ctx.objectstore.createIndex(create_ctx.index, create_ctx.index_key_path, {
            'unique': create_ctx.index_unique || false,
            'multiEntry': create_ctx.index_multi_entry || false
        });
        API.success(create_ctx);
    };

    /* Returns a single index syncronously, or asyncronously through
     * an on_complete callback, given a database, store and index. */
    API.index.get = function (get_ctx) {
        get_ctx.idx = get_ctx.objectstore.index(get_ctx.index);
        API.success(get_ctx);
    };

    /* This method deletes an index with a given `name` on a given
     * `database` and `store`. It creates an implicit database version upgrade.
     */
    API.index['delete'] = function (remove_ctx) {
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
     *      API.object.add
     *      API.object[ 'delete' ]
     *      API.object.get
     *      API.object.put
     *      API.objectResult
     *
     */

    /* This method adds a `data` object to an object `store` `database`. */
    API.object.add = function (add_ctx) {
        var request;
        add_ctx.data = API.isFunction(add_ctx.data) ? add_ctx.data() : API.clone(add_ctx.data);
        console.log('adding object', add_ctx.data);
        request = add_ctx.objectstore.add(add_ctx.data);
        /* Chrome */
        add_ctx.transaction.addEventListener('complete', function () {
            add_ctx.key = request.result;
            console.log('tx complete', add_ctx.key);
            API.success(add_ctx);
        });
        add_ctx.transaction.addEventListener('error', function (event) {
            add_ctx.error = event.target.error.message;
            API.error(add_ctx);
        });
        /* Firefox */
        request.addEventListener('success', function (event) {
            add_ctx.key = request.result;
            console.log('request success', add_ctx.key);
            API.success(add_ctx);
        });
    };

    /* This method deletes a `database`'s object `store` row given a `key` */
    API.object['delete'] = function (remove_ctx) {
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
    API.object.get = function (get_ctx) {
        var request;
        get_ctx.data = API.isFunction(get_ctx.data) ? get_ctx.data() : API.clone(get_ctx.data);
        if (API.exists(get_ctx.index)) {
            get_ctx.idx = get_ctx.objectstore.index(get_ctx.index);
            request = API.is(get_ctx.value, false) ? get_ctx.idx.getKey(get_ctx.key) : get_ctx.idx.get(get_ctx.key);
        } else {
            request = get_ctx.objectstore.get(get_ctx.key);
        }

        get_ctx.transaction.addEventListener('complete', function () {
            get_ctx.entry = request.result;
            API.success(get_ctx);
        });

        get_ctx.transaction.addEventListener('error', function (event) {
            get_ctx.error = event.target.error.message;
            API.error(get_ctx);
        });

        /* Firefox */
        request.addEventListener('success', function (event) {
            get_ctx.key = request.result;
            console.log('API.object.get request success', get_ctx.key);
            API.success(get_ctx);
        });
    };

    /* This method puts a `data` object to a `database` object `store` using a `key`.
     * This change is made without regard to its previous state. */
    API.object.put = function (put_ctx) {
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
    API.objects['delete'] = function (remove_ctx) {
        remove_ctx.type = API.transaction.readWrite;
        API.standardCursor(remove_ctx, function (passed_remove_ctx) {
            passed_remove_ctx.entry = passed_remove_ctx.request;
            if (API.isnt(passed_remove_ctx.cursor, null)) {
                passed_remove_ctx.cursor['delete']();
            }
        });
    };

    /* This method gets rows from a `database` object `store` using a cursor creating
     * with an `index`, `key_range` and optional `direction`. */
    API.objects.get = function (get_ctx) {
        get_ctx.type = API.transaction.read;
        API.standardCursor(get_ctx, function (passed_get_ctx) {
            passed_get_ctx.entry = null !== passed_get_ctx.cursor ? passed_get_ctx.cursor.value : null;
        });
    };

    /* This method updates rows in a `database` `store` matching the
     * `index` cursor with the given `key_range`
     */
    API.objects.update = function (update_ctx) {
        update_ctx.type = API.transaction.readWrite;
        API.standardCursor(update_ctx, function (passed_update_ctx) {
            if (API.isnt(passed_update_ctx.cursor, null)) {
                passed_update_ctx.entry = passed_update_ctx.cursor.value;
                passed_update_ctx.cursor.update(passed_update_ctx.data);
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

    API.objects.next = function (cursor_ctx) {
        return API.exists(cursor_ctx) && API.is(false, cursor_ctx.duplicates) ? 'nextunique' : 'next';
    };

    API.objects.previous = function (cursor_ctx) {
        return API.exists(cursor_ctx) && API.is(false, cursor_ctx.duplicates) ? 'prevunique' : 'prev';
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
                }
            },
            'resolve': function () {
                var args = arguments;
                if (API.is(complete, false)) {
                    wasSuccess = true;
                    //complete = true;
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

    API.transaction.queues = [];

    API.transaction.type = function (method) {
        if (API.contains(['add.index', 'remove.index', 'add.store', 'remove.store'], method)) {
            return API.transaction.versionChange;
        } else if (API.contains(['get.entry', 'get.entries'], method)) {
            return API.transaction.read;
        }
        return API.transaction.readWrite;
    };

    API.stage = function (method, args, methodname) {
        var determined_type = API.transaction.type(methodname),
            pickNext = function () {
                return API.transaction.queues.shift();
            },
            checkQueue = function () {
                var winner = pickNext();
                if (API.isnt(winner, null)) {
                    process(winner);
                }
            },
            maybeAddDatabase = function (context, callback) {
                var their_on_upgrade_needed = context.on_upgrade_needed,
                    their_on_success = context.on_success,
                    owncontext = {
                        database: context.database,
                        store: context.store,
                        version: null,
                        store_key_path: context.store_key_path,
                        unique: context.unique,
                        multi_entry: context.multi_entry,
                        data: context.data,
                        auto_increment: context.auto_increment,
                        on_complete: context.on_complete,
                        key: context.key,
                        index: context.index,
                        index_key_path: context.index_key_path,
                        index_multi_entry: context.index_multi_entry,
                        index_unique: context.index_unique
                    };
                if (API.isEmpty(context.database)) {
                    return API.safeApply(callback, [context]);
                }
                owncontext.on_success = function (ctx) {
                    ctx.on_success = their_on_success;
                    ctx.on_upgrade_needed = their_on_upgrade_needed;
                    ctx.version = ctx.db.version;
                    ctx.db.close(); //API.database.close(ctx);
                    API.safeApply(callback, [ctx]);
                };
                owncontext.on_upgrade_needed = function (ctx) {
                    ctx.upgraded = true;
                    ctx.version = ctx.new_version;
                    ctx.on_success = their_on_success;
                    ctx.on_upgrade_needed = their_on_upgrade_needed;
                    ctx.transaction.oncomplete = function () {
                        ctx.db.close(); //API.database.close(ctx);
                        API.safeApply(callback, [ctx]);
                    };
                };
                API.database.open(owncontext);
            }, maybeAddObjectStore = function (context, callback) {
                var their_on_upgrade_needed = context.on_upgrade_needed,
                    their_on_success = context.on_success,
                    owncontext = {
                        database: context.database,
                        store: context.store,
                        version: null,
                        store_key_path: context.store_key_path,
                        unique: context.unique,
                        multi_entry: context.multi_entry,
                        data: context.data,
                        on_complete: context.on_complete,
                        auto_increment: context.auto_increment,
                        key: context.key,
                        index: context.index,
                        index_key_path: context.index_key_path,
                        index_multi_entry: context.index_multi_entry,
                        index_unique: context.index_unique
                    };
                if (API.isEmpty(context.store) || API.contains(['add.store', 'remove.store', 'get.store', 'get.stores'], methodname)) {
                    return API.safeApply(callback, [context]);
                }
                owncontext.on_success = function (ctx) {
                    ctx.on_success = their_on_success;
                    ctx.db = ctx.request.result;
                    if (!ctx.db.objectStoreNames.contains(context.store)) {
                        ctx.version = ctx.db.version + 1;
                        var addObjectStore = function (ctx3) {
                            ctx3.transaction.addEventListener('complete', function () {
                                ctx3.on_success = their_on_success;
                                ctx3.on_upgrade_needed = their_on_upgrade_needed;
                                ctx3.db.close(); //API.database.close(ctx3);
                                API.safeApply(callback, [ctx3]);
                            });
                            ctx3.on_success = null;
                            API.store.create(ctx3);
                        };
                        ctx.on_success = null;
                        ctx.on_upgrade_needed = function (ctx2) {
                            ctx2.on_success = their_on_success;
                            ctx2.on_upgrade_needed = their_on_upgrade_needed;
                            addObjectStore(ctx2);
                        };
                        API.database.open(ctx);
                    } else {
                        if (API.isnt(ctx.transaction, null)) {
                            ctx.objectstore = ctx.transaction.objectStore([context.store], determined_type);
                        }
                        ctx.db.close(); //API.database.close(ctx);
                        API.safeApply(callback, [ctx]);
                    }
                };
                owncontext.version = null;
                API.database.open(owncontext);

            }, maybeAddIndex = function (context, callback) {
                var their_on_upgrade_needed = context.on_upgrade_needed,
                    their_on_success = context.on_success,
                    owncontext = {
                        database: context.database,
                        store: context.store,
                        version: null,
                        store_key_path: context.store_key_path,
                        unique: context.unique,
                        multi_entry: context.multi_entry,
                        data: context.data,
                        auto_increment: context.auto_increment,
                        on_complete: context.on_complete,
                        key: context.key,
                        index: context.index,
                        index_key_path: context.index_key_path,
                        index_multi_entry: context.index_multi_entry,
                        index_unique: context.index_unique
                    };
                if (API.isEmpty(context.store) || API.isEmpty(context.index) || API.contains(['add.store', 'get.store', 'remove.store', 'get.stores', 'remove.stores', 'remove.index', 'add.index'], methodname)) {
                    return API.safeApply(callback, [context]);
                }
                owncontext.on_success = function (ctx) {
                    ctx.on_success = their_on_success;
                    ctx.db = ctx.request.result;
                    ctx.objectstore = ctx.db.transaction([ctx.store], API.transaction.read).objectStore(ctx.store);
                    ctx.transaction = ctx.objectstore.transaction;
                    if (!ctx.objectstore.indexNames.contains(context.index)) {
                        ctx.version = ctx.db.version + 1;
                        var addIndex = function (ctx3) {
                            ctx3.transaction.addEventListener('complete', function () {
                                ctx3.on_success = their_on_success;
                                ctx3.db.close(); //API.database.close(ctx3);
                                API.safeApply(callback, [ctx3]);
                            });
                            ctx3.on_success = null;
                            API.index.create(ctx3);
                        };
                        ctx.on_success = null;
                        ctx.on_upgrade_needed = function (ctx2) {
                            ctx2.on_success = their_on_success;
                            ctx2.objectstore = ctx2.transaction.objectStore([ctx2.store]);
                            ctx2.on_upgrade_needed = their_on_upgrade_needed;
                            addIndex(ctx2);
                        };
                        ctx.db.close(); //API.database.close(ctx);
                        API.database.open(ctx);
                    } else {
                        ctx.db.close(); //API.database.close(ctx);
                        API.safeApply(callback, [ctx]);
                    }
                };
                API.database.open(owncontext);
            },
            process = function (context) {
                if (API.contains(['open.database', 'close.database', 'remove.database'], methodname)) {
                    return API.safeApply(method, [context]);
                }
                var their_on_upgrade_needed = context.on_upgrade_needed,
                    their_on_success = context.on_success;
                context.on_success = null;
                context.on_upgrade_needed = null;
                maybeAddDatabase(context, function (ctx) {
                    maybeAddObjectStore(ctx, function (context) {
                        maybeAddIndex(context, function (ctx) {
                            ctx.on_success = their_on_success;
                            ctx.on_upgrade_needed = their_on_upgrade_needed;
                            finishWrapAndRespond(ctx);
                        });
                    });
                });
            },
            finishWrapAndRespond = function (context) {
            var their_on_success = context.on_success,
                their_on_complete = context.on_complete,
                owncontext = {
                    database: context.database,
                    store: context.store,
                    version: context.version,
                    store_key_path: context.store_key_path,
                    unique: context.unique,
                    multi_entry: context.multi_entry,
                    data: context.data,
                    auto_increment: context.auto_increment,
                    index: context.index,
                    key: context.key,
                    index_key_path: context.index_key_path,
                    index_multi_entry: context.index_multi_entry,
                    index_unique: context.index_unique
                },
                cb = function (cb_ctx) {
                    if (API.exists(cb_ctx.store) && API.isnt(determined_type, API.transaction.versionChange)) {
                        if (API.is(cb_ctx.transaction, null)) {
                            cb_ctx.transaction = cb_ctx.db.transaction([cb_ctx.store], determined_type);
                        }
                        cb_ctx.objectstore = cb_ctx.transaction.objectStore(cb_ctx.store);
                        cb_ctx.transaction.addEventListener('complete', function () {
                            cb_ctx.db.close(); //API.database.close(cb_ctx);
                        });
                    } else if (API.exists(cb_ctx.store)) {
                        cb_ctx.db = cb_ctx.request.result;
                        cb_ctx.transaction = cb_ctx.request.transaction;
                        if (API.is(cb_ctx.transaction, null)) {
                            cb_ctx.transaction = cb_ctx.db.transaction([cb_ctx.store], determined_type);
                        }
                        if (!API.contains(['add.store', 'remove.store'], methodname)) {
                            cb_ctx.objectstore = cb_ctx.transaction.objectStore(cb_ctx.store);
                            cb_ctx.transaction.addEventListener('complete', function () {
                                cb_ctx.db.close(); //API.database.close(cb_ctx);
                            });
                        }
                    }
                    cb_ctx.on_success = function (obj) {
                        obj = API.results(obj);
                        obj.on_success = their_on_success;
                        API.success(obj);
                    };
                    cb_ctx.on_complete = function (obj) {
                        obj = API.results(obj);
                        obj.on_complete = their_on_complete;
                        API.safeApply(obj.on_complete, [obj]);
                    };
                    API.safeApply(method, [cb_ctx]);
                };

                if (API.contains(['get.databases', 'delete.database', 'open.database'], methodname)) {
                    return API.safeApply(method, [context]);
                } else if (API.isnt(API.transaction.versionChange, determined_type)) {
                    owncontext.on_success = cb;
                } else {
                    owncontext.version = context.version + 1;
                    owncontext.on_upgrade_needed = cb;
                }
                API.database.open(owncontext);
            },
            model = API.args(args);
        model.type = determined_type;
        API.transaction.queues.push(model);
        checkQueue();
    };


    API.wrap = function (fn, method) {
        var deferred = API.deferred(),
            complex = API.contains(['get.entries', 'update.entries', 'remove.entries'], method),
            codeMap = {
                success: 's',
                error: 'e',
                abort: 'a',
                complete: 'c',
                upgrade_needed: 'u',
                blocked: 'b',
                closed: 'l'
            },
            /* We've dirtied up the context with our own callbacks. 
             * Before returning the context to the user, this
             * method removes the stuff we've added so they don't
             * get inherited into chained contexts. */
            replaceOriginalCallbacks = function (args, map) {
                var obj = args[0];
                if (API.isObject(obj)) {
                    /* Only define if previously defined, otherwise wipe. */
                    API.safeIterate(map, function (key, value) {
                        var k = 'on_' + key;
                        if (API.isFunction(value)) {
                            obj[k] = value;
                        } else {
                            delete obj[k];
                        }
                    });
                }
                args[0] = API.args(obj);
                return args;
            },
            /* This  method enforces promises and defines the behavior
             * of how they map to IDB concepts. The shorthand is to save bytes:
             * s: success
             * e: error
             * a: abort
             * b: blocked
             * */
            maybeComplete = function (args, type, map) {
                var action = null;
                args = replaceOriginalCallbacks(args, map);
                if (API.is(type, 's')) {
                    action = (complex) ? deferred.notify : deferred.resolve;
                } else if (API.is(type, 'e') || API.is(type, 'a') || API.is(type, 'b')) {
                    action = deferred.reject;
                } else {
                    action = deferred.resolve;
                }
                API.safeApply(action, args, deferred);
            },
            /* This method adds an on_something to proxy the requests before they
             * make it to the original objects, which are stored in callbackMap */
            attachCallbacksAndCallAPI = function (args, map, callback, signature) {
                API.safeIterate(map, function (key, value) {
                    /* These methods proxy requests for promise-keeping */
                    args['on_' + key] = function (finalized) {
                        API.safeApply(map[key], [finalized]);
                        maybeComplete([finalized], codeMap[key], map);
                    };
                });
                /* Runs setup for the method */
                try {
                    API.stage(callback, args, signature);
                } catch (err) {
                    args.error = err;
                    maybeComplete(args, 'e', map, callback, signature);
                }
            };
        return function (context) {
            context = context || {};
            var callbackMap = {
                success: context.on_success,
                error: context.on_error,
                abort: context.on_abort,
                complete: context.on_complete,
                upgrade_needed: context.on_upgrade_needed,
                blocked: context.on_blocked,
                close: context.on_close
            };
            attachCallbacksAndCallAPI(context, callbackMap, fn, method);
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
        API.safeIterate(internal, function (sig, fnref) {
            names = sig.split('.');
            if (API.isnt(names[0].match(reg), null)) {
                name = names[0].replace(reg, '');
                Public[name] = Public[name] || {};
                Public[name][names[1]] = fnref;
            } else {
                name = names[0];
                Public[name] = Public[name] || {};
                Public[name][names[1]] = API.wrap(fnref, sig);
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
        '_tools.extend': API.extend,
        '_tools.defer': API.deferred
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