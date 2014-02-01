
### Databases
IDBDatabase https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase
IDBOpenDBRequest https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest
IDBRequest https://developer.mozilla.org/en-US/docs/Web/API/IDBRequest
IDBTransaction https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction
https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction#VERSION_CHANGE

IDBVersionChangeEvent https://developer.mozilla.org/en-US/docs/Web/API/IDBVersionChangeEvent

IndexeDB (abbreviated "IDB") is a way to store data in the browser, exposed to JavaScript programmers as a programmatic interface or "API" in most HTML5-enabled browsers.[0][1] Using IDB, programmers can organize data and make it findable inside two types of containers, called "databases" and "object stores" in IndexeDB terminology. Object stores store "lists" of "records", where each record is breaks down into a "key" and "value". A key identifies a record and the value is what's being stored. The list of records associated iis represented by a JavaScript object, sorted by key, and otherwise much of the same rules apply as with JavaScript objects: for example, there can be only one value per key. 

IndexeDB is capable of storing most standard types of data and to copy values to the database uses something called the "structured clone algorithm".(http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-structured-clone-algorithm) IDB only stores JavaScript objects, but the values associated with keys on those objects that can be "cloned" include the basic JavaSript primitives and most complex object types: null values, booleans, numbers, strings, dates, arrays, other objects and advanced types such as RegExp, Blob, File, FileList and ImageData objects. The only standard object type IDB's structured clone algorithm cannot deal with are function objects. (https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm) Thus, JavaScript functions cannot be stored in their object form.  
Databases are the outermost container of data in IndexeDB.  Databases have a case-sensitive name (and a version) and under this name group together another type of data container called an "object store". With an open database you can create an object store or delete(http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#database-interface)

> database.create

Object stores (http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#object-store), like their name implies, store JavaScript objects, or data, called "entries". And via an object store we can access these entries by looking up "keys" and "indexes". We store entries in an object store and store object stores in a database.

> databases.show

To get to objects, you have to through object stores, and to get to object stores you have to go through databases. The first step in interaction with IndexedDB is almost always to open a database. To open a database we typically must already know the name of our database in advance of opening it*, or get a reference by creating a new one.

> database.open

Just as opening a database is the first step to doing anything in IndexedDB, closing a database is usually a good last step.

> database.close

A database's name can never change, but the database "version" is a positive integer that represents the layout of a database and its contents. When a database is open we can add to a database as many object stores as we'd like, but typically each database layout change requires a version change as well. In addition to creation of object stores, database operations that require a version change include deleting an object store and both creating and deleting indexes. Database versions are stored as 8-byte "int long long" in the underlying C programming language implementation of IDB (https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB#Opening_a_database) and can number anywhere between 1 and 18446744073709551615.

Unlike when deleting a database, reusing it by "migrating" it's schema doesn't destroy any data.

> database.delete

With an open database, we can also either list all the object stores in that database or do something with one of the object stores contained therein.

In a version change, the database's version number increases by at least one. Operations that trigger version changes include creating and deleting object stores and the entry "indexes" we create upon them.

> stores.show

In IDB, work tasked to a database is called a "transaction". A transaction is characterized by so-called "scope". Transaction scope, in turn, breaks down into two pieces: the thing (usually an object store) on which you want to do something and thing kind of thing you want to do. When creating a transaction against an opened database, a programmer names the object stores on which she'd like to operate, and optionally specify what type of transaction she'd like to create.

There are three types of transactions: "readwrite", "readonly" and "versionchange". The default is "readonly" because changing a data via a "write" is generally more expensive than to "read" that data. The granularity and providing of "readonly" vs. "readwrite" offers the programmer an the opportunity to speed up her code depending on her needs. The final transaction type, "versionchange", is used when changing the schema of a database.

> database.upgrade

Certain transactions return data from the database. These transactions are called "requests" and the values are always various combinations of object "keys" and "values".[3] Notably, requests are just that: the act of asking for something rather than the getting of it. Unlike many databases, requests are not fulfilled immediately, or "synconronously"; however, these non-immediate responses are rather "asyncronous", and the mechanism a programmer uses to await an asynconrous reponse is by coding a "callback" function IDB can invoke on various "events" such as a successful response.

There are various types of callbacks in IDB depending on the type of transaction. Requests generally have "onsuccess", "onerror and "onabort" callbacks. Others include "onupgradeneeded", "onclose" and "onblocked," sometimes seen when working with databases. Each event has a different meaning depending on the transaction, but for example "onsuccess", "onupgraded" are generally a good event for the programmer while "onerror", "onabort" and "onblocked" mean something went awry for him.

The way values are generally found in an object store is by using an "index". Indexes break down into two pieces: the way to find the data, called a "key path", and the value itself, found by its key.

> store.create

Every store record must have a key by which it can be identified. When creating an object store it's possible to provide a "key path" from which IDB can source it's key. If no key path is provided on object store creation, then a key must be specified with each addition. (http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#idl-def-IDBCursorWithValueSync#widl-IDBObjectStoreSync-keyPath) 

> store.show

Every store has a built-in index, but we can optionally (http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-options-object) delegate the key creation to IndexeDB. The optional optional "autoIncrement" parameter is supplied on object store creation with the non-default value of true. This create a so-called "key generator" (http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-key-generator) that automatically creates a monotonically increasing integer key for every new object created. The first object added to a database will have the value `1` for its key path, the second value `2`, and so on.

Another parameter under the programmer's control is the optional "unique" parameter, which tells the browser to enforce that all values that correspond to that key path are "unique".[4] (http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-multirow#dfn-unique). When true, IDB makes sure no two records have the same key value and will throw an error if the programmer tries to break the uniqueness guarantee.

The key path is optional when putting an object into an object store only if the "autoIncrement" parameter is set to true. Otherwise the programmer will have to include a non-null key on each object added or put into the object store. When the key is provided, a plain string will create a key on a shallow attribute. To specify the key among nested attributes in JavaScript objects, the key path syntax uses "dot notation". For example,  "first.second.third" would be the key path for an index on the "third" key in the following JavaScript object:

{ "first": {
    "second": {
      "third": [ "string value 1", "string value 2" ]
    }
  }
}

A key can be any of these types: String, Dates, floats and Arrays. 

It's possible to put indexes on array objects as well. When adding objects that have arrays as key values, it can be useful to set the optional "multirow" (http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-multirow) flag to `true` when creating a database. When set to the boolean value `true` an index record will be created on each object in a particular array. When `false`, a record is created for only the first. When an empty array is passed, no record is added.

> store.clear

> store.delete

> stores.show

Indexes can be created and deleted at any time so long as the database version increases which each change to the schema. The same options used when creating an index at object store creation, unique and multirow, can be used when create an index at any time. 

> index.create

Indexes are stored by key, and secondarily by the record values themselves, in ascending order.

> index.show

> index.delete

> index.exists

> indexes.show

When dealing with IDB, requesting one datum and multiple data typically happen different operations.

You can fetch one object at a time using a straightforward request it from the object store in which it resides using a key value to identify a record using the main key path. You can optionally use an index to fetch a single object at a time and, when doing so, optionally retrieve just the value of the key rather than return the entire object to which it's attached.

When querying for more than one object we must use indexes, and to use indexes we in complex manners we typically need to use a special type of request called a "cursor." When you want to ask for a range of data on an index, what you get back is not the data itself but rather a reference to a cursor, which offers asyncronous callbacks that fire when it retrieves objects from the store. When these callbacks fire, the programmer must either "continue" the cursor or abandon it. This process continues until either the programmer is done with the request or the cursor has exhausted the results from the request.

Each cursor request needs an index against which to search and a range of keys to match, called a "key range". Key ranges break down into its "bounds" and "direction". Bounds describe how the range of keys start and end, using the keywords "only", "lower", "upper". The latter two allow optional modifiers "lowerOpen" and "upperOpen". The modifiers default to false.

Direction is the way in which you query the index: "next" (forward) or "previous" (backward). The default value is next. The programmer can dictate whether or not to include duplicate keys in the request using two other directions (http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#idl-def-IDBCursor): "next no duplicates" and "previous no duplicates". The programmer represents these directions using a number: 0 for "next", 1 for "next no duplicates", 2 for "previous" and 3 for "previous no duplicates".

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

Key ranges can also be used as a key when getting (but not adding, putting or deleting) single values with object stores or indexes, in which case the programmer will recieve the first matching value for in that key range.

Using an index and a key range for that index, You can use cursors to get, put and delete records one at a time but in single request. Cursors are also capable of "advancing" (http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBCursor-advance) and, in effect, skip a number of objects in an index for a given key range. 


It's possible to "add" (create), "put" (add or update), "get" (read) and "delete" (destroy) single objects in an object store using a record key path and value associated with a store.

It's also possible to get, delete update"

The various uniqueness rules that you create when using indexes on an object store together apply to any entries (http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBObjectStore-add) added to that object store. 

> object.add

When you delete, get or put a single object you can specify the object store's primary key path in order to fetch it.

> object.delete
> object.get
> object.put

Cursors traverse an index matching a given "key range".

Two different types of cursors: IDBCursor and IDBCursorWithValue which are created on a X using openKeyCursor http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBIndex-openKeyCursor and openCursor http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBIndex-openCursor respectively  

> objects.get
> objects.update
> objects.delete


Aside: For data that doesn't need to be accessed via index, a lighter weight client-side technology such as localStorage or sessionStorage, or cookies may be more appropriate.*


Indexes are 


[0] Although IndexedDB is has very little to do with HTML5 standard beyond using the structured clone algorithm, IDB is typically grouped with so-called "HTML5" technologies.
[x] onversionchange (FF only?) onclosed (chrome only?)
[1] Chrome offers an exception via the non-standard but insanely useful webkitGetDatabaseNames() method.
[2] WebSQL is dead.
[3] The way the browsers themselves store the data depends on the vendor. Chrome uses a key/value technology called LevelDB, which Firefox uses the relational SQLLite database. Both store data in a mix of plaintext and binaryCK.
[4] When a key is not provided on object store creation, it's said that your store uses "out-of-line" keys.

Edit note: remove you anywhere it appears; don't seem condescending

API notes: databases are opened. stores and indexes are shown. using an open database and object store we can check if stores and indexes exist, but cannot check if database exist without opening them.

async is absolutely crucial to feasibility. but a pita to manage, thus promises.

contet object; less memory, fewer variables. some uncached lookups but worth it.

normalize target.result, result, request.result, target.result.value

Spec notes:
http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#widl-IDBObjectStore-put
error? "The object store uses in-line keys and the key parameter was provided." in-line means key would be provided manually. 

version change required:
create index
delete index
delete object store


database.close
database.create
database.delete
database.open
database.show
database.upgrade
databases.show

### Stores
IDBObjectStore https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
store.create
store.show
store.delete
stores.show
store.exists

### Indexes
IDBIndex https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex
index.create
index.exists
index.show
index.delete
indexes.show

### Entries
entry.add
entry.delete
entry.get
entry.put

### Cursors
IDBCursorWithValue https://developer.mozilla.org/en-US/docs/Web/API/IDBCursorWithValue
IDBKeyRange https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange

cursor.delete
cursor.get



{
  "Conforming user agent": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-conforming-user-agent",
  "default action": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-default-action",
  "propagation path": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-propagation-path",
  "document base URL": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#document-base-url",
  "event handler attributes": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#event-handler-attributes",
  "event handler event type": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#event-handler-event-type",
  "null": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-request-done",
  "origin": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-origin",
  "same origin": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-same-origin",
  "structured clone": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-structured-clone",
  "structured clone algorithm": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-structured-clone-algorithm",
  "task": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-task",
  "task source": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-task-source",
  "queue a task": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-queue-a-task",
  "database": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-database",
  "name": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-object-store-name",
  "version": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-version",
  "delete pending": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-delete-pending",
  "connection": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-transaction-connection",
  "closePending": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-closepending",
  "closed": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-database-close-1",
  "object store": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-object-store",
  "record": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-record",
  "key": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-cursor-key",
  "value": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-cursor-value",
  "key path": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-key-path",
  "in-line keys": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-in-line-keys",
  "out-of-line": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-out-of-line",
  "key generator": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-key-generator",
  "valid key": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-valid-key",
  "greater than": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-greater-than",
  "less than": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-less-than",
  "equal to": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-equal-to",
  "valid key path": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-valid-key-path",
  "evaluate a key path, run the\n            ": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-evaluate-key-path",
  "index": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-index",
  "referenced": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-referenced",
  "list of records": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-index-record-list",
  "referenced value": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-referenced-value",
  "unique": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-unique",
  "multirow": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-multirow",
  "transaction": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-transaction",
  "scope": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-scope",
  "active": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-active",
  "request list": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-request-list",
  "lifetime": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-transaction-lifetime",
  "created": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-transaction-create",
  "start": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-transaction-start",
  "abort": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-abort",
  "commit": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-commit",
  "finished": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#",
  "modes": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-mode",
  "READ_ONLY": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-read_only",
  "READ_WRITE": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-read_write",
  "VERSION_CHANGE": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-version_change",
  "request": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-request",
  "source": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-cursor-source",
  "result": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-request-result",
  "errorCode": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-request-errorcode",
  "request transaction": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-request-transaction",
  "placed": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-place-request",
  "key range": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-key-range",
  "in a ": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-in-a-key-range",
  "cursor": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-cursor",
  "range": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-range",
  "position": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-position",
  "direction": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-direction",
  "got value": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-got-value",
  "effective object store": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-effective-object-store",
  "effective key": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-effective-key",
  "object store position": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-object-store-position",
  "Options object": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-options-object",
  "database access task source": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#database-access-task-source",
  "steps for opening a database": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-opening-a-database",
  "create a ": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-create-a-transaction",
  "steps for committing a ": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-committing-a-transaction",
  "steps for aborting a ": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-aborting-a-transaction",
  "steps for asynchronously executing a request": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-asynchronously-executing-a-request",
  "steps for synchronously executing a request": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-synchronously-executing-a-request",
  "steps for extracting a key from a value using a key path": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-extracting-a-key-from-a-value-using-a-key-path",
  "steps for running a ": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-running-a-version_change-transaction",
  "steps for closing a database connection": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-closing-a-database-connection",
  "steps for deleting a ": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-deleting-a-database",
  "fire a success event": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-fire-a-success-event",
  "fire a error event at a ": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-fire-a-error-event",
  "steps for storing a record into an object store": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-storing-a-record-into-an-object-store",
  "steps for retrieving a value from an object store": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-retrieving-a-value-from-an-object-store",
  "steps for retrieving a referenced value from an index": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-retrieving-a-referenced-value-from-an-index",
  "steps for retrieving a value from an index": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-retrieving-a-value-from-an-index",
  "steps for deleting a record from an object store": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-deleting-a-record-from-an-object-store",
  "steps for clearing an object store": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-clearing-an-object-store",
  "steps for iterating a cursor": "http://www.w3.org/TR/2011/WD-IndexedDB-20110419/#dfn-steps-for-iterating-a-cursor"
}
