
/*
 * dash by Taylor Buley
 * Github -> http://github.com/editor/indb
 * Twitter -> @taylorbuley
 **/
var dash = (function () {

    'use strict';

    var win = window,
        API = {
        dbs: {},
        database: {},
        databases: {},
        store: {},
        stores: {},
        index: {},
        indexes: {},
        range: {},
        entry: {},
        cursor: {},
        transaction: {},
        db: win.indexedDB,
        tx: win.IDBTransaction,
        cur: win.IDBCursor,
        kr: win.IDBKeyRange,
        reserved: [ 'continue', 'delete' ]
    };

    /* Begin Utils */

    /* This method copies an object by value (deeply) */
    //warning: recursive
    API.clone = function (obj) {
        var clone = {};
        if (API.isNumber(obj)) {
            return parseInt(obj, 10);
        } else if (API.isArray(obj)) {
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

    //arraylike works (e.g. DOMStringList)
    API.isArray = function (mixed_var) {
        return (mixed_var instanceof Array || mixed_var instanceof DOMStringList);
    };

    API.toNumber = function (mixed_var) {
        var result = parseInt(mixed_var, 10);
        return API.is(false, API.isNumber(result)) ? null : result;
    };

    API.isNumber = function (mixed_var) {
        return API.isType("number", mixed_var) || API.is( isNaN(parseInt(mixed_var, 10), false ));
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
            API.safeApply(callback, [ x, items[x] ]);
        }
    };

    /* This method collects responses from given `items` */
    API.safeEnumerate = function (items, callback, on_complete) {
        var collect = [];
        if (API.isArray(items)) {
            API.safeEach(items, function () {
                collect.push(API.safeApply(callback,arguments));
            });
        } else if (API.isObject(items)) {
            API.safeIterate(items, function () {
                collect.push(API.safeApply(callback,arguments));
            });
        }
        API.safeApply(on_complete, [collect]);
        return collect;
    };

    /* This method collects responses from given `items` */
    API.safeCollect = function (items, context, on_complete) {
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
        } else if (API.isFunction(err)) {
            API.safeApply(err, []);
        }
        return;
    };

    /* End Utils */

    /* Begin API */

    /*
     *  Helpers
     */

    API.success = function(context) {
        return API.safeApply(context.on_success, [context]);
    };
    API.error = function(context) {
        return API.safeApply(context.on_error, [context]);
    };
    API.complete = function(context) {
        return API.safeApply(context.on_complete, [context]);
    };
    API.abort = function(context) {
        return API.safeApply(context.on_abort, [context]);
    };

    API.standardCallbackNames = [ 'on_success', 'on_error', 'on_abort', 'on_blocked', 'on_upgrade_needed' ];
    API.standardRequest = function(context) {
        var request = context.request;
        context = API.standardCallbacks(context);
        if (API.exists(request) && API.is(request.readyState, 'done')) {
            context.result = API.entry.result(context);
            API.success(context);
            return;
        }
        return API.extend(request, {
            onsuccess: context.on_success,
            onerror: context.on_error,
            onabort: context.on_abort,
            onclose: context.on_close,
            onblocked: context.on_blocked,
            onupgradeneeded: context.on_upgrade_needed
        });
    };
    API.standardCallbacks = function(context) {
        var clone = {},
            decorate = function (event) {
                context.event = event;
                if (API.hasPath(event,'target.transaction')) {
                    context.transaction = event.target.transaction;
                    context.db = context.transaction.db;
                }
                context.result = API.entry.result(context);
                return context;
            };
        API.safeEach( API.standardCallbackNames, function(i, fn) {
            clone[fn] = (function() {
                return function(event) {
                    API.safeApply(context[fn], [decorate(event)]);
                };
            }());
        });
        return clone;
    };

    /*
     *   Database
     *   Namespaces:
     *       API.database
     *  Methods:
     *      API.database.close
     *      API.database.open
     *      API.database.set
     *      API.database.setVersionRequest
     *      API.database.upgrade
     *      API.database.upgradeRequest
     *      API.database.show
     *      API.databases.close
     */

    /* Close a single db named `database` */
    API.database.close = function (context) {
        context.db = API.database.get(context);
        if (API.exists(context.db)) {
            API.safeApply(context.db.close, []);
            delete API.dbs[context.database];
        }
        API.success(context);
    };

    /* This method caches a loaded database for later use */
    API.database.set = function (context) {
        return API.dbs[context.database] = context.db;
    };

    API.database.get = function (context) {
        return API.exists(context.db) ? context.db : API.dbs[context.database];
    };

    /* This is a safe method for opening a given `database` at a given
     * `version`, and optionally a given `store` along with it.
     * This will handle any upgrade events.
     */
    API.database.upgrade = function (context) {
        var db = API.database.get(context),
            store = context.store,
            version = API.toNumber(context.version) || API.exists(db) ? db.version + 1 : 1,
            their_on_success = context.on_success,
            callback = function (passed_context) {
                db = passed_context.db;
                if (API.isEmpty(db) || (API.exists(db.version) && db.version >= version)) {
                    var result;
                    if (API.exists(store) && API.isFunction(db.objectStore)) {
                        context.objectstore = db.objectStore(store);
                    }
                    passed_context.on_success = their_on_success;
                    API.safeApply(their_on_success, [passed_context]);
                } else {
                    context.version = version;
                    API.database.upgradeRequest(passed_context);
                }
            };

        if (API.isEmpty(db)) {
            API.database.open( API.extend( context, {
                on_upgrade_needed: function (context) { callback(context); },
                on_success: function (context) { callback(context); }
            } ) );
        } else {
            context.db = db;
            callback(context);
        }
    };

    /* This method upgrades a database to a given `version` or defaults to
     * previous version plus one */
    API.database.upgradeRequest = function (context) {
        var store = context.store,
            name = context.database,
            db = API.database.get(context),
            version = db.version + 1 || API.toNumber(context.version),
            decorate = function (passed_context) {
                //Replace with a database ref in upgraded version state
                passed_context.db = passed_context.event.target.result;
                API.database.set(passed_context);
                passed_context.transaction = passed_context.event.target.transaction;
                if (API.exists(store)) {
                    passed_context.objectstore = passed_context.transaction.objectStore(store);
                }
                return passed_context;
            },
            their_upgrade = context.on_upgrade_needed;
        context.db = db;
        context.version = version;
        if (API.exists(db) && db.version >= version) {
            API.success(decorate(null));
        } else {
            API.safeApply(db.close,[], db);
            context.request = API.db.open(name, version);
            context.on_upgrade_needed = function(passed_context) {
                API.safeApply(their_upgrade, [ decorate( context ) ] );
            };
            API.standardRequest(context);
        }
    };

    /* This method loads a database given a database name and version.
     * The database can be retrived on successful callback via the `db`
     * attribute on the context object */
    API.database.open = function (context) {
        var name = context.database,
            db = API.db,
            version = context.version,
            args = [name],
            their_upgrade = context.on_upgrade_needed,
            their_success = context.on_success;
        if ( API.exists( version ) ) {
            args.push( version );
        }
        context.request = API.safeApply(db.open, args, db);
        API.standardRequest( API.extend(context, {
            on_success: function (passed) {
                passed.upgrade = false;
                passed.db = passed.result;
                delete passed.result;
                API.safeApply(their_success, [passed]);
            },
            on_upgrade_needed: function (passed) {
                passed.upgrade = true;
                passed.db = passed.result;
                delete passed.result;
                API.safeApply(their_upgrade, [passed]);
            }
        } ) );
    };

    /* This method shows a database either from the
     * cache or by passing the request to API.database.open(().
     * The database can be retrived on successful callback via the `db`
     * attribute on the context object. */
    API.database.show = function (context) {
        var database = context.database,
            theirs = context.on_success;
        if (API.exists(API.dbs[database])) {
            context.db = API.dbs[database];
            API.success(context);
        } else {
            API.database.open(API.extend(context, {
                on_success: function(context) {
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
    API.databases.show = function (context) {
        var theirs = context.on_success;
        context.request = API.db.webkitGetDatabaseNames();
        return API.standardRequest(API.extend(context, {
            on_success: function(context) {
                context.databases = context.result;
                delete context.result;
                context.on_success = theirs;
                API.success(context);
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
     *      API.store.show
     *      API.stores.show
     */

    /* This method clears a `database` object `store` of any objects. */
    API.store.clear = function (context) {
        context.transaction = API.transaction.create(context);
        context.db = context.transaction.db;
        context.objectstore = context.transaction.objectStore(context.store);
        context.request = objectstore.clear();
        API.standardRequest(context);
        return context;
    };

    /* This method delete a `database` object `store` */
    API.store['delete'] = function (context) {
        var their_on_success = context.on_success;
        API.database.upgrade( API.extend( context, API.standardCallbacks( {
            on_upgrade_needed: function (passed_context) {
                /* createObjectStore throws catchable errors */
                console.log('upgraded ready for delete',passed_context);
                try {
                    context.request = context.db.deleteObjectStore(context.store);
                    passed_context.on_success = their_on_success;
                    API.success(passed_context);
                } catch (error) {
                    context.error = error;
                    API.error(context);
                }
            }
        } ) ) );
        return context;
    };

    /* This method creates a store named `name` on the given `database`
     * return true if request is successfully requested (no bearing on result)
     * autoinc_key defaults to false if a key is specified;
     * key gets set to "key" and autoincrements when key is not specified */
    API.store.create = function (context) {
        var their_on_upgrade_needed = context.on_upgrade_needed;
        API.database.upgrade( API.extend( API.standardRequest(context, {
            on_upgrade_needed: function (passed_context) {
                /* createObjectStore throws catchable errors */
                try {
                    context.objectstore = passed_context.db.createObjectStore(context.store, {
                        keyPath: API.isEmpty(context.key_path) ? null : context.key_path,
                        autoIncrement: API.isBoolean(context.autoinc_key) ? context.autoinc_key : false
                    });
                    context.on_upgrade_needed = their_on_upgrade_needed;
                    API.safeApply(their_on_upgrade_needed, [context]);
                } catch (error) {
                    context.error = error;
                    API.error(context);
                }
            }
        } ) ) );
    };

    /* Returns an existential boolean syncronously, or asyncronously through
     * an on_complete callback, given a database, and store.
     * The way we check if a store exists is to open transaction and search
     * the `objectStoreNames` property haystack with the given store needle. */
    /* TODO: Explore using db.objectStores[ 'contains' ](name ) when available */
    API.store.exists = function (context) {
        context.transaction = API.transaction.create(context);
        context.stores = API.exists(context.transaction) ? context.transaction.objectStoreNames : null,
        context.result = API.contains(stores, context.store) ? true : false;
        API.success(context);
        return result;
    };

    /* Returns a single store syncronously, or asyncronously through
     * an on_success callback, given a database and store. */
    API.store.show = function (context) {
        var store = context.store,
            transaction = API.transaction.create(context);
        context.objectstore = transaction.objectStore(store);
        API.success(context);
        return context;
    };

    /* Returns all stores syncronously, or asyncronously through
     * an on_success callback, given a database. */
    API.stores.show = function (context) {
        var db = context.db || API.dbs[context.database];
        context.stores = db.objectStoreNames;
        API.success(context);
        return context;
    };

    /*
     *  Indexes
     *  Namespaces
     *      API.index
     *      API.indexes
     *  Methods:
     *      API.index.create
     *      API.index.exists
     *      API.index.show
     *      API.index.delete
     *      API.indexes.show
     *      API.indexes.create
     */

    /* This method creates a given index on `key` using `name` and optiona
     * `unique` and `multi_entry` params (both default to false).
     */
    API.index.create = function (context) {
        API.database.upgrade( {
            database: context.database,
            on_upgrade_needed: function (passed_context) {
                var db = API.database.set( passed_context ),
                    objectstore = passed_context.transaction.objectStore(context.store);
                try {
                    context.idx = objectstore.createIndex(context.index, context.key_path, {
                        'unique': context.unique || false,
                        'multiEntry': context.multi_entry || false
                    });
                    API.safeApply(context.on_upgrade_needed);
                } catch (error) {
                    context.error = error;
                    API.error(context);
                }
            },
            on_error: context.on_error,
            on_abort: context.on_abort
        });

    };

    /* Returns a single index syncronously, or asyncronously through
     * an on_complete callback, given a database, store and index. */
    API.index.show = function (context) {
        context.db = context.db || API.dbs[context.database];
        context.transaction = API.transaction.create(context),
        context.objectstore = context.transaction.objectStore(context.store);
        context.idx = context.objectstore.index(context.index);
        API.success(context);
        return context;
    };

    /* Returns an existential boolean syncronously, or asyncronously through
     * an on_complete callback, given a database, store and index.
     * The way we check if an index exists is to open a transaction on the
     * store and iterate through its `indexNames` property. */
    API.index.exists = function (context) {
        context.db = context.db || API.dbs[context.database];
        context.transaction = API.transaction.create(context);
        context.objectstore = transaction.objectStore(context.store);
        context.result = API.contains(context.objectstore.indexNames, index);
        if (API.is(context.result, true)) {
            context.idx = context.objectstore.index(index);
        }
        API.success(context);
        return context;
    };

    /* This method deletes an index with a given `name` on a given
     * `database` and `store`. It creates an implicit database version upgrade.
     */
    API.index['delete'] = function (context) {
        var their_upgrade = context.on_upgrade_needed,
            their_success = context.on_success,
            doWork = function (passed_context) {
                try {
                    passed_context.request = passed_context.objectstore.deleteIndex(context.index);
					passed_context.on_success = their_success;
					API.success(passed_context);
                } catch (error) {
                    passed_context.error = error;
                    API.error(passed_context);
                }
            };
        context.on_success = null;
        context.on_upgrade_needed = function (passed_context) {
            doWork(passed_context);
            API.safeApply(their_upgrade, [passed_context]);
        }
        API.database.upgrade(context);
    };

    /* Returns all indexes syncronously, or asyncronously through
     * an on_success callback, given a database and store. */
    API.indexes.show = function (context) {
        var transaction = API.transaction.create(context),
            objectstore = transaction.objectStore(context.store);
        context.indexes = objectstore.indexNames;
        API.success(context);
        return context;
    };

    /*
     *  Transactions
     *  Namespaces:
     *      API.transaction
     *  Methods:
     *      API.transaction.read
     *      API.transaction.readWrite
     *      API.transaction.versionChange
     */

    /* Transaction types */
    API.transaction.read = function () {
        return "readonly";
    };
    API.transaction.readWrite = function () {
        return "readwrite";
    };
    API.transaction.versionChange = function () {
        return "versionchange";
    };

    /* This method is a transaction factory for transaction of a given `type` on a given
     * `database` and `store` */
    API.transaction.create = function (context) {
        var db = context.db || API.dbs[context.database],
            type = context.type || API.transaction.readWrite(),
            result = db.transaction([context.store], type);
        API.success([result]);
        return result;
    };

    /**
     * Directions
     *
     **/

    /* Direction types */

    API.cursor.next = function (context) {
        return API.is(false, context.duplicates) ? API.cur.NEXT_NO_DUPLICATE : API.cur.NEXT;
    };

    API.cursor.previous = function (context) {
        return API.is(false, context.duplicates) ? API.cur.PREV_NO_DUPLICATE : API.cur.PREV;
    };

    API.cursor.isDirection = function (context) {
        var direction = context.direction;
        return (API.isNumber(direction) && direction >= API.cursor.next() && direction <= API.cursor.previous(true)) ? true : false;
    };

    /*
     * Key Ranges
     */

    API.range.only = function (value) {
        return API.range.get(value, null, null, null, null);
    };
    API.range.left = function (left_bound) {
        return API.range.get(null, left_bound, null, false, null);
    };
    API.range.leftOpen = function (left_bound) {
        return API.range.get(null, left_bound, null, true, null);
    };
    API.range.right = function (right_bound) {
        return API.range.get(null, null, right_bound, null, false);
    };
    API.range.rightOpen = function (right_bound) {
        return API.range.get(null, null, right_bound, null, true);
    };

    /* This method returns an IDBKeyRange given a range type
     * and returns false if type is not valid.
     * Valid types include: bound, leftBound, only, rightBound */
    /* This approach adds syntatic sugar by using duck typing
     * to determine key type */
    /* For more info on key types: https://developer.mozilla.org/en/indexeddb/idbkeyrange*/
    API.range.get = function (context) {
        var result = false,
            value = context.value,
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
        } else if (API.exists(value)) {
            result = API.kr.only(value);
        }
        return result;
    };

    /*
     *  Rows
     *
     *  Namespaces:
     *      API.entry
     *
     *  Methods:
     *      API.entry.add
     *      API.entry[ 'delete' ]
     *      API.entry.get
     *      API.entry.put
     *      API.entry.result
     *
     */

    /* This method adds a `data` object to an object `store` `database`. */
    API.entry.add = function (context) {
        var store = context.store,
            data = API.isFunction(context.data) ? context.data() : API.clone(context.data),
            transaction = API.transaction.create(context),
            objectstore = transaction.objectStore(store);
        context.request = objectstore.add(data);
        return API.standardRequest(context);
    };

    /* This method deletes a `database`'s object `store` row given a `key` */
    API.entry['delete'] = function (context) {
        var store = context.store,
            transaction = API.transaction.create(context),
            objectstore = transaction.objectStore(store);
        context.request = objectstore["delete"](context.key);
        return API.standardRequest(context);
    };

    /* This method gets a row from an object store named `store` in a database
     * named `database` using an optional `index` and `key`
     */
    API.entry.get = function (context) {
        var transaction,
            objectstore,
            index = context.index,
            key = context.key,
            request,
            idx;
        context.type = context.type || API.transaction.read();
        transaction = API.transaction.create(context);
        objectstore = transaction.objectStore(context.store);
        if (API.exists(index)) {
            try {
                idx = objectstore.index(index)
                request = idx.get(key);
            } catch (error) {
                context.error = error;
                return API.error(context);
            }
        } else {
            request = objectstore.get(key);
        }
        context.request = request;
        if (API.exists(idx)) {
            context.idx = idx;
        }
        return API.standardRequest(context);
    };

    /* This method puts a `data` object to a `database` object `store` using a `key`.
     * This change is made without regard to its previous state. */
    API.entry.put = function (context) {
        var store = context.store,
            key = context.key,
            data = API.isFunction(context.data) ? context.data() : API.clone(context.data),
            transaction = API.transaction.create(context),
            objectstore = transaction.objectStore(store);
        context.request = API.exists(key) ? objectstore.put(data, key) : objectstore.put(data);
        return API.standardRequest(context);
    };



    /* This helper method plucks a value from a request row */
    API.entry.result = function (context) {
        var event = API.hasPath(context.event, 'event') ? context.event.event : context.event,
            result = null;
        if ( API.hasPath(event, 'target.result') ) {
            result = event.target.result;
        } else if ( API.hasPath(event, 'result') ) {
            result = event.result;
        } else if ( API.hasPath(event, 'request.result') ) {
            result = event.request.result;
        }
        return result;
    };

    /*
     *  Cursors
     *
     *  Namespaces:
     *      API.cusor
     *
     *  Methods:
     *      API.cursor.delete
     *      API.cursor.get
     *      API.cursor.value
     */

    /* This method deletes rows from a `database` `store` matching the
     * `index` cursor with the given `key_range`
     */
    API.cursor['delete'] = function (context) {
        var direction = context.direction || API.cursor.next(),
            key_range = context.key_range,
            index = context.index,
            store = context.store,
            transaction = API.transaction.create(context),
            objectstore = transaction.objectStore(store),
            request,
            idx,
            total = 0,
            expecting = context.expecting,
            limit = context.limit,
            decorate = function (event) {
                context.event = event;
                return context;
            };
        try {
            if (!API.isEmpty(index)) {
                idx = objectstore.index(index)
                request = idx.openCursor(key_range, direction);
            } else {
                request = objectstore.openCursor(key_range, direction);
            }
            context.request = request;
            context.idx = idx;
            API.extend(request, {
                onsuccess: function (event) {
                    var ctx = {event: event},
                        cursor = API.entry.result(ctx),
                        result = API.cursor.value(ctx),
                        flagged = false,
                        maybeFinish = function () {
                            total += 1;
                            if (API.isNumber(limit) && total >= limit) {
                                API.complete(context);
                            } else {
                                if (API.exists(cursor) && API.isFunction(cursor['continue'])) {
                                    try {
                                        cursor['continue']();
                                    } catch (error) {
                                        context.result = error;
                                        API.complete(context);
                                    }
                                }
                            }
                        };
                    context = decorate(event);
                    context.result = result;
                    if (API.exists(cursor)) {
                        context.cursor = cursor;
                    }
                    if (API.exists(expecting)) {
                        API.safeIterate(expecting, function (attr, expected) {
                            var value = (API.hasPath(result, attr)) ? result[attr] : null;
                            if (API.isFunction(expected)) {
                                expected = expected(value);
                            }
                            if (API.exists(value) && API.exists(expected) && API.isnt(value, expected)) {
                                flagged = true;
                            }
                        });
                    }
                    if (API.is(flagged, false) && API.exists(cursor) && API.exists(result)) {
                        try {
                            API.extend(cursor['delete'](), {
                                onsuccess: function () {
                                    maybeFinish();
                                    API.safeApply(context.on_success, arguments);
                                },
                                onerror: function () {
                                    API.safeApply(context.on_error, arguments);
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
                    API.error(decorate(event));
                },
                onabort: function (event) {
                    return API.abort(decorate(event));
                }
            });
        } catch (error) {
            context.error = error;
            API.error(context);
        }
    };

    /* This method gets rows from a `database` object `store` using a cursor creating
     * with an `index`, `key_range` and optional `direction`. */
    API.cursor.get = function (context) {
        var direction = API.cursor.isDirection(context.direction) ? context.direction : API.cursor.next(),
            key_range = context.key_range,
            expecting = context.expecting,
            limit = context.limit,
            index = context.index,
            transaction = API.transaction.create(context.database, context.store, API.transaction.readWrite()),
            request,
            total = 0,
            decorate = function (event) {
                context.event = event;
                return context;
            };
        try {
            if (!API.isEmpty(index)) {
                request = transaction.index(index).openCursor(key_range, direction);
            } else {
                request = transaction.openCursor(key_range, direction);
            }
            API.extend(request, {
                onsuccess: function (event) {
                    var cursor,
                        flagged = false,
                        maybeFinish = function () {
                            total += 1;
                            if (API.isNumber(limit) && total >= limit) {
                                API.complete(context);
                            } else {
                                if (API.exists(cursor) && API.isFunction(cursor['continue'])) {
                                    try {
                                        cursor['continue']();
                                    } catch (error) {
                                        API.complete(context);
                                    }
                                }
                            }
                        };
                    context = decorate(event);
                    cursor = API.entry.result(context);
                    context.result = API.cursor.value(context);
                    if (API.exists(expecting)) {
                        API.safeIterate(expecting, function (attr, expected) {
                            var value = (API.hasPath(result, attr)) ? result[attr] : null;
                            if (API.isFunction(expected)) {
                                expected = expected(value);
                            }
                            if (API.exists(value) && API.exists(expected) && API.isnt(value, expected)) {
                                flagged = true;
                            }
                        });
                    }
                    if (API.is(flagged,true)) {
                        API.error(context);
                    } else {
                        API.success(context);
                    }
                    maybeFinish();
                },
                onerror: function (event) {
                    return  API.error(decorate(event));
                },
                onabort: function (event) {
                    return API.abort(decorate(event));
                }
            });
        } catch (error) {
            context.error = error;
            API.error(context);
        }
    };

    /* This method plucks a value from a cursor row */
    API.cursor.value = function (context) {
        var event = API.hasPath(context.event, 'event') ? context.event.event : context.event;
        return API.hasPath(event, 'target.result.value') ? event.target.result.value : null;
    };

    /*
     * The MIT License (MIT)
     * Copyright (c) 2011 Buley LLC
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     *
     */

    API.deferred = function() {
        var complete = false,
            wasSuccess = null,
            completed = [],
            children = [],
            notifies  = [],
            successes = [],
            errors = [],
            finallys = [],
            doFinally = function(args) {
                API.safeIterate(finallys, function(on_finally) {
                    API.safeApply(on_finally, args);
                });
            };
        return {
            promise: {
                then: function(on_success, on_error, on_notify) {
                    var deferred = API.deferred();
                    children.push(deferred);
                    if (API.is(complete,true)){
                        API.safeApply( wasSuccess ? on_success : on_error, completed);
                    } else {
                        API.safeEach([
                            [successes, on_success],
                            [errors, on_error],
                            [notifies, on_notify]], function(i, pair) {
                            var fn = pair[1];
                            if (API.isFunction(fn)) {
                                pair[0].push(fn);
                            }
                        });
                    }
                    return deferred.promise;
                },
                'finally': function(on_finally) {
                    if (API.is(complete,false)){
                        finallys.push(on_finally);
                    } else {
                        API.safeApply(on_finally,completed);
                    }
                }
            },
            resolve: function() {
                var args = arguments;
                wasSuccess = true;
                completed = args;
                if (API.is(complete,false)){
                    complete = true;
                    API.safeEach(successes, function(i, on_success) {
                        API.safeApply(on_success, args);
                    });
                    API.safeEach(children, function(i, child) {
                        API.safeApply(child.resolve, args);
                    });
                    doFinally(args);
                }
            },
            notify: function() {
                var args = arguments;
                if (API.is(complete,false)){
                    API.safeEach(notifies, function(i, on_notify) {
                        API.safeApply(on_notify, args);
                    });
                }
            },
            reject: function() {
                var args = arguments;
                wasSuccess = false;
                completed = args;
                if (API.is(complete,false)){
                    complete = true;
                    API.safeEach(errors, function(i, on_error) {
                        API.safeApply(on_error, args);
                    });
                    doFinally(args);
                }
            }
        }
    }
    API.wrap = function(fn, method) {
        return function(context) {
            context = context || {};
            var deferred = API.deferred(),
                reject = deferred.reject,
                resolve = deferred.resolve,
                notify = deferred.notify,
                rejected = false,
                complex = API.contains(['indexes.create', 'stores.create'], method),
                their_on_success = null,
                their_on_error = null,
                their_on_abort = null,
                their_on_complete = null,
                their_on_upgrade_needed = null,
                their_on_blocked = null,
                reconstitute = function(args) {
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
                        }  else {
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
                        delete obj.event;
                    }
                    args[0] = obj;
                    return args;
                },
                maybeComplete = function(args, type) {
                    var actions = [];
                    args = reconstitute( args );
                    switch( type ) {
                        case 's':
                            actions.push(complex ? notify : resolve)
                            break;
                        case 'e':
                            actions.push(reject)
                            break;
                        case 'a':
                            actions.push(reject)
                            break;
                        case 'c':
                            actions.push(complex ? resolve : notify)
                            break;
                        case 'u':
                            actions.push(notify)
                            break;
                        case 'b':
                            actions.push(reject)
                            break;
                        default:
                            break;
                    };
                    API.safeEach(actions, function(i, action) {
                        API.safeApply(action,args);
                    });
                };
            their_on_success = context.on_success;
            their_on_error = context.on_error;
            their_on_abort = context.on_abort;
            their_on_complete = context.on_complete;
            their_on_upgrade_needed = context.on_upgrade_needed;
            their_on_blocked = context.on_blocked;
            if (API.is(complex, false) && API.is(method.split('.')[0],'entry')) {
                complex = API.exists(context.index) ? true : API.is(method,'entry.update');
            }
            fn( API.extend(context, {
                on_success: function() {
                    maybeComplete(arguments, 's');
                    API.safeApply(their_on_success, arguments);
                },
                on_error: function() {
                    maybeComplete(arguments, 'e');
                    API.safeApply(their_on_error, arguments);
                },
                on_abort: function() {
                    maybeComplete(arguments, 'a');
                    API.safeApply(their_on_abort, arguments);
                },
                on_complete: function() {
                    maybeComplete(arguments, 'c');
                    API.safeApply(their_on_complete, arguments);
                },
                on_upgrade_needed: function() {
                    maybeComplete(arguments, 'u');
                    API.safeApply(their_on_upgrade_needed, arguments);
                },
                on_blocked: function() {
                    maybeComplete(arguments, 'b');
                    API.safeApply(their_on_blocked, arguments);
                }
            }) );
            return deferred.promise;
        };
    };
    /* We programmatically construct the public-facing API for a couple of
     * reasons: less code and protects namespace in advance minification,
     */
    return (function(internal) {
        var Public = {},
            names = [],
            name,
            reg = /^_/;
        API.safeIterate(internal, function(signature, fn){
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
    }( {
        'database.close': API.database.close,
        'database.open': API.database.open,
        'database.delete': API.database['delete'],
        'database.show': API.database.show,
        'database.upgrade': API.database.upgrade,
        'databases.show': API.databases.show,
        'databases.close': API.databases.close,
        'store.create': API.store.create,
        'store.show': API.store.show,
        'store.delete': API.store['delete'],
        'stores.show': API.stores.show,
        'index.create': API.index.create,
        'index.exists': API.index.exists,
        'index.show': API.index.show,
        'index.delete': API.index['delete'],
        'indexes.show': API.indexes.show,
        'entry.add': API.entry.add,
        'entry.delete': API.entry['delete'],
        'entry.get': API.entry.get,
        'entry.put': API.entry.put,
        'cursor.delete': API.cursor['delete'],
        'cursor.get': API.cursor.get,
        '_tools.each': API.safeEnumerate,
		'_tools.extend': API.extend,
        '_tools.deferred': API.deferred
    } ));
}());
