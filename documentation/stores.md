[Object stores](http://www.w3.org/TR/IndexedDB/#dfn-object-store), like their name implies, store JavaScript objects as entries. We store entries in an object store and store object stores in a database. Only after opening a database can we list all the object stores in that database or do something with a store contained therein.

Via an object store we can access these entries by looking up objects using key paths on those objects, optionally enlisting the help of "indexes" to enable for various combinations of key lookups.

Object stores are instances of [`IDBObjectStore`](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore). After creation, object stores can be either `delete`ed, or `clear`ed of their values. Deleting an object store removes any indexes associated with it, whereas clearing an object store maintains any indexes.

##### Key Paths

Every store record must have a key by which it can be identified. This is called a "[`key path`](http://www.w3.org/TR/IndexedDB/#idl-def-IDBCursorWithValueSync#widl-IDBObjectStoreSync-keyPath)", and the regular key syntax rules apply. It's OK to omit a key path when creating an object store, in which case the keys are said to be "[`out-of-line`](http://www.w3.org/TR/IndexedDB/#dfn-out-of-line)" (vs. [`in-line`](http://www.w3.org/TR/IndexedDB/#dfn-in-line-keys)). In that case, IDB knows not from where to source it's key, and so the programmer must supply a key parameter with each object addition.  

The key path provided with an object store on creation works, in effect, like an "`index`"; however, unlike an index it's possible to delegate key generation to IndexedDB. The key is optional when putting an object into an object store if the "autoIncrement" parameter is set to true on object store creation. Otherwise the programmer will have to include a non-null key on each object added or put into the object store. 

The "autoIncrement" parameter creates a IDB ["key generator"](http://www.w3.org/TR/IndexedDB/#dfn-key-generator) that will create a monotonically increasing integer key automatically for each new object added to the store. For example, first object added to a database with the key "`foo`" and the `autoIncrement` set to `true`, will have the value `1` for its key path, the second value `2`, and so on for the object attribute `foo`.