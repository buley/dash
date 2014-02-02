## Overview

[`IndexeDB`](https://developer.mozilla.org/en-US/docs/IndexedDB) (abbreviated "IDB") is a way to store data in the browser, exposed to JavaScript programmers as a programmatic interface or "API" in most [`HTML5`](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)-enabled browsers. [1]

Using IDB, programmers can organize JavaScript data and make it findable inside "databases" and "object stores", two types of containers in IndexeDB terminology. Databases are the outermost container of data in IndexeDB, and contain object stores. They are unique to each domain or "host". Object stores contain ["`lists`" of "`records`"](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-index-record-list), where each list is a JavaScript object and each record is breaks down into a "key" and "value".

IDB is, in essence, an indexed key/value store. For data that doesn't need to be accessed via index, for an otherwise non-indexed key/value store, a lighter weight client-side technologies such as localStorage or sessionStorage, or cookies may be more appropriate.

### Records

The base unit of data in IDB is a [`record`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-record) and IndexeDB is capable of storing as records most standard types of JavaScript data. To copy values to the database, IDB uses something called the "[`structured clone algorithm`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-structured-clone-algorithm)".

IDB only stores JavaScript list objects, but the values associated with keys on those objects that can typically be any value that "[cloned](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-structured-clone)", which includes both the basic JavaSript primitives and more complex object types: null values, `Boolean`s, `Number`s, `String`s, `Date`s, `Array`s, other `Object`s and even advanced types such as RegExp, Blob, File, FileList and ImageData objects. The only standard object type IDB's structured clone algorithm cannot deal with are function objects. Thus JavaScript functions cannot be stored in their native object form.  

### Keys

A [`key`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-cursor-key) identifies a record and the value is what's being stored. The list of records associated is represented by a JavaScript object, so there can be only one value per key. A [`valid key`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-valid-key-path) can be any of these types: String, Dates, floats and Arrays. The key that identifies a record is found using something called a "[`key path`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-key-path)." 

To specify a key path, a "plain string" will create a key matching a shallow attribute on a stored record. To specify the key among nested attributes in JavaScript objects, [`valid key path`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-valid-key-path) syntax uses "dot notation". For example, "first.second.third" would be the key path for an index on the "third" key in the following JavaScript object:

	{ "first": {
	    "second": {
	      "third": [ "string value 1", "string value 2" ]
	    }
	  }
	}

As shown above, it's possible to put indexes on array objects in addition to primitive values such as numbers. In such cases, the "[`multirow`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-multirow)" allow the programmer to specify when creating a database whether an index record will be created on each object in a particular array (multirow set to `true`) or whether a record is created for only the first (multirow set to `false`). When an empty array is passed as the value of a multirow index, no record will be added.

### Transactions

In IDB, work [tasked](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-task) to a database [queue](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-queue-a-task) is called a "[`transaction`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-transaction)". A transaction is an instance of [`IDBTransaction`](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction) and characterized by its "[`scope`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-scope)". Transaction scope, in turn, is characterized by both the work to be done and where the programmer wants the work to happen. To create a transaction against an open database, a programmer names the object stores on which she'd like to operate, and optionally specifies what type of transaction she'd like to create.

There are three "[`modes`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-mode)" of transactions: "[`readwrite`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-read_write)", "[`readonly`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-read_only)" and "[`versionchange`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-version_change)". The default is "readonly", convienient because changing a data via a "write" is generally more expensive than to "read" that data. The granularity and providing of "readonly" vs. "readwrite" offers the programmer an the opportunity to speed up her code depending on her needs. The final transaction type, "versionchange", is used when changing the schema of a database.

The [`lifetime`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-transaction-lifetime) of a transactions lasts as long as it's referenced: it's "`active`" so long as it's being referenced, after which it is said to be "`finished`" and the transaction is [`commited`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-commit).

### Requests

Certain transactions return data, or "[`results`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-request-result)", from the database. These transactions are called "[`requests`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-request)" and with the exception of database opening, the values are always various combinations of object "keys" and "values" and instances of [`IDBRequest`](https://developer.mozilla.org/en-US/docs/Web/API/IDBRequest). [`Request transactions`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-request-transaction) are just that: a transaction request," namely the act of asking for something rather than the getting of it. Unlike many databases, requests are not fulfilled immediately after being [`placed`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-place-request), or "synconronously"; however, these non-immediate responses are rather "asyncronous", and the mechanism a programmer uses to await an asynconrous reponse is by coding a "callback" function IDB can invoke on various "events" such as a successful response.

There are various types of callbacks in IDB depending on the type of transaction. Requests generally have "onsuccess", "onerror and "onabort" callbacks. Others include "onupgradeneeded", "onclose" and "onblocked," sometimes seen when working with databases. Each event has a different meaning depending on the transaction, but for example "onsuccess", "onupgraded" are generally a good event for the programmer while "onerror", "onabort" and "onblocked" mean something went awry for him.
 
### Restrictions

Restricted to a given [`origin`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-origin).
[`Same-origin`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-same-origin). Size limits.

IDB is typically available in both the main `window` and in Web Workers thanks to an abstracted [`IDBEnvironment`](https://developer.mozilla.org/en-US/docs/Web/API/IDBEnvironment) interface.

## The `IndexedDB` API

### Databases

A [`database`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-database) houses object stores and have two distinguishing characteristics: a [`name`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-object-store-name) (string) and [`version`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-version) (number). They are reached through an instance of [`IDBFactory`](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory) object at the `window.indexedDB` namespace. 

#### Database Names

When opening a database, a programmer must specify a databases [`name`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-object-store-name) and optionally its version. A database name is case-sensitive and cannot change. 

#### Database Versions

[`Version`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-version) numbers are whole numbers greater than zero. A programmer can set a database's version manually or implictly by opening an existing database name with a greater version number than the database contains. While a database's name can never change, the database version changes all the time. 

Speficying a version greather than the current allows us to entry a "version change" transaction that enables database schema changes. When no version is specified, the database will open with the most recent database version.

Database version numbers are stored as [8-byte "int long long"](https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB#Opening_a_database) in the underlying C programming language implementation of IDB  and can number anywhere between `0` and `18446744073709551615`.

##### `versionchange` transactions

A version number can represent only one schema for particular database, but a programmer can change a database's layout by incrementing its version number, triggering something called a "`versionchange`" transaction. [Version changes](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction#VERSION_CHANGE) preserve databases object stores and indexes, but from within a `versionchange` callback the programmer is allowed to make modifications to a database schema.

Database operations that require a version change include both creating and deleting object stores, and both creating and deleting indexes. 

#### Opening Databases

To get to objects, you have to through object stores, and to get to object stores you have to go through databases. So the first step in interaction with `IndexedDB` is almost always to open a database. Database open requests are instances of [`IDBOpenDBRequest`](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest).

	dash.open.database({ database: 'foo' })
		.then(function(context) {
			console.log('dash: database opened', context.db);
		}, function(context) {
			console.log('dash: database not opened', context.error);
		})
		.then(dash.close.database);

Opening an existing database and creating a new one work in the same way: if the name passed matches an existing database, that database is opened; if the name doesn't match an existing database, a new one will be created when opened using a unique name. Opening a new database, or opening an existing database with a version greather than the current version, will trigger a `versionchange` event.  

#### Getting Existing Databases

It's typically not possible to enumerate all databases for a host. Typically the programmer must already know the name of our database in order to of opening it, else create a new one. The exception is in Chrome, which offers a non-standard way of enumerating existing databases for a host.

	dash.get.databases().then( function(context) {
	    console.log('dash: databases fetched', context.databases);
	}, function(context) {
	    console.log('dash: databases not fetched', context.databases);
	}).then(dash.close.database);

#### Closing Databases

Databases can be [`close`d](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-database-close-1).
	
	dash.open.database({ database: 'foo' }).then(dash.close.database).then(function(context) {
		console.log('dash: database closed');
	}, function(context) {
		console.log('dash: database not closed');
	});

Databases are browser resources and, like all resources, expensive for the brower to maintain. Just as opening a database is the first step to doing anything in IndexedDB, closing a database is usually a good last step.

#### Deleting Databases

Databases can be "deleted" and their resources will be freed up for use elsewhere.

##### Deleting Databases Example: Simple Case

	dash.open.database({ database: 'foo' }).then(dash.delete.database).then(function(context) {
	    console.log('dash: database deleted');
	}, function(context) {
	    console.log('dash: database not deleted');
	}).then(dash.close.database);

Once a database is deleted you can open a new one with the same name; this is similar to a `versionchange` transaction but destroys and object stores and their contents.

### Object Stores

[Object stores](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-object-store), like their name implies, store JavaScript objects as entries. We store entries in an object store and store object stores in a database. Only after opening a database can we list all the object stores in that database or do something with a store contained therein.

Via an object store we can access these entries by looking up objects using key paths on those objects, optionally enlisting the help of "indexes" to enable for various combinations of key lookups.

Object stores are instances of [`IDBObjectStore`](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore). After creation, object stores can be either `delete`ed, or `clear`ed of their values. Deleting an object store removes any indexes associated with it, whereas clearing an object store maintains any indexes.

#### Creating Object Stores

[Creating an object store](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBDatabase-createObjectStore) requires a "versionchange" type transaction.

##### Creating Object Stores Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar' }).then(dash.create.store).then(function(context) {
		console.log('dash: store created', context.db, context.objectstore);
	}, function(context) {
		console.log('dash: store not created', context.db, context.error);
	}).then(dash.close.database);

##### Key Paths

Every store record must have a key by which it can be identified. This is called a "[`key path`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#idl-def-IDBCursorWithValueSync#widl-IDBObjectStoreSync-keyPath)", and the regular key syntax rules apply. It's OK to omit a key path when creating an object store, in which case the keys are said to be "[`out-of-line`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-out-of-line)" (vs. [`in-line`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-in-line-keys)). In that case, IDB knows not from where to source it's key, and so the programmer must supply a key parameter with each object addition.  

The key path provided with an object store on creation works, in effect, like an "`index`"; however, unlike an index it's possible to delegate key generation to IndexedDB. The key is optional when putting an object into an object store if the "autoIncrement" parameter is set to true on object store creation. Otherwise the programmer will have to include a non-null key on each object added or put into the object store. 

The "autoIncrement" parameter creates a IDB ["key generator"](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-key-generator) that will create a monotonically increasing integer key automatically for each new object added to the store. For example, first object added to a database with the key "`foo`" and the `autoIncrement` set to `true`, will have the value `1` for its key path, the second value `2`, and so on for the object attribute `foo`.

#### Getting An Object Stores

With an open database it's possible to get a reference to an object store. [`Get`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBObjectStore-get)ting an object store accepts both "readonly" and "readwrite" typed transactions.

##### Getting An Object Store Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar' })
		.then(dash.get.store)
		.then(function(context) {
		    console.log('dash: store fetched', context.db, context.objectstore);
		}, function(context) {
		    console.log('dash: store not fetched', context.db, context.error);
		})
		.then(dash.close.database);

#### Clearing An Object Store

[`Clear`ing](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBObjectStore-clear) an object store requires a "readwrite" type transaction.

##### Clearing An Object Store Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar' })
		.then(dash.clear.store)
		.then(function(context) {
			console.log( 'dash: store was cleared', context.db, context.objectstore );
		}, function(context) {
			console.log( 'dash: store wasn't cleared', context.db, context.objectstore, context.error );
		})
		.then(dash.close.database);

#### Removing An Object Store

[`Delete`ing](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBObjectStore-delete) an object store requires a "versionchange" type transaction.

##### Removing An Object Store Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar' })
		.then(dash.remove.store)
		.then(function(context) {
			console.log( 'dash: store was removed', context.db, context.objectstore);
		}, function(context) {
			console.log( 'dash: store wasn't removed', context.db, context.objectstore, context.error);
		})
		.then(dash.close.database);

#### Getting Multiple Object Stores

With an open database it's possible to get a list of all object store names. This list is an `Array`-like collection of string object store names.

##### Getting Multiple Object Stores Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar' })
		.then(dash.get.stores)
		.then(function(context) {
		    console.log('dash: stores fetched', context.db, context.stores);
		}, function(context) {
		    console.log('dash: stores not fetched', context.db, context.error);
		})
		.then(dash.close.database);

### Indexes

[`Indexes`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-index) are the way values are generally found in an object store. An `index` is an instance of [`IDBIndex`](https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex) and is a list of keys and values and has two characterizing components: the key path to find the data and the record value itself. `Indexes` stored primarily by key, and secondarily by their values, in ascending order.

Both adding and removing indexes requires a `versionchange` transaction.

#### Creating An Index

The options for creating a new `index` are similar to those when creating an object store: a `key path` is given using the standard key syntax and the `unique` and `multirow` options can both be used. The ["`unique`"](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-multirow#dfn-unique) parameter tells the browser not to allow two values to correspond to the same key and the ["multirow"](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-multirow) flag controls how the index behaves when dealing with `Array` values.

##### Creating An Index Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar', index: 'baz' })
		.then(dash.create.index)
		.then(function(context) {
		    console.log('dash: index created', context.db, context.objectstore, context.idx);
		}, function(context) {
		    console.log('dash: index was not created', context.db, context.objectstore, context.error);
		})
		.then(dash.close.database);

#### Getting An Index

With a string index name, it's possible to get a reference to an existing index from an object store.

##### Getting An Index Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar', index: 'baz' })
		.then(dash.get.index)
		.then(function(context) {
		    console.log('dash: index fetched', context.db, context.objectstore, context.idx);
		}, function(context) {
		    console.log('dash: index was not fetched', context.db, context.objectstore, context.error);
		})
		.then(dash.close.database);


#### Removing An Index

With a string index name, it's possible to get a reference to an existing index from an object store.

##### Removing An Index Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar', index: 'baz' })
		.then(dash.remove.index)
		.then(function(context) {
		    console.log('dash: index removed', context.db, context.objectstore);
		}, function(context) {
		    console.log('dash: index was not removed', context.db, context.objectstore, context.idx, context.error);
		})
		.then(dash.close.database);


#### Getting Multiple Indexes

Using an object store on an open database, it's possible to get a list of indexes names. This list is an `Array`-like collection of string names.

##### Getting Multiple Indexes Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar', index: 'baz' })
		.then(dash.create.index)
		.then(function(context) {
		    console.log('dash: index created', context.index, context.idx);
		}, function(context) {
		    console.log('dash: index was not created', context.index, context.idx);
		})
		.then(dash.close.database);

### Working With Singular `IndexedDB` Object

It's possible to ["`add`"](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBObjectStore-add) (create), ["`get`"](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBObjectStore-get) (read), ["`put`"](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBObjectStore-put) (update an existing object, else create a new one) and ["`delete`"](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBObjectStore-delete) (destroy) single objects in an object store. Generally, to `delete` or `get` a record requires using its `key`, but both `add` and `put` operations do not require a key and will handily return an object's object store key value when added or put (useful when using a [`key generator`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-key-generator) and the key is unknown until after insertion).

#### Adding An Object To An Object Store

When adding or putting values, the various uniqueness rules for the store and indexes together apply to any entries added to that object store. 

##### Adding An Object To An Object Store Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar' })
		.then(dash.add.object)
		.then(function(context) {
		    console.log('dash: object added', context.db, context.objectstore, context.idx, context.result);
		}, function(context) {
		    console.log('dash: object not added', context.db, context.objectstore, context.idx, context.error);
		})
		.then(dash.close.database);

#### Removing Object From An Object Store

##### Removing An Object From An Object Store Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar', key: 'baz' })
		.then(dash.remove.object)
		.then(function(context) {
		    console.log('dash: object removed', context.db, context.objectstore, context.idx, context.result);
		}, function(context) {
		    console.log('dash: object not removed', context.db, context.objectstore, context.idx, context.error);
		})
		.then(dash.close.database);

#### Getting An Object From An Object Store

##### Getting An Object From An Object Store Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar', key: 'baz' })
		.then(dash.get.object)
		.then(function(context) {
		    console.log('dash: object removed', context.db, context.objectstore, context.idx, context.result);
		}, function(context) {
		    console.log('dash: object not removed', context.db, context.objectstore, context.idx, context.error);
		})
		.then(dash.close.database);

#### Putting An Object Into An Object Store

##### Putting An Object Into An Object Store Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar', key: 'baz', data: { bang: 'boom' } })
		.then(dash.put.object)
		.then(function(context) {
		    console.log('dash: object put', context.db, context.objectstore, context.idx, context.result);
		}, function(context) {
		    console.log('dash: object not put', context.db, context.objectstore, context.idx, context.error);
		})
		.then(dash.close.database);

### Working With Multiple Objects

When querying for more than one object we must use indexes, and to use indexes we in complex manners we typically need to use a special type of request called a "cursor." When you want to ask for a [`range`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-range) of data on an index, what you get back is not the data itself but rather a cursor, which is a reference to a [`position`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-position) in the index and fires asyncronous callbacks as that position changes.

When a cursor's callbacks fire, the programmer can place a request and then either "continue" the cursor or abandon it. This process continues until either the programmer is done with the request or the cursor has [exhausted](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-got-value) the results from its  request [`source`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-cursor-source).

#### `IndexedDB` Cursors

Using an index and a key range for that index, you can use a "[`cursor`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-cursor)" to get, put and delete [`values`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-cursor-value) one at a time but in single request. Cursors are also capable of "[`advancing`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBCursor-advance)" and, in effect, skip a number of objects in an index for a given key range. 

Cursors traverse an index matching a given "key range".

Two different types of cursors: cursors that read just keys (instances of [`IDBCursor`](https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor)) and cursors that read keys and values [`IDBCursorWithValue`](https://developer.mozilla.org/en-US/docs/Web/API/IDBCursorWithValue) which are created on an index using the [`openKeyCursor`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBIndex-openKeyCursor) and [`openCursor`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBIndex-openCursor) methods respectively.

#### Key Ranges

Each cursor request needs an index against which to search and a range of keys to match, called a "[`key range`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-key-range)". Key ranges are instances of [`IDBKeyRange`](https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange) and the [contents](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-in-a-key-range) of a key range are characterized by their "bounds" and "direction".

In addition to use on indexes, key ranges can also be used as a key when getting (but not adding, putting or deleting) single values with object stores or indexes, in which case the programmer will recieve the first matching value for in that key range.

##### Key Range Direction

[`Direction`](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-direction) is the way in which you query the index: "next" (forward) or "previous" (backward). The default value is next. The programmer can dictate whether or not to include duplicate keys in the [request](http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#idl-def-IDBCursor) using two other directions: "next no duplicates" and "previous no duplicates". The programmer represents these directions using a number: 0 for "next", 1 for "next no duplicates", 2 for "previous" and 3 for "previous no duplicates".

##### Key Range Bounds

For example, say there's an index with 26 records containing the alphabet "A" to "Z". Here are some ways we could query it: 
* "only" "Z" would return just one object.
* lower "A", upper "Z" would return 24 objects
* lower "A", upper "Z", with "lowerOpen" and "upperOpen" set to `true` would return 26 objects
* lower "A", with "lowerOpen" set to `true` and the direction `next` would return 26 objects
* lower "A", with "lowerOpen" set to `true` and the direction `previous` would return 1 object
* lower "Z", with "lowerOpen" set to `true` would return one object
* lower "Z", with "lowerOpen" set to `false` would return no objects
* lower "Z", with "upperOpen" set to `false` would return no objects
* lower "A", upper "Z", with "lowerOpen" and "upperOpen" set to `false` would return 24 objects
* lower "A", upper "Z", with "lowerOpen" set to `true` and and "upperOpen" set to `false` would return 25 objects

### Getting Multiple Objects From A Database

#### Getting Multiple Objects From A Database Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar', index: 'baz', left: 'a', left_open: true })
		.then(dash.get.objects)
		.then(function(context) {
		    console.log('dash: all objects fetched', context.db, context.objectstore, context.idx, context.cursor, context.result);
		}, function(context) {
		    console.log('dash: object not fetched', context.db, context.objectstore, context.idx, context.cursor, context.error);
		}, function(context) {
		    console.log('dash: object was fetched', context.db, context.objectstore, context.idx, context.cursor, context.result);
		})
		.then(dash.close.database);

### Deleting Multiple Objects From A Database

#### Deleting Multiple Objects From A Database Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar', index: 'baz', left: 'a', left_open: true })
		.then(dash.delete.objects)
		.then(function(context) {
		    console.log('dash: all objects deleted', context.db, context.objectstore, context.idx, context.cursor, context.result);
		}, function(context) {
		    console.log('dash: object not deleted', context.db, context.objectstore, context.idx, context.cursor, context.error);
		}, function(context) {
		    console.log('dash: object was deleted', context.db, context.objectstore, context.idx, context.cursor, context.result);
		})
		.then(dash.close.database);


### Updating Multiple Objects In A Database

#### Updating Multiple Objects In A Database Example: Simple Case

	dash.open.database({ database: 'foo', store: 'bar', index: 'baz', left: 0, left_open: true, data: { updated: new Date().getTime() } })
		.then(dash.update.objects)
		.then(function(context) {
		    console.log('dash: all objects deleted', context.db, context.objectstore, context.idx, context.cursor, context.result);
		}, function(context) {
		    console.log('dash: object not deleted', context.db, context.objectstore, context.idx, context.cursor, context.error);
		}, function(context) {
		    console.log('dash: object was deleted', context.db, context.objectstore, context.idx, context.cursor, context.result);
		})
		.then(dash.close.database);


[1] Although `IndexedDB` is has very little to do with HTML5 standard beyond some shared nomenclaure, IDB is typically grouped with so-called "HTML5" technologies.
