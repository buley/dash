#### Removing An Object Store

[`Delete`ing](http://www.w3.org/TR/IndexedDB/#widl-IDBObjectStore-delete) an object store removes the object store, any associated indexes and its content. A `delete` requires a "versionchange" type transaction.

##### Removing An Object Store Example: Simple Case

http://jsfiddle.net/dashdb/Zcw46/