### Object Stores

[Object stores](http://www.w3.org/TR/IndexedDB/#dfn-object-store), like their name implies, store JavaScript objects as entries. We store entries in an object store and store object stores in a database. Only after opening a database can we list all the object stores in that database or do something with a store contained therein.

Via an object store we can access these entries by looking up objects using key paths on those objects, optionally enlisting the help of "indexes" to enable for various combinations of key lookups.

Object stores are instances of [`IDBObjectStore`](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore). After creation, object stores can be either `delete`ed, or `clear`ed of their values. Deleting an object store removes any indexes associated with it, whereas clearing an object store maintains any indexes.
